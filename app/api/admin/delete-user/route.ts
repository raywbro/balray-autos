import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, reason } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Verify the caller is an admin
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user: admin } } = await supabaseAuth.auth.getUser();

    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: adminProfile } = await supabaseAuth
      .from("profiles")
      .select("role")
      .eq("id", admin.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 });
    }

    // Admin client with service role — can do anything
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Get the user's profile so we can capture email + phone for the ban list
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

    const email = authUser?.user?.email || targetProfile?.email || null;
    const phone = targetProfile?.phone || null;

    // 2. Get all listings so we can delete their storage files
    const { data: listings } = await supabaseAdmin
      .from("listings")
      .select("id, images, video_url")
      .eq("user_id", userId);

    // 3. Delete image files from storage
    if (listings && listings.length > 0) {
      const imagePaths: string[] = [];
      const videoPaths: string[] = [];

      for (const listing of listings) {
        if (listing.images && Array.isArray(listing.images)) {
          for (const url of listing.images) {
            const parts = url.split("/car-images/");
            if (parts[1]) imagePaths.push(parts[1]);
          }
        }
        if (listing.video_url) {
          const parts = listing.video_url.split("/car-videos/");
          if (parts[1]) videoPaths.push(parts[1]);
        }
      }

      if (imagePaths.length > 0) {
        await supabaseAdmin.storage.from("car-images").remove(imagePaths);
      }
      if (videoPaths.length > 0) {
        await supabaseAdmin.storage.from("car-videos").remove(videoPaths);
      }
    }

    // 4. Delete listings
    await supabaseAdmin.from("listings").delete().eq("user_id", userId);

    // 5. Delete reviews by this user
    await supabaseAdmin.from("listing_reviews").delete().eq("user_id", userId);

    // 6. Delete favorites
    await supabaseAdmin.from("favorites").delete().eq("user_id", userId);

    // 7. Add to banned_users so they can't re-register
    if (email || phone) {
      await supabaseAdmin.from("banned_users").insert({
        email: email,
        phone: phone,
        reason: reason || "Removed by admin",
        banned_by: admin.id,
      });
    }

    // 8. Delete the profile row
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 9. Delete the auth user (this frees the email)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authDeleteError) {
      console.error("Auth delete error:", authDeleteError);
      return NextResponse.json(
        {
          error:
            "Profile deleted, but auth user could not be removed: " +
            authDeleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email,
      phone,
      listingsDeleted: listings?.length || 0,
    });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}