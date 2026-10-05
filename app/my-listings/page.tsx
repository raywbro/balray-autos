"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);
      await fetchListings(user.id);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchListings = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Fetch error:", error);
      return;
    }
    setListings(data || []);
  };

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleDelete = async (
    id: string,
    images?: string[],
    videoUrl?: string | null
  ) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    const supabase = createClient();
    try {
      if (images && images.length > 0) {
        const imagePaths = images
          .map((url) => {
            const parts = url.split("/car-images/");
            return parts[1] || null;
          })
          .filter(Boolean) as string[];
        if (imagePaths.length > 0) {
          await supabase.storage.from("car-images").remove(imagePaths);
        }
      }
      if (videoUrl) {
        const parts = videoUrl.split("/car-videos/");
        const videoPath = parts[1];
        if (videoPath) {
          await supabase.storage.from("car-videos").remove([videoPath]);
        }
      }
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) {
        showMessage("Error deleting: " + error.message, "error");
        setDeletingId(null);
        return;
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
      showMessage("✓ Listing deleted.");
    } catch (err: any) {
      showMessage("Error: " + (err.message || "Something went wrong"), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkSold = async (id: string) => {
    if (!confirm("Mark this listing as sold?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", id);
    if (error) {
      showMessage("Error: " + error.message, "error");
      return;
    }
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "sold" } : l))
    );
    showMessage("✓ Marked as sold.");
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              My Listings
            </div>
            <h1 className="mt-2 text-3xl font-black text-[#34414A]">
              Manage Your Adverts
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href="/sell"
            className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-center text-sm font-bold text-white shadow-md"
          >
            + New Listing
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

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
            <div className="text-4xl">🚗</div>
            <h2 className="mt-4 text-xl font-black text-[#34414A]">
              No listings yet
            </h2>
            <Link
              href="/sell"
              className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-sm font-bold text-white"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => {
              const expired =
                item.expires_at && new Date(item.expires_at) < new Date();
              const isPending = item.status === "pending";
              const isActive = item.status === "active" && !expired;
              const isSold = item.status === "sold";

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    isPending ? "border-yellow-300" : "border-[#D5DBDF]"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.images?.[0] || "/placeholder.png"}
                        alt={item.model}
                        className="h-20 w-28 rounded-xl bg-[#E9EDF0] object-cover"
                      />
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-[#34414A]">
                            {item.year} {item.make} {item.model}
                          </h3>
                          {isActive && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                              Active
                            </span>
                          )}
                          {isPending && (
                            <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-bold text-yellow-800">
                              ⏳ Pending Review
                            </span>
                          )}
                          {isSold && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                              Sold
                            </span>
                          )}
                          {expired && (
                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-700">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#9A7B37]">
                          R{Number(item.price).toLocaleString()}
                        </p>
                        <p className="text-xs text-[#66737C] mt-1">
                          📍 {item.location} • 👁️ {item.views || 0} views
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/listing/${item.id}`}
                        className="rounded-xl border border-[#B08D3C] bg-white px-4 py-2.5 text-xs font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                      >
                        View
                      </Link>

                      {!isSold && (
                        <Link
                          href={`/edit-listing/${item.id}`}
                          className="rounded-xl bg-[#34414A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#4A5962]"
                        >
                          ✏️ Edit
                        </Link>
                      )}

                      {isActive && (
                        <button
                          onClick={() => handleMarkSold(item.id)}
                          className="rounded-xl border border-[#B08D3C] bg-[#FBF7EC] px-4 py-2.5 text-xs font-bold text-[#8F7130] hover:bg-[#F5EDD8]"
                        >
                          Mark Sold
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleDelete(item.id, item.images, item.video_url)
                        }
                        disabled={deletingId === item.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}