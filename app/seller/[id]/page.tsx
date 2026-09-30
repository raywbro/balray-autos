"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export default function SellerProfilePage() {
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const params = useParams();
  const supabase = createClient();
  const sellerId = params.id as string;

  useEffect(() => {
    const fetchSellerData = async () => {
      // 1. Fetch all ACTIVE listings by this seller
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", sellerId)
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (listingsError || !listingsData || listingsData.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // 2. Use the first listing's seller info as the profile data
      const sample = listingsData[0];
      const totalViews = listingsData.reduce((sum, item) => sum + (item.views || 0), 0);

      setSeller({
        name: sample.seller_name,
        email: sample.seller_email,
        phone: sample.seller_phone,
        type: sample.seller_type,
        location: sample.location,
        totalListings: listingsData.length,
        totalViews: totalViews,
      });

      // 3. Format listings
      const formatted = listingsData.map((item) => ({
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

      setListings(formatted);
      setLoading(false);
    };

    if (sellerId) fetchSellerData();
  }, [sellerId, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading seller profile...
        </div>
      </main>
    );
  }

  if (notFound || !seller) {
    return (
      <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-6 text-3xl font-black text-[#34414A]">Seller Not Found</h1>
          <p className="mt-3 text-[#66737C]">
            This seller has no active listings, or the profile no longer exists.
          </p>
          <Link
            href="/marketplace"
            className="mt-8 inline-block rounded-xl bg-[#34414A] px-6 py-4 font-bold text-white"
          >
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  // Clean phone for WhatsApp
  let cleanPhone = (seller.phone || "").replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) cleanPhone = "27" + cleanPhone.substring(1);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hi ${seller.name}, I found your profile on Balray Autos and I'm interested in your listings.`
  )}`;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* HERO / PROFILE HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            {/* AVATAR */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] via-[#D2B66A] to-[#A47F32] text-4xl font-black text-white shadow-md sm:h-28 sm:w-28">
              {seller.name ? seller.name.charAt(0).toUpperCase() : "?"}
            </div>

            {/* DETAILS */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
                {seller.type === "dealer"
                  ? "Verified Dealer"
                  : seller.type === "business"
                  ? "Business Seller"
                  : "Private Seller"}
              </div>

              <h1 className="break-words text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
                {seller.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[#66737C]">
                <span>📍 {seller.location}</span>
                <span>🚗 {seller.totalListings} active listing{seller.totalListings === 1 ? "" : "s"}</span>
                <span>👁️ {seller.totalViews} total views</span>
              </div>
            </div>

            {/* CONTACT BUTTON */}
            <div className="flex-shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full rounded-xl bg-[#25D366] px-6 py-4 text-center text-sm font-bold text-white shadow-md hover:bg-[#20BD5A] sm:w-auto"
              >
                💬 WhatsApp Seller
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              All Listings
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">
              Vehicles by {seller.name}
            </h2>
          </div>

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
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[#34414A]/90 px-3 py-2 text-xs font-bold text-white backdrop-blur">
                    {listing.category}
                  </div>
                  {listing.featured && (
                    <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-2 text-xs font-bold text-white shadow-md">
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