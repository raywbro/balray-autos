"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import HeroBanner from "@/app/components/HeroBanner";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export default function HomePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchHomeListings = async () => {
      try {
        const now = new Date().toISOString();

        const { data: subscribedProfiles } = await supabase
          .from("profiles")
          .select("id")
          .neq("subscription_tier", "none")
          .gt("subscription_expires_at", now);

        const subscribedIds = new Set(
          (subscribedProfiles || []).map((p) => p.id)
        );

        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "active")
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .order("created_at", { ascending: false })
          .limit(60);

        if (error) {
          console.error("Home fetch error:", error);
          setLoading(false);
          return;
        }

        const formatted = (data || []).map((item) => ({
          id: item.id,
          userId: item.user_id,
          title: `${item.year ? item.year + " " : ""}${item.make} ${item.model}`,
          category: categoryMap[item.category] || item.category,
          price: `R${Number(item.price).toLocaleString()}`,
          year: item.year ? item.year.toString() : "N/A",
          mileage: item.mileage || "N/A",
          location: item.location,
          featured: item.featured || false,
          isSubscribedSeller: subscribedIds.has(item.user_id),
          views: item.views || 0,
          createdAt: item.created_at,
          image:
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
        }));

        const sorted = [...formatted].sort((a, b) => {
          if (a.isSubscribedSeller && !b.isSubscribedSeller) return -1;
          if (!a.isSubscribedSeller && b.isSubscribedSeller) return 1;
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setListings(sorted.slice(0, 6));
        setFeaturedListings(
          sorted.filter((l) => l.featured || l.isSubscribedSeller).slice(0, 6)
        );
      } catch (err) {
        console.error("Home fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeListings();

    const channel = supabase
      .channel("home-listings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => fetchHomeListings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = [
    { name: "Cars & SUVs", slug: "cars", icon: "🚗" },
    { name: "Bakkies & 4x4s", slug: "bakkies", icon: "🛻" },
    { name: "Motorcycles", slug: "motorcycles", icon: "🏍️" },
    { name: "Trucks & Commercial", slug: "trucks", icon: "🚚" },
    { name: "Machinery & Equipment", slug: "machinery", icon: "🚜" },
    { name: "Parts & Accessories", slug: "parts", icon: "🔧" },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <HeroBanner
        subtitle="Buy and sell cars, bakkies, motorcycles, trucks, machinery and parts across South Africa. Trusted sellers. Real vehicles. Instant contact."
        primaryCTA={{ label: "Browse Marketplace", href: "/marketplace" }}
        secondaryCTA={{ label: "Sell Your Vehicle", href: "/sell" }}
      />

      <section className="w-full bg-[#F7F8F9]">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Browse Categories
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Find What You&apos;re Looking For
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/marketplace?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#D5DBDF] bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C] hover:shadow-md"
              >
                <div className="text-4xl transition group-hover:scale-110">
                  {cat.icon}
                </div>
                <div className="text-sm font-bold text-[#34414A]">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredListings.length > 0 && (
        <section className="w-full bg-gradient-to-b from-white to-[#F7F8F9]">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                  Featured & Boosted
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
                  Top Picks
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="self-start rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
              >
                View All →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-[#F7F8F9]">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                Fresh Arrivals
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
                Latest Listings
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="self-start rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center animate-pulse">
              <div className="text-4xl">🚗</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">
                Loading listings...
              </h3>
            </div>
          ) : listings.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
              <div className="text-4xl">🔍</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">
                No listings available yet
              </h3>
              <p className="mt-2 text-sm text-[#66737C]">
                Be the first to list your vehicle.
              </p>
              <Link
                href="/sell"
                className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-sm font-bold text-white"
              >
                Sell Your Vehicle
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-16">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Selling a Vehicle?
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Put your vehicle in front of potential buyers.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">
              Submit your vehicle, machinery or automotive product to Balray
              Autos and connect with potential buyers across South Africa.
            </p>
          </div>
          <Link
            href="/sell"
            className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-7 py-4 text-center font-bold text-white shadow-md sm:w-auto"
          >
            List Your Vehicle
          </Link>
        </div>
      </section>
    </main>
  );
}

function ListingCard({ listing }: { listing: any }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 ${
        listing.isSubscribedSeller
          ? "border-2 border-[#8F7130]"
          : listing.featured
          ? "border-2 border-[#B08D3C]"
          : "border border-[#D5DBDF] hover:border-[#B08D3C]/60"
      }`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-[#34414A]/90 px-3 py-2 text-xs font-bold text-white backdrop-blur">
          {listing.category}
        </div>
        {listing.isSubscribedSeller && (
          <div className="absolute left-4 top-14 rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-3 py-2 text-xs font-bold text-white shadow-md">
            🚀 BOOSTED
          </div>
        )}
        {!listing.isSubscribedSeller && listing.featured && (
          <div className="absolute left-4 top-14 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-2 text-xs font-bold text-white shadow-md">
            ⭐ FEATURED
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 min-h-[56px] text-xl font-extrabold leading-7 text-[#34414A]">
          {listing.title}
        </h3>

        <div className="mt-3 text-2xl font-black text-[#9A7B37]">
          {listing.price}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
            <div className="text-[#89939A]">Year</div>
            <div className="mt-1 font-bold text-[#34414A]">{listing.year}</div>
          </div>
          <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
            <div className="text-[#89939A]">Mileage</div>
            <div className="mt-1 font-bold text-[#34414A]">
              {listing.mileage}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-[#E1E5E8] pt-4 text-sm text-[#66737C]">
          📍 {listing.location}
        </div>
      </div>
    </Link>
  );
}