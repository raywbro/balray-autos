"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export default function MyListingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchMyListings(user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  const fetchMyListings = async (userId: string) => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (listingId: string, imageUrls: string[]) => {
    const confirmed = confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(listingId);
    setMessage("");

    try {
      if (imageUrls && imageUrls.length > 0) {
        const fileNames = imageUrls
          .map((url) => {
            const parts = url.split("/car-images/");
            return parts.length > 1 ? parts[1] : null;
          })
          .filter(Boolean) as string[];

        if (fileNames.length > 0) {
          await supabase.storage.from("car-images").remove(fileNames);
        }
      }

      const { error } = await supabase.from("listings").delete().eq("id", listingId);
      if (error) throw error;

      setListings(listings.filter((item) => item.id !== listingId));
      setMessage("Listing deleted successfully.");
    } catch (err: any) {
      console.error(err);
      setMessage("Error deleting listing: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading your listings...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Your Account
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              My Listings
            </h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              Manage the vehicles you have listed on Balray Autos.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

          {message && (
            <div className="mb-6 rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 text-center text-sm font-bold text-[#8F7130]">
              {message}
            </div>
          )}

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">🚗</div>
              <h2 className="mt-6 text-2xl font-black text-[#34414A]">
                You have no listings yet
              </h2>
              <p className="mt-3 text-sm text-[#66737C]">
                Once you list a vehicle, it will appear here so you can manage it.
              </p>
              <Link
                href="/sell"
                className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md hover:brightness-105"
              >
                List Your First Vehicle
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {listings.map((listing) => {
                const title = `${listing.year ? listing.year + " " : ""}${listing.make} ${listing.model}`;
                const price = `R${Number(listing.price).toLocaleString()}`;
                const category = categoryMap[listing.category] || listing.category;
                const image =
                  listing.images && listing.images.length > 0
                    ? listing.images[0]
                    : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80";

                return (
                  <div
                    key={listing.id}
                    className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm"
                  >
                    <div className="grid gap-0 sm:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="relative aspect-[16/10] sm:aspect-auto sm:h-full bg-[#E9EDF0]">
                        <img src={image} alt={title} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex flex-col justify-between p-6">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-block rounded-full bg-[#FBF7EC] px-3 py-1 text-xs font-bold text-[#8F7130]">
                              {category}
                            </div>
                            {/* STATUS BADGE */}
                            {listing.status === "active" ? (
                              <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                ✓ Active
                              </div>
                            ) : (
                              <div className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                                ⏳ Pending Review
                              </div>
                            )}
                          </div>
                          <h3 className="mt-3 text-xl font-black text-[#34414A]">{title}</h3>
                          <div className="mt-2 text-2xl font-black text-[#9A7B37]">{price}</div>
                          <div className="mt-3 text-sm text-[#66737C]">
                            📍 {listing.location} • {listing.mileage || "N/A"}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={`/listing/${listing.id}`}
                            className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === listing.id}
                            onClick={() => handleDelete(listing.id, listing.images || [])}
                            className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === listing.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="w-full border-t border-[#D4DADF] bg-[#EEF1F3]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <img src="/balray-autos-logo.png" alt="Balray Autos" className="h-11 w-auto max-w-[180px] object-contain" />
              <p className="mt-3 text-sm text-[#68757D]">South African automotive marketplace.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <Link href="/" className="text-[#68757D] hover:text-[#9A7B37]">Home</Link>
              <Link href="/marketplace" className="text-[#68757D] hover:text-[#9A7B37]">Marketplace</Link>
              <Link href="/sell" className="text-[#68757D] hover:text-[#9A7B37]">Sell</Link>
              <Link href="/my-listings" className="text-[#68757D] hover:text-[#9A7B37]">My Listings</Link>
              <Link href="/contact" className="text-[#68757D] hover:text-[#9A7B37]">Contact</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[#D3D9DD] pt-5 text-center text-sm text-[#7A858C]">
            © {new Date().getFullYear()} Balray Autos (Pty) Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}