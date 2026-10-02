"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const BRAND_DATA: Record<string, { name: string; display: string }> = {
  toyota: { name: "toyota", display: "Toyota" },
  volkswagen: { name: "volkswagen", display: "Volkswagen" },
  ford: { name: "ford", display: "Ford" },
  bmw: { name: "bmw", display: "BMW" },
  "mercedes-benz": { name: "mercedes-benz", display: "Mercedes-Benz" },
  mercedes: { name: "mercedes", display: "Mercedes-Benz" },
  audi: { name: "audi", display: "Audi" },
  nissan: { name: "nissan", display: "Nissan" },
  hyundai: { name: "hyundai", display: "Hyundai" },
  kia: { name: "kia", display: "Kia" },
  honda: { name: "honda", display: "Honda" },
  mazda: { name: "mazda", display: "Mazda" },
  isuzu: { name: "isuzu", display: "Isuzu" },
  suzuki: { name: "suzuki", display: "Suzuki" },
  renault: { name: "renault", display: "Renault" },
  chevrolet: { name: "chevrolet", display: "Chevrolet" },
  landrover: { name: "landrover", display: "Land Rover" },
  "land-rover": { name: "land-rover", display: "Land Rover" },
  jeep: { name: "jeep", display: "Jeep" },
  volvo: { name: "volvo", display: "Volvo" },
  peugeot: { name: "peugeot", display: "Peugeot" },
  citroen: { name: "citroen", display: "Citroën" },
  fiat: { name: "fiat", display: "Fiat" },
  datsun: { name: "datsun", display: "Datsun" },
  mahindra: { name: "mahindra", display: "Mahindra" },
  gwm: { name: "gwm", display: "GWM" },
  haval: { name: "haval", display: "Haval" },
  chery: { name: "chery", display: "Chery" },
  omoda: { name: "omoda", display: "Omoda" },
  jac: { name: "jac", display: "JAC" },
  mg: { name: "mg", display: "MG" },
  opel: { name: "opel", display: "Opel" },
  lexus: { name: "lexus", display: "Lexus" },
  porsche: { name: "porsche", display: "Porsche" },
  jaguar: { name: "jaguar", display: "Jaguar" },
  mini: { name: "mini", display: "MINI" },
  subaru: { name: "subaru", display: "Subaru" },
  tesla: { name: "tesla", display: "Tesla" },
  harley: { name: "harley", display: "Harley-Davidson" },
  yamaha: { name: "yamaha", display: "Yamaha" },
  kawasaki: { name: "kawasaki", display: "Kawasaki" },
  honda_motorcycle: { name: "honda", display: "Honda" },
  scania: { name: "scania", display: "Scania" },
  man: { name: "man", display: "MAN" },
  "mercedes-truck": { name: "mercedes-benz", display: "Mercedes-Benz Trucks" },
  jcb: { name: "jcb", display: "JCB" },
  caterpillar: { name: "caterpillar", display: "Caterpillar" },
  kubota: { name: "kubota", display: "Kubota" },
};

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export default function BrandListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const params = useParams();
  const supabase = createClient();
  const brandSlug = params.brand as string;
  const brandInfo = BRAND_DATA[brandSlug];

  useEffect(() => {
    const fetchListings = async () => {
      if (!brandInfo) {
        setLoading(false);
        return;
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("public_listings")
        .select("*")
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .ilike("make", brandInfo.name)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        const formatted = (data || []).map((item: any) => {
          const price = Number(item.price);
          const previous = item.previous_price ? Number(item.previous_price) : null;
          const hasPriceDrop = previous !== null && previous > price;
          const savings = hasPriceDrop ? previous - price : 0;
          const percentOff = hasPriceDrop ? Math.round((savings / previous) * 100) : 0;

          return {
            id: item.id,
            title: `${item.year ? item.year + " " : ""}${item.make} ${item.model}`,
            category: categoryMap[item.category] || item.category,
            price: `R${price.toLocaleString()}`,
            priceValue: price,
            previousPriceFormatted: previous ? `R${previous.toLocaleString()}` : null,
            hasPriceDrop,
            savingsFormatted: `R${savings.toLocaleString()}`,
            percentOff,
            year: item.year ? item.year.toString() : "N/A",
            yearValue: item.year || 0,
            mileage: item.mileage || "N/A",
            location: item.location,
            featured: item.featured || false,
            views: item.views || 0,
            createdAt: item.created_at,
            image:
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
          };
        });
        setListings(formatted);
      }
      setLoading(false);
    };

    fetchListings();
  }, [brandSlug, brandInfo, supabase]);

  useEffect(() => {
    if (brandInfo) {
      document.title = `${brandInfo.display} for Sale in South Africa | Balray Autos`;
    }
  }, [brandInfo]);

  if (!brandInfo) {
    return (
      <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-6 text-3xl font-black text-[#34414A]">Brand Not Found</h1>
          <p className="mt-3 text-[#66737C]">
            We don&apos;t have a page for this brand yet. Browse all vehicles on our marketplace.
          </p>
          <Link
            href="/marketplace"
            className="mt-8 inline-block rounded-xl bg-[#34414A] px-6 py-4 font-bold text-white"
          >
            Browse Marketplace
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const categories = [
    "All",
    "Cars & SUVs",
    "Bakkies & 4x4s",
    "Motorcycles",
    "Trucks & Commercial",
    "Machinery & Equipment",
    "Parts & Accessories",
  ];

  const filteredListings = listings.filter((l) => {
    return selectedCategory === "All" || l.category === selectedCategory;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.priceValue - b.priceValue;
      case "price-high":
        return b.priceValue - a.priceValue;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        return b.views - a.views;
      case "year-new":
        return b.yearValue - a.yearValue;
      case "featured":
      default:
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              🇿🇦 South Africa
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl lg:text-6xl">
              {brandInfo.display}
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                for Sale
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Browse {listings.length} {brandInfo.display} vehicle{listings.length === 1 ? "" : "s"} for sale across South Africa. Find your next {brandInfo.display} on Balray Autos.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTERS + SORT */}
      <section className="w-full bg-[#F7F8F9]">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex w-full gap-2 overflow-x-auto pb-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedCategory === category
                    ? "border-[#B08D3C] bg-[#B08D3C] text-white"
                    : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#B08D3C] hover:text-[#9A7B37]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                {brandInfo.display}
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">
                Available {brandInfo.display} Listings
              </h2>
              <p className="mt-2 text-sm text-[#66737C]">
                Showing {sortedListings.length} listing{sortedListings.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  Sort:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                >
                  <option value="featured">⭐ Featured First</option>
                  <option value="newest">🆕 Newest Arrivals</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                  <option value="popular">👁️ Most Popular</option>
                  <option value="year-new">🚗 Year: Newest</option>
                </select>
              </div>

              <Link
                href="/sell"
                className="inline-flex justify-center rounded-xl bg-[#34414A] px-5 py-3 text-sm font-bold text-white hover:bg-[#4A5962]"
              >
                Sell Your {brandInfo.display}
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center animate-pulse">
              <div className="text-4xl">🚗</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">
                Loading {brandInfo.display} vehicles...
              </h3>
            </div>
          ) : sortedListings.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedListings.map((listing) => (
                <article
                  key={listing.id}
                  className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 ${
                    listing.featured
                      ? "border-2 border-[#B08D3C] shadow-[0_15px_40px_rgba(176,141,60,0.20)]"
                      : "border border-[#D5DBDF] hover:border-[#B08D3C]/60 hover:shadow-[0_20px_50px_rgba(52,65,74,0.12)]"
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
                    {listing.featured && (
                      <div className="absolute left-4 top-14 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-2 text-xs font-bold text-white shadow-md">
                        ⭐ FEATURED
                      </div>
                    )}
                    {listing.hasPriceDrop && (
                      <div className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-md animate-pulse">
                        💰 PRICE DROP
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 min-h-[56px] text-xl font-extrabold leading-7 text-[#34414A]">
                      {listing.title}
                    </h3>

                    <div className="mt-3">
                      {listing.hasPriceDrop ? (
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-2xl font-black text-[#9A7B37]">{listing.price}</span>
                          <span className="text-sm font-bold text-[#89939A] line-through">
                            {listing.previousPriceFormatted}
                          </span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-black text-green-700">
                            -{listing.percentOff}%
                          </span>
                        </div>
                      ) : (
                        <div className="text-2xl font-black text-[#9A7B37]">{listing.price}</div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
                        <div className="text-[#89939A]">Year</div>
                        <div className="mt-1 font-bold text-[#34414A]">{listing.year}</div>
                      </div>
                      <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
                        <div className="text-[#89939A]">Mileage</div>
                        <div className="mt-1 font-bold text-[#34414A]">{listing.mileage}</div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#E1E5E8] pt-4">
                      <div className="text-sm text-[#66737C]">📍 {listing.location}</div>
                    </div>

                    <Link
                      href={`/listing/${listing.id}`}
                      className="mt-5 block w-full rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                    >
                      View Listing
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
              <div className="text-4xl">🔎</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">
                No {brandInfo.display} listings yet
              </h3>
              <p className="mt-2 text-sm text-[#66737C]">
                Be the first to list a {brandInfo.display} on Balray Autos.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/sell"
                  className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-3 text-sm font-bold text-white"
                >
                  List a {brandInfo.display}
                </Link>
                <Link
                  href="/marketplace"
                  className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
                >
                  Browse All Listings
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* OTHER BRANDS */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Browse Other Brands
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">
              Popular Car Brands in South Africa
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "toyota",
              "volkswagen",
              "ford",
              "bmw",
              "mercedes-benz",
              "audi",
              "nissan",
              "hyundai",
              "kia",
              "honda",
              "mazda",
              "isuzu",
              "suzuki",
              "renault",
              "land-rover",
              "jeep",
              "volvo",
              "chery",
              "haval",
              "gwm",
            ].map((slug) => {
              const info = BRAND_DATA[slug];
              if (!info) return null;
              return (
                <Link
                  key={slug}
                  href={`/brands/${slug}`}
                  className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                    slug === brandSlug
                      ? "border-[#B08D3C] bg-[#B08D3C] text-white"
                      : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#B08D3C] hover:text-[#9A7B37]"
                  }`}
                >
                  {info.display}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}