"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export default function RecentlyViewedSection() {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("balray_recently_viewed") || "[]");
        if (!stored || stored.length === 0) {
          setLoading(false);
          return;
        }

        const now = new Date().toISOString();
        const { data } = await supabase
          .from("public_listings")
          .select("*")
          .in("id", stored)
          .eq("status", "active")
          .or(`expires_at.is.null,expires_at.gt.${now}`);

        const ordered = stored
          .map((id: string) => (data || []).find((item: any) => item.id === id))
          .filter(Boolean);

        const formatted = ordered.map((item: any) => ({
          id: item.id,
          title: `${item.year ? item.year + " " : ""}${item.make} ${item.model}`,
          price: `R${Number(item.price).toLocaleString()}`,
          location: item.location,
          image:
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
        }));

        setRecentlyViewed(formatted);
      } catch (err) {
        console.error("Error loading recently viewed:", err);
      }
      setLoading(false);
    };

    fetchRecentlyViewed();
  }, [supabase]);

  const clearRecentlyViewed = () => {
    localStorage.removeItem("balray_recently_viewed");
    setRecentlyViewed([]);
  };

  if (loading || recentlyViewed.length === 0) return null;

  return (
    <section className="w-full border-b border-[#D3B86A]/30 bg-[#FBF7EC] py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              👀 Continue Browsing
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#34414A] sm:text-3xl">
              Recently Viewed
            </h2>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="self-start text-sm font-bold text-[#9A7B37] hover:underline sm:self-end"
          >
            Clear History
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recentlyViewed.slice(0, 4).map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C]/60 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  quality={75}
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 min-h-[44px] text-base font-extrabold leading-6 text-[#34414A]">
                  {listing.title}
                </h3>
                <div className="mt-2 text-lg font-black text-[#9A7B37]">
                  {listing.price}
                </div>
                <div className="mt-1 text-xs text-[#66737C]">
                  📍 {listing.location}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}