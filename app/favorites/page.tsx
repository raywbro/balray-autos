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
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">Loading your favorites...</div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Saved Vehicles
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">My Favorites</h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">Vehicles you&apos;ve saved for later.</p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {message && (
            <div className="mb-6 rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 text-center text-sm font-bold text-[#8F7130]">{message}</div>
          )}

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">🤍</div>
              <h2 className="mt-6 text-2xl font-black text-[#34414A]">You have no favorites yet</h2>
              <p className="mt-3 text-sm text-[#66737C]">Tap the heart icon on any listing to save it here.</p>
              <Link href="/marketplace" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md hover:brightness-105">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 ${
                    listing.featured
                      ? "border-2 border-[#B08D3C] shadow-[0_15px_40px_rgba(176,141,60,0.20)]"
                      : "border border-[#D5DBDF] hover:border-[#B08D3C]/60 hover:shadow-[0_20px_50px_rgba(52,65,74,0.12)]"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                    <Image src={listing.image} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" quality={75} />
                    <div className="absolute left-4 top-4 rounded-full bg-[#34414A]/90 px-3 py-2 text-xs font-bold text-white backdrop-blur">{listing.category}</div>
                    {listing.featured && (
                      <div className="absolute left-4 top-14 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-2 text-xs font-bold text-white shadow-md">⭐ FEATURED</div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(listing.id)}
                      className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl shadow-md backdrop-blur transition hover:bg-white hover:scale-105"
                      aria-label="Remove from favorites"
                    >
                      ❤️
                    </button>
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
          )}
        </div>
      </section>

      
    </main>
  );
}