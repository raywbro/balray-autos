"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export default function AdminUserDetailPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [listings, setListings] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  // Ban modal
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  // Edit contact modal
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const userId = params.id as string;

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user: admin } } = await supabase.auth.getUser();
      if (!admin) {
        router.push("/login");
        return;
      }
      setCurrentAdmin(admin);

      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", admin.id)
        .single();

      if (!adminProfile || adminProfile.role !== "admin") {
        router.push("/");
        return;
      }

      await fetchUserAndListings();
      setLoading(false);
    };

    if (userId) checkAdminAndFetch();
  }, [userId, router, supabase]);

  const fetchUserAndListings = async () => {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setMessage("User not found.");
      return;
    }

    setUser(profile);
    setEditPhone(profile.phone || "");

    // Try to fetch email from an admin-only view if available.
    // Fallback: search listings to get the seller_email
    const { data: userListings } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setListings(userListings || []);

    if (userListings && userListings.length > 0) {
      setAuthEmail(userListings[0].seller_email || "");
      setEditEmail(userListings[0].seller_email || "");
    } else {
      setAuthEmail("");
      setEditEmail("");
    }
  };

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleBanToggle = async () => {
    if (!user) return;

    if (user.banned) {
      const { error } = await supabase
        .from("profiles")
        .update({ banned: false, banned_at: null, banned_reason: null })
        .eq("id", userId);

      if (error) {
        showMessage("Error unbanning: " + error.message, "error");
      } else {
        setUser({ ...user, banned: false, banned_at: null, banned_reason: null });
        showMessage("User has been unbanned.");
      }
    } else {
      setBanReason("");
      setBanModalOpen(true);
    }
  };

  const confirmBan = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: banReason || "Violated terms of service",
      })
      .eq("id", userId);

    if (error) {
      showMessage("Error banning: " + error.message, "error");
    } else {
      setUser({
        ...user,
        banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: banReason || "Violated terms of service",
      });
      showMessage("User has been banned.");
    }
    setBanModalOpen(false);
  };

  const handleRoleToggle = async () => {
    if (!user) return;
    if (user.id === currentAdmin?.id) {
      showMessage("You cannot change your own role.", "error");
      return;
    }

    const newRole = user.role === "admin" ? "user" : "admin";
    const confirmed = confirm(
      `Are you sure you want to make this user ${newRole === "admin" ? "an ADMIN" : "a regular user"}?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      showMessage("Error updating role: " + error.message, "error");
    } else {
      setUser({ ...user, role: newRole });
      showMessage(`User role changed to ${newRole}.`);
    }
  };

  const handleOpenEditContact = () => {
    setEditPhone(user?.phone || "");
    setEditEmail(authEmail || "");
    setEditError("");
    setEditContactOpen(true);
  };

  const handleSaveContact = async () => {
    setEditError("");
    setEditSaving(true);

    try {
      // Update phone in profiles
      if (editPhone && editPhone !== user.phone) {
        let cleaned = editPhone.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (formatted.startsWith("0")) {
          formatted = "+27" + formatted.substring(1);
        } else if (!formatted.startsWith("27")) {
          formatted = "+27" + formatted;
        } else {
          formatted = "+" + formatted;
        }

        // Check duplicate
        const { data: exists } = await supabase.rpc("check_phone_exists", {
          phone_input: formatted,
        });
        if (exists && formatted !== user.phone) {
          setEditError("That phone number is already used by another account.");
          setEditSaving(false);
          return;
        }

        const { error: phoneErr } = await supabase
          .from("profiles")
          .update({ phone: formatted })
          .eq("id", userId);

        if (phoneErr) throw phoneErr;

        // Also update all their listings so the phone matches
        await supabase
          .from("listings")
          .update({ seller_phone: formatted })
          .eq("user_id", userId);

        setUser({ ...user, phone: formatted });
      }

      // Update email if changed - via admin API
      if (editEmail && editEmail !== authEmail) {
        const res = await fetch("/api/admin/update-user-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, newEmail: editEmail }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update email");
        }

        // Sync listings' seller_email
        await supabase
          .from("listings")
          .update({ seller_email: editEmail })
          .eq("user_id", userId);

        setAuthEmail(editEmail);
      }

      showMessage("User contact details updated successfully.");
      setEditContactOpen(false);
    } catch (err: any) {
      setEditError(err.message || "Update failed");
    } finally {
      setEditSaving(false);
    }
  };

  const handleApproveListing = async (listing: any) => {
    const confirmed = confirm("Approve this listing? It will go live for 30 days.");
    if (!confirmed) return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const { error } = await supabase
      .from("listings")
      .update({ status: "active", expires_at: expiryDate.toISOString() })
      .eq("id", listing.id);

    if (error) {
      showMessage("Error approving: " + error.message, "error");
    } else {
      setListings(
        listings.map((l) =>
          l.id === listing.id
            ? { ...l, status: "active", expires_at: expiryDate.toISOString() }
            : l
        )
      );
      showMessage("Listing approved.");
    }
  };

  const handleFeatureToggle = async (listing: any) => {
    const newValue = !listing.featured;
    const { error } = await supabase
      .from("listings")
      .update({ featured: newValue })
      .eq("id", listing.id);

    if (error) {
      showMessage("Error: " + error.message, "error");
    } else {
      setListings(
        listings.map((l) => (l.id === listing.id ? { ...l, featured: newValue } : l))
      );
      showMessage(newValue ? "Listing featured." : "Listing un-featured.");
    }
  };

  const handleDeleteListing = async (listing: any) => {
    const confirmed = confirm(
      `Delete "${listing.year} ${listing.make} ${listing.model}" permanently?`
    );
    if (!confirmed) return;

    if (listing.images && listing.images.length > 0) {
      const fileNames = listing.images
        .map((url: string) => {
          const parts = url.split("/car-images/");
          return parts.length > 1 ? parts[1] : null;
        })
        .filter(Boolean) as string[];

      if (fileNames.length > 0) {
        await supabase.storage.from("car-images").remove(fileNames);
      }
    }

    const { error } = await supabase.from("listings").delete().eq("id", listing.id);

    if (error) {
      showMessage("Error deleting: " + error.message, "error");
    } else {
      setListings(listings.filter((l) => l.id !== listing.id));
      showMessage("Listing deleted.");
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading user profile...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-6 text-3xl font-black text-[#34414A]">
            User Not Found
          </h1>
          <Link
            href="/admin/users"
            className="mt-8 inline-block rounded-xl bg-[#34414A] px-6 py-4 font-bold text-white"
          >
            Back to Users
          </Link>
        </div>
      </main>
    );
  }

  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const activeListings = listings.filter((l) => l.status === "active").length;
  const pendingListings = listings.filter((l) => l.status === "pending").length;
  const soldListings = listings.filter((l) => l.status === "sold").length;
  const featuredListings = listings.filter((l) => l.featured).length;

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#9A7B37] hover:underline"
          >
            ← Back to All Users
          </Link>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl border p-4 text-center text-sm font-bold ${
              messageType === "success"
                ? "border-[#D3B86A]/50 bg-[#FBF7EC] text-[#8F7130]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm">
          <div className="border-b-4 border-[#B08D3C] bg-gradient-to-br from-[#34414A] to-[#4A5962] px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] via-[#D2B66A] to-[#A47F32] text-3xl font-black text-white shadow-md">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black text-white sm:text-3xl">
                      {user.full_name || "Unnamed User"}
                    </h1>
                    {user.role === "admin" && (
                      <span className="rounded-full bg-[#D2B66A] px-3 py-1 text-xs font-bold text-[#34414A]">
                        ADMIN
                      </span>
                    )}
                    {user.banned && (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        🚫 BANNED
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-[#D9DEE2]">
                    📱 {user.phone || "No phone on file"}
                  </div>
                  {authEmail && (
                    <div className="mt-1 text-sm text-[#D9DEE2]">
                      ✉️ {authEmail}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-[#D9DEE2]/70">
                    User ID: {user.id}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleOpenEditContact}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  ✏️ Edit Contact
                </button>
                <button
                  onClick={handleRoleToggle}
                  disabled={user.id === currentAdmin?.id}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                </button>
                <button
                  onClick={handleBanToggle}
                  disabled={user.id === currentAdmin?.id}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    user.banned
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {user.banned ? "✓ Unban User" : "🚫 Ban User"}
                </button>
              </div>
            </div>

            {user.banned && user.banned_reason && (
              <div className="mt-6 rounded-xl border border-red-400/40 bg-red-500/20 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-200">
                  Ban Reason
                </div>
                <div className="mt-1 text-sm text-white">{user.banned_reason}</div>
                {user.banned_at && (
                  <div className="mt-2 text-xs text-red-200/70">
                    Banned on {formatDate(user.banned_at)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-xl bg-[#F7F8F9] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                Total Listings
              </div>
              <div className="mt-1 text-2xl font-black text-[#34414A]">
                {listings.length}
              </div>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                Active
              </div>
              <div className="mt-1 text-2xl font-black text-green-700">
                {activeListings}
              </div>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                Pending
              </div>
              <div className="mt-1 text-2xl font-black text-yellow-700">
                {pendingListings}
              </div>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                Sold
              </div>
              <div className="mt-1 text-2xl font-black text-blue-700">
                {soldListings}
              </div>
            </div>
            <div className="rounded-xl bg-[#FBF7EC] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                Featured
              </div>
              <div className="mt-1 text-2xl font-black text-[#8F7130]">
                ⭐ {featuredListings}
              </div>
            </div>
            <div className="rounded-xl bg-[#F7F8F9] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                Total Views
              </div>
              <div className="mt-1 text-2xl font-black text-[#34414A]">
                {totalViews}
              </div>
            </div>
          </div>

          <div className="border-t border-[#E1E5E8] p-6 sm:p-8">
            <h2 className="text-lg font-black text-[#34414A] mb-4">
              Account Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-[#F7F8F9] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  Full Name
                </div>
                <div className="mt-1 text-sm font-bold text-[#34414A]">
                  {user.full_name || "Not set"}
                </div>
              </div>
              <div className="rounded-xl bg-[#F7F8F9] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  Phone
                </div>
                <div className="mt-1 break-all text-sm font-bold text-[#34414A]">
                  {user.phone || "Not set"}
                </div>
              </div>
              <div className="rounded-xl bg-[#F7F8F9] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  Email
                </div>
                <div className="mt-1 break-all text-sm font-bold text-[#34414A]">
                  {authEmail || "Not available"}
                </div>
              </div>
              <div className="rounded-xl bg-[#F7F8F9] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  Joined
                </div>
                <div className="mt-1 text-sm font-bold text-[#34414A]">
                  {formatDate(user.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Their Listings
            </div>
            <h2 className="mt-1 text-2xl font-black text-[#34414A]">
              All Adverts ({listings.length})
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
              <div className="text-4xl">🚗</div>
              <p className="mt-3 text-sm text-[#66737C]">
                This user hasn&apos;t posted any listings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const title = `${listing.year ? listing.year + " " : ""}${listing.make} ${listing.model}`;
                const image =
                  listing.images && listing.images.length > 0
                    ? listing.images[0]
                    : "/placeholder.png";
                const isExpired =
                  listing.expires_at && new Date(listing.expires_at) < new Date();

                return (
                  <div
                    key={listing.id}
                    className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between ${
                      listing.featured
                        ? "border-2 border-[#B08D3C] ring-2 ring-[#B08D3C]/20"
                        : "border-[#D5DBDF]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={image}
                        alt={title}
                        className="h-20 w-28 flex-shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-[#34414A]">
                            {title}
                          </h3>
                          {listing.featured && (
                            <span className="rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-2 py-0.5 text-xs font-bold text-white">
                              ⭐ Featured
                            </span>
                          )}
                          {listing.status === "active" ? (
                            isExpired ? (
                              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-700">
                                ⌛ Expired
                              </span>
                            ) : (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                                Active
                              </span>
                            )
                          ) : listing.status === "sold" ? (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                              🎉 Sold
                            </span>
                          ) : (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-[#9A7B37]">
                          R{Number(listing.price).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-[#66737C]">
                          📁 {categoryMap[listing.category] || listing.category} • 📍 {listing.location} • 👁️ {listing.views || 0} views
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/listing/${listing.id}`}
                        target="_blank"
                        className="rounded-xl border border-[#B08D3C] bg-white px-4 py-2.5 text-xs font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                      >
                        View
                      </Link>
                      {listing.status !== "active" && (
                        <button
                          onClick={() => handleApproveListing(listing)}
                          className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleFeatureToggle(listing)}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold ${
                          listing.featured
                            ? "border border-[#B08D3C] bg-[#FBF7EC] text-[#8F7130]"
                            : "bg-gradient-to-r from-[#8F7130] to-[#B08D3C] text-white"
                        }`}
                      >
                        {listing.featured ? "★ Un-feature" : "☆ Feature"}
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listing)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BAN MODAL */}
      {banModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
                🚫
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#34414A]">
                Ban This User?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                They won&apos;t be able to log in or post new listings.
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-[#34414A]">
                Reason (optional)
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder="e.g. Fraudulent listing, harassment, spam..."
                className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBanModalOpen(false)}
                className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
              >
                Cancel
              </button>
              <button
                onClick={confirmBan}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CONTACT MODAL */}
      {editContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#34414A]">
                  Edit Contact
                </h2>
                <p className="mt-1 text-xs text-[#89939A]">
                  Changes here apply to all of their adverts.
                </p>
              </div>
              <button
                onClick={() => setEditContactOpen(false)}
                className="text-2xl leading-none text-[#89939A] hover:text-[#34414A]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#34414A]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 082 123 4567"
                  className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#34414A]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                />
                <p className="mt-2 text-xs text-[#89939A]">
                  Changing the email updates their login and all their adverts.
                </p>
              </div>

              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                  {editError}
                </div>
              )}

              <div className="rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-3 text-xs text-[#8F7130]">
                ⓘ Phone uniqueness is checked. Email change uses Supabase Admin API (requires <code>SUPABASE_SERVICE_ROLE_KEY</code>).
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditContactOpen(false)}
                  className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContact}
                  disabled={editSaving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-4 py-3 text-sm font-bold text-white hover:brightness-105 disabled:opacity-60"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}