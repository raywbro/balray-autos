"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: favs, error: favError } = await supabase
        .from("favorites")
        .select("listing_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favError || !favs || favs.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      const listingIds = favs.map((f) => f.listing_id);

      const { data, error } = await supabase
        .from("public_listings")
        .select("*")
        .in("id", listingIds)
        .eq("status", "active");

      if (error) {
        setMessage(error.message);
      } else {
        const orderedListings = favs
          .map((fav: any) => data?.find((l: any) => l.id === fav.listing_id))
          .filter(Boolean)
          .map((item: any) => ({
            id: item.id,
            title: `${item.year ? item.year + " " : ""}${item.make} ${item.model}`,
            category: categoryMap[item.category] || item.category,
            price: `R${Number(item.price).toLocaleString()}`,
            year: item.year ? item.year.toString() : "N/A",
            mileage: item.mileage || "N/A",
            location: item.location,
            featured: item.featured || false,
            image:
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
          }));
        setListings(orderedListings);
      }
      setLoading(false);
    };

    loadFavorites();
  }, [router, supabase]);

  const handleRemoveFavorite = async (listingId: string) => {
    const confirmed = confirm("Remove this listing from your favorites?");
    if (!confirmed) return;

    setListings(listings.filter((item) => item.id !== listingId));

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    if (error) {
      setMessage("Error removing favorite: " + error.message);
    } else {
      setMessage("Removed from favorites.");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="text-base font-bold animate-pulse text-[#9A7B37] sm:text-lg">
          Loading your favorites...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <section className="relative w-full max-w-full overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="relative mx-auto w-full max-w-7xl px-3 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F7130] sm:gap-3 sm:px-4 sm:py-2 sm:text-xs">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A] sm:h-2.5 sm:w-2.5" />
              Saved Vehicles
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              My Favorites
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#66737C] sm:mt-4 sm:text-base sm:leading-7">
              Vehicles you&apos;ve saved for later.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-x-hidden bg-[#F7F8F9] py-8 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
          {message && (
            <div className="mb-6 w-full max-w-full rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-3 text-center text-xs font-bold text-[#8F7130] sm:p-4 sm:text-sm">
              {message}
            </div>
          )}

          {listings.length === 0 ? (
            <div className="w-full max-w-full rounded-3xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="text-4xl sm:text-5xl">🤍</div>
              <h2 className="mt-5 text-xl font-black text-[#34414A] sm:mt-6 sm:text-2xl">
                You have no favorites yet
              </h2>
              <p className="mt-3 text-xs text-[#66737C] sm:text-sm">
                Tap the heart icon on any listing to save it here.
              </p>
              <Link
                href="/marketplace"
                className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105 sm:mt-8 sm:px-8 sm:py-4 sm:text-base"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className={`group flex w-full max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 ${
                    listing.featured
                      ? "border-2 border-[#B08D3C] shadow-[0_15px_40px_rgba(176,141,60,0.20)]"
                      : "border border-[#D5DBDF] hover:border-[#B08D3C]/60 hover:shadow-[0_20px_50px_rgba(52,65,74,0.12)]"
                  }`}
                >
                  <div className="relative w-full max-w-full overflow-hidden bg-[#E9EDF0]">
                    <div className="aspect-[4/3] w-full max-w-full sm:aspect-[16/10]">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        quality={75}
                      />
                    </div>
                    <div className="absolute left-2.5 top-2.5 rounded-full bg-[#34414A]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:py-2 sm:text-xs">
                      {listing.category}
                    </div>
                    {listing.featured && (
                      <div className="absolute left-2.5 top-9 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-2.5 py-1 text-[10px] font-bold text-white shadow-md sm:left-4 sm:top-14 sm:px-3 sm:py-2 sm:text-xs">
                        ⭐ FEATURED
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(listing.id)}
                      className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg shadow-md backdrop-blur transition hover:scale-105 hover:bg-white sm:bottom-4 sm:right-4 sm:h-11 sm:w-11 sm:text-xl"
                      aria-label="Remove from favorites"
                    >
                      ❤️
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col p-3.5 sm:p-5">
                    <h3 className="line-clamp-2 min-h-[44px] text-sm font-extrabold leading-5 text-[#34414A] sm:min-h-[56px] sm:text-xl sm:leading-7">
                      {listing.title}
                    </h3>
                    <div className="mt-2 text-lg font-black text-[#9A7B37] sm:mt-3 sm:text-2xl">
                      {listing.price}
                    </div>
                    <div className="mt-3 grid w-full max-w-full grid-cols-2 gap-1.5 text-[10px] sm:mt-4 sm:gap-2 sm:text-xs">
                      <div className="min-w-0 rounded-lg bg-[#F7F8F9] px-2 py-1.5 sm:px-3 sm:py-2">
                        <div className="text-[#89939A]">Year</div>
                        <div className="mt-0.5 truncate font-bold text-[#34414A] sm:mt-1">
                          {listing.year}
                        </div>
                      </div>
                      <div className="min-w-0 rounded-lg bg-[#F7F8F9] px-2 py-1.5 sm:px-3 sm:py-2">
                        <div className="text-[#89939A]">Mileage</div>
                        <div className="mt-0.5 truncate font-bold text-[#34414A] sm:mt-1">
                          {listing.mileage}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-[#E1E5E8] pt-3 sm:mt-4 sm:pt-4">
                      <div className="truncate text-xs text-[#66737C] sm:text-sm">
                        📍 {listing.location}
                      </div>
                    </div>
                    <Link
                      href={`/listing/${listing.id}`}
                      className="mt-auto block w-full rounded-xl border border-[#B08D3C] bg-white px-5 py-3 pt-3 text-center text-xs font-bold text-[#8F7130] hover:bg-[#FBF7EC] sm:mt-5 sm:py-3 sm:text-sm"
                    >
                      View Listing
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}