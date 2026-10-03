"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import ShowroomHero from "@/app/components/ShowroomHero";

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

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareToast, setCompareToast] = useState("");
  const supabase = createClient();

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All");
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("balray_compare") || "[]");
      setCompareList(stored);
    } catch (err) {
      console.error("Error loading compare:", err);
    }
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        const formattedListings = data.map((item) => {
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
            transmission: transmissionMap[item.transmission] || item.transmission || "N/A",
            transmissionKey: item.transmission || "",
            fuel: fuelMap[item.fuel] || item.fuel || "N/A",
            fuelKey: item.fuel || "",
            featured: item.featured || false,
            views: item.views || 0,
            createdAt: item.created_at,
            image:
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
          };
        });
        setListings(formattedListings);
      }
      setLoading(false);
    };

    const loadUserAndFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id);
        setFavorites((data || []).map((f) => f.listing_id));
      }
    };

    fetchListings();
    loadUserAndFavorites();
  }, [supabase]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const isFav = favorites.includes(listingId);

    if (isFav) {
      setFavorites(favorites.filter((id) => id !== listingId));
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
    } else {
      setFavorites([...favorites, listingId]);
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, listing_id: listingId });
    }
  };

  const toggleCompare = (listingId: string) => {
    let newList: string[];

    if (compareList.includes(listingId)) {
      newList = compareList.filter((id) => id !== listingId);
      setCompareToast("Removed from comparison");
    } else {
      if (compareList.length >= 4) {
        setCompareToast("You can compare up to 4 vehicles");
        setTimeout(() => setCompareToast(""), 2500);
        return;
      }
      newList = [...compareList, listingId];
      setCompareToast("Added to comparison ✓");
    }

    setCompareList(newList);
    localStorage.setItem("balray_compare", JSON.stringify(newList));
    setTimeout(() => setCompareToast(""), 2500);
  };

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setTransmissionFilter("");
    setFuelFilter("");
    setSearch("");
    setSelectedCategory("All");
  };

  const categories = [
    "All",
    "Cars & SUVs",
    "Bakkies & 4x4s",
    "Motorcycles",
    "Trucks & Commercial",
    "Machinery & Equipment",
    "Parts & Accessories",
  ];

  const activeFilterCount =
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minYear ? 1 : 0) +
    (maxYear ? 1 : 0) +
    (transmissionFilter ? 1 : 0) +
    (fuelFilter ? 1 : 0);

  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      selectedCategory === "All" || listing.category === selectedCategory;
    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      searchText === "" ||
      listing.title.toLowerCase().includes(searchText) ||
      listing.category.toLowerCase().includes(searchText) ||
      listing.location.toLowerCase().includes(searchText);
    const matchesMinPrice = minPrice === "" || listing.priceValue >= Number(minPrice);
    const matchesMaxPrice = maxPrice === "" || listing.priceValue <= Number(maxPrice);
    const matchesMinYear = minYear === "" || listing.yearValue >= Number(minYear);
    const matchesMaxYear = maxYear === "" || listing.yearValue <= Number(maxYear);
    const matchesTransmission =
      transmissionFilter === "" || listing.transmissionKey === transmissionFilter;
    const matchesFuel = fuelFilter === "" || listing.fuelKey === fuelFilter;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesMinYear &&
      matchesMaxYear &&
      matchesTransmission &&
      matchesFuel
    );
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.priceValue - b.priceValue;
      case "price-high":
        return b.priceValue - a.priceValue;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "popular":
        return b.views - a.views;
      case "year-new":
        return b.yearValue - a.yearValue;
      case "year-old":
        return a.yearValue - b.yearValue;
      case "featured":
      default:
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <>
      {/* SHOWROOM HERO */}
      <ShowroomHero
        subtitle="Browse thousands of cars, bakkies, motorcycles, trucks, machinery and parts from trusted sellers across all 9 South African provinces."
        primaryCTA={{ label: "Sell Your Vehicle", href: "/sell" }}
        secondaryCTA={{ label: "Browse Listings", href: "#categories" }}
      />

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
            <button
              type="button"
              onClick={() => setSearch(search)}
              className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 text-sm font-bold text-white"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTERS */}
      <section id="categories" className="w-full bg-[#F7F8F9]">
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
                Marketplace
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">
                Available Listings
              </h2>
              <p className="mt-2 text-sm text-[#66737C]">
                Showing {sortedListings.length} listing{sortedListings.length === 1 ? "" : "s"}
                {search && <span> for &quot;{search}&quot;</span>}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`relative rounded-xl border px-5 py-3 text-sm font-bold transition ${
                  showFilters || activeFilterCount > 0
                    ? "border-[#B08D3C] bg-[#FBF7EC] text-[#8F7130]"
                    : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#B08D3C]"
                }`}
              >
                🎯 Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#B08D3C] px-1.5 text-xs font-black text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

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
                  <option value="oldest">📅 Oldest Listings</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                  <option value="popular">👁️ Most Popular</option>
                  <option value="year-new">🚗 Year: Newest</option>
                  <option value="year-old">🚙 Year: Oldest</option>
                </select>
              </div>

              <Link
                href="/sell"
                className="inline-flex justify-center rounded-xl bg-[#34414A] px-5 py-3 text-sm font-bold text-white hover:bg-[#4A5962]"
              >
                Sell Your Vehicle
              </Link>
            </div>
          </div>

          {/* ADVANCED FILTERS PANEL */}
          {showFilters && (
            <div className="mt-6 rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    Min Price (R)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    Max Price (R)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    Min Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    placeholder="e.g. 2015"
                    className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    Max Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    Transmission
                  </label>
                  <select
                    value={transmissionFilter}
                    onChange={(e) => setTransmissionFilter(e.target.value)}
                    className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                  >
                    <option value="">Any</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                    <option value="other">Other / N/A</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    Fuel Type
                  </label>
                  <select
                    value={fuelFilter}
                    onChange={(e) => setFuelFilter(e.target.value)}
                    className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                  >
                    <option value="">Any</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="other">Other / N/A</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E1E5E8] pt-5">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied`
                    : "No filters applied"}
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-2.5 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
                >
                  ✕ Clear All Filters
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center animate-pulse">
              <div className="text-4xl">🚗</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">
                Loading vehicles...
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

                    <button
                      type="button"
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl shadow-md backdrop-blur transition hover:bg-white hover:scale-105"
                      aria-label="Save to favorites"
                    >
                      {favorites.includes(listing.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 min-h-[56px] text-xl font-extrabold leading-7 text-[#34414A]">
                      {listing.title}
                    </h3>

                    <div className="mt-3">
                      {listing.hasPriceDrop ? (
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-2xl font-black text-[#9A7B37]">
                            {listing.price}
                          </span>
                          <span className="text-sm font-bold text-[#89939A] line-through">
                            {listing.previousPriceFormatted}
                          </span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-black text-green-700">
                            -{listing.percentOff}%
                          </span>
                        </div>
                      ) : (
                        <div className="text-2xl font-black text-[#9A7B37]">
                          {listing.price}
                        </div>
                      )}

                      {listing.hasPriceDrop && (
                        <div className="mt-1 text-xs font-bold text-green-600">
                          Save {listing.savingsFormatted}
                        </div>
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

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link
                        href={`/listing/${listing.id}`}
                        className="rounded-xl border border-[#B08D3C] bg-white px-4 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleCompare(listing.id)}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                          compareList.includes(listing.id)
                            ? "bg-[#34414A] text-white hover:bg-[#4A5962]"
                            : "border border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#34414A] hover:bg-[#F7F8F9]"
                        }`}
                      >
                        {compareList.includes(listing.id) ? "✓ Added" : "⚖️ Compare"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
              <div className="text-4xl">🔎</div>
              <h3 className="mt-4 text-xl font-black text-[#34414A]">
                No listings match your filters
              </h3>
              <p className="mt-2 text-sm text-[#66737C]">
                Try widening your price range or removing some filters.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-5 rounded-xl bg-[#34414A] px-5 py-3 text-sm font-bold text-white"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SELL SECTION */}
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
              Submit your vehicle, machinery or automotive product to Balray Autos and connect with potential buyers.
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

      {/* FLOATING COMPARE BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2 rounded-2xl border-2 border-[#B08D3C] bg-white p-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg text-white">
                ⚖️
              </div>
              <div>
                <div className="text-sm font-black text-[#34414A]">
                  {compareList.length} vehicle{compareList.length === 1 ? "" : "s"} to compare
                </div>
                <div className="text-xs text-[#66737C]">
                  Compare up to 4 side-by-side
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCompareList([]);
                  localStorage.removeItem("balray_compare");
                }}
                className="rounded-xl border border-[#D5DBDF] bg-white px-4 py-2.5 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
              >
                Clear
              </button>
              <Link
                href="/compare"
                className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105"
              >
                Compare Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {compareToast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#34414A] px-6 py-3 text-sm font-bold text-white shadow-lg">
          {compareToast}
        </div>
      )}
    </>
  );
}

export default function MarketplacePage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex items-center justify-center">
            <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
              Loading marketplace...
            </div>
          </div>
        }
      >
        <MarketplaceContent />
      </Suspense>
    </main>
  );
}