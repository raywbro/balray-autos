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

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch all of the seller's listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!listingsData || listingsData.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      setListings(listingsData);

      // Fetch favorites counts for each listing
      const listingIds = listingsData.map((l) => l.id);
      const { data: favsData } = await supabase
        .from("favorites")
        .select("listing_id")
        .in("listing_id", listingIds);

      const counts: Record<string, number> = {};
      (favsData || []).forEach((f) => {
        counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
      });
      setFavoriteCounts(counts);

      setLoading(false);
    };

    loadAnalytics();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading your analytics...
        </div>
      </main>
    );
  }

  if (!user) return null;

  // Calculate overall stats
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === "active").length;
  const soldListings = listings.filter((l) => l.status === "sold").length;
  const pendingListings = listings.filter((l) => l.status === "pending").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalFavorites = Object.values(favoriteCounts).reduce((sum, n) => sum + n, 0);
  const avgViewsPerListing = totalListings > 0 ? Math.round(totalViews / totalListings) : 0;
  const conversionRate = totalViews > 0 ? ((totalFavorites / totalViews) * 100).toFixed(1) : "0.0";

  // Top 5 listings by views
  const topListings = [...listings]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Recent price drops (listings with previous_price)
  const priceDrops = listings.filter(
    (l) => l.previous_price && Number(l.previous_price) > Number(l.price)
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Seller Dashboard
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              Your Performance
            </h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              Track how your listings are performing on Balray Autos.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

          {totalListings === 0 ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">📊</div>
              <h2 className="mt-6 text-2xl font-black text-[#34414A]">
                No data yet
              </h2>
              <p className="mt-3 text-sm text-[#66737C]">
                Once you list a vehicle, your performance stats will appear here.
              </p>
              <Link
                href="/sell"
                className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md hover:brightness-105"
              >
                List Your First Vehicle
              </Link>
            </div>
          ) : (
            <>
              {/* STAT CARDS */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#34414A] to-[#4A5962]" />
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                        Total Views
                      </div>
                      <div className="text-2xl">👁️</div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-[#34414A]">
                      {totalViews.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-[#89939A]">
                      Avg {avgViewsPerListing} per listing
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm">
                  <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-red-600" />
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                        Favorites
                      </div>
                      <div className="text-2xl">❤️</div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-[#34414A]">
                      {totalFavorites}
                    </div>
                    <div className="mt-1 text-xs text-[#89939A]">
                      {conversionRate}% of views saved
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm">
                  <div className="h-1.5 w-full bg-gradient-to-r from-green-600 to-green-700" />
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                        Active
                      </div>
                      <div className="text-2xl">✓</div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-[#34414A]">
                      {activeListings}
                    </div>
                    <div className="mt-1 text-xs text-[#89939A]">
                      {pendingListings > 0 && `${pendingListings} pending • `}
                      {soldListings > 0 && `${soldListings} sold`}
                      {pendingListings === 0 && soldListings === 0 && "No other"}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C]" />
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                        Total Listings
                      </div>
                      <div className="text-2xl">🚗</div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-[#34414A]">
                      {totalListings}
                    </div>
                    <div className="mt-1 text-xs text-[#89939A]">
                      All-time listings
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP PERFORMERS */}
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {/* TOP LISTINGS */}
                <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-[#34414A] mb-1">
                    🔥 Your Top Performing Listings
                  </h2>
                  <p className="text-xs text-[#66737C] mb-5">
                    Ranked by number of views.
                  </p>

                  {topListings.length === 0 ? (
                    <p className="text-sm text-[#89939A]">No listings yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {topListings.map((item, index) => {
                        const title = `${item.year ? item.year + " " : ""}${item.make} ${item.model}`;
                        const price = `R${Number(item.price).toLocaleString()}`;
                        const image =
                          item.images && item.images.length > 0
                            ? item.images[0]
                            : "/placeholder.png";

                        return (
                          <Link
                            key={item.id}
                            href={`/listing/${item.id}`}
                            className="flex items-center gap-4 rounded-xl border border-[#E1E5E8] p-3 transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FBF7EC] text-sm font-black text-[#8F7130]">
                              {index + 1}
                            </div>
                            <img
                              src={image}
                              alt={title}
                              className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-bold text-[#34414A]">
                                {title}
                              </div>
                              <div className="mt-0.5 text-xs font-bold text-[#9A7B37]">
                                {price}
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                              <div className="rounded-full bg-[#F7F8F9] px-3 py-1 text-xs font-bold text-[#34414A]">
                                👁️ {item.views || 0}
                              </div>
                              {favoriteCounts[item.id] > 0 && (
                                <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                  ❤️ {favoriteCounts[item.id]}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* PRICE DROPS */}
                <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-[#34414A] mb-1">
                    💰 Recent Price Drops
                  </h2>
                  <p className="text-xs text-[#66737C] mb-5">
                    Listings where you&apos;ve lowered the price.
                  </p>

                  {priceDrops.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#D5DBDF] bg-[#F7F8F9] p-8 text-center">
                      <div className="text-3xl">📉</div>
                      <p className="mt-3 text-sm text-[#66737C]">
                        You haven&apos;t dropped any prices yet.
                      </p>
                      <p className="mt-1 text-xs text-[#89939A]">
                        Lowering prices increases views by up to 40% on average.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {priceDrops.slice(0, 5).map((item) => {
                        const title = `${item.year ? item.year + " " : ""}${item.make} ${item.model}`;
                        const currentPrice = Number(item.price);
                        const oldPrice = Number(item.previous_price);
                        const savings = oldPrice - currentPrice;
                        const percentOff = Math.round((savings / oldPrice) * 100);
                        const image =
                          item.images && item.images.length > 0
                            ? item.images[0]
                            : "/placeholder.png";

                        return (
                          <Link
                            key={item.id}
                            href={`/listing/${item.id}`}
                            className="flex items-center gap-4 rounded-xl border border-[#E1E5E8] p-3 transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
                          >
                            <img
                              src={image}
                              alt={title}
                              className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-bold text-[#34414A]">
                                {title}
                              </div>
                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xs text-[#89939A] line-through">
                                  R{oldPrice.toLocaleString()}
                                </span>
                                <span className="text-sm font-black text-[#9A7B37]">
                                  R{currentPrice.toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-0.5 text-xs font-bold text-green-600">
                                Save R{savings.toLocaleString()} (-{percentOff}%)
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* TIPS */}
              <div className="mt-10 rounded-2xl border border-[#D3B86A]/50 bg-gradient-to-br from-[#FBF7EC] to-[#F7F8F9] p-6 sm:p-8">
                <h2 className="text-xl font-black text-[#8F7130] mb-4">
                  💡 Tips to Sell Faster
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl bg-white/70 p-4">
                    <div className="text-xl">📸</div>
                    <div className="mt-2 text-sm font-bold text-[#34414A]">
                      Add more photos
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#66737C]">
                      Listings with 5+ photos get up to 3x more views.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-4">
                    <div className="text-xl">💬</div>
                    <div className="mt-2 text-sm font-bold text-[#34414A]">
                      Respond quickly
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#66737C]">
                      Buyers contact sellers who reply within 1 hour first.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-4">
                    <div className="text-xl">💰</div>
                    <div className="mt-2 text-sm font-bold text-[#34414A]">
                      Price competitively
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#66737C]">
                      Check similar listings and price within 10% to sell faster.
                    </p>
                  </div>
                </div>
              </div>
            </>
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
              <Link href="/my-listings" className="text-[#68757D] hover:text-[#9A7B37]">My Listings</Link>
              <Link href="/analytics" className="text-[#68757D] hover:text-[#9A7B37]">Analytics</Link>
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