"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/app/components/Navbar";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

const transmissionMap: Record<string, string> = {
  automatic: "Automatic",
  manual: "Manual",
  cvt: "CVT",
  other: "N/A",
};

const fuelMap: Record<string, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Electric",
  other: "N/A",
};

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        const formattedListings = data.map((item) => ({
          id: item.id,
          title: `${item.year ? item.year + " " : ""}${item.make} ${item.model}`,
          category: categoryMap[item.category] || item.category,
          price: `R${Number(item.price).toLocaleString()}`,
          year: item.year ? item.year.toString() : "N/A",
          mileage: item.mileage || "N/A",
          location: item.location,
          transmission: transmissionMap[item.transmission] || item.transmission || "N/A",
          fuel: fuelMap[item.fuel] || item.fuel || "N/A",
          image:
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
        }));
        setListings(formattedListings);
      }
      setLoading(false);
    };

    fetchListings();
  }, [supabase]);

  const categories = [
    "All",
    "Cars & SUVs",
    "Bakkies & 4x4s",
    "Motorcycles",
    "Trucks & Commercial",
    "Machinery & Equipment",
    "Parts & Accessories",
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      selectedCategory === "All" || listing.category === selectedCategory;
    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      listing.title.toLowerCase().includes(searchText) ||
      listing.category.toLowerCase().includes(searchText) ||
      listing.location.toLowerCase().includes(searchText);
    return matchesCategory && matchesSearch;
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
              Balray Autos Marketplace
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl lg:text-6xl">
              Find Your Next<br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">Vehicle.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Browse vehicles, machinery, parts and automotive products from sellers across South Africa.
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="w-full bg-[#34414A]">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search make, model, category or location..."
              className="min-w-0 w-full rounded-xl border border-white/10 bg-[#FAFBFC] px-5 py-4 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />
            <button type="button" onClick={() => setSearch(search)} className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 text-sm font-bold text-white">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTERS */}
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

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">Marketplace</div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">Available Listings</h2>
              <p className="mt-2 text-sm text-[#66737C]">
                Showing {filteredListings.length} listing{filteredListings.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link href="/sell" className="inline-flex w-full justify-center rounded-xl bg-[#34414A] px-5 py-3 text-sm font-bold text-white hover:bg-[#4A5962] sm:w-auto">
              Sell Your Vehicle
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center animate-pulse">
              <div className="text-4xl">🚗</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">Loading vehicles...</h3>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <article key={listing.id} className="group overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C]/60 hover:shadow-[0_20px_50px_rgba(52,65,74,0.12)]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                    <img src={listing.image} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute left-4 top-4 rounded-full bg-[#34414A]/90 px-3 py-2 text-xs font-bold text-white backdrop-blur">
                      {listing.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 min-h-[56px] text-xl font-extrabold leading-7 text-[#34414A]">{listing.title}</h3>
                    <div className="mt-3 text-2xl font-black text-[#9A7B37]">{listing.price}</div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
                        <div className="text-[#89939A]">Year</div>
                        <div className="mt-1 font-bold text-[#34414A]">{listing.year}</div>
                      </div>
                      <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
                        <div className="text-[#89939A]">Mileage</div>
                        <div className="mt-1 font-bold text-[#34414A]">{listing.mileage}</div>
                      </div>
                      <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
                        <div className="text-[#89939A]">Transmission</div>
                        <div className="mt-1 font-bold text-[#34414A]">{listing.transmission}</div>
                      </div>
                      <div className="rounded-lg bg-[#F7F8F9] px-3 py-2">
                        <div className="text-[#89939A]">Fuel</div>
                        <div className="mt-1 font-bold text-[#34414A]">{listing.fuel}</div>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-[#E1E5E8] pt-4">
                      <div className="text-sm text-[#66737C]">📍 {listing.location}</div>
                    </div>
                    <Link href={`/listing/${listing.id}`} className="mt-5 block w-full rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]">
                      View Listing
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
              <div className="text-4xl">🔎</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">No listings found</h3>
              <p className="mt-2 text-sm text-[#66737C]">Try another search or choose a different category.</p>
              <button type="button" onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="mt-5 rounded-xl bg-[#34414A] px-5 py-3 text-sm font-bold text-white">
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SELL SECTION */}
      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-16">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">Selling a Vehicle?</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">Put your vehicle in front of potential buyers.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">Submit your vehicle, machinery or automotive product to Balray Autos and connect with potential buyers.</p>
          </div>
          <Link href="/sell" className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-7 py-4 text-center font-bold text-white shadow-md sm:w-auto">
            List Your Vehicle
          </Link>
        </div>
      </section>

      {/* FOOTER */}
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
              <Link href="/about" className="text-[#68757D] hover:text-[#9A7B37]">About</Link>
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