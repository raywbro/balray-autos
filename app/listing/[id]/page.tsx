"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

// Helpers to format data
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

export default function ListingDetailPage() {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching listing:", error);
        setLoading(false);
        return;
      }

      const formatted = {
        id: data.id,
        title: `${data.year ? data.year + " " : ""}${data.make} ${data.model}`,
        category: categoryMap[data.category] || data.category,
        price: `R${Number(data.price).toLocaleString()}`,
        year: data.year ? data.year.toString() : "N/A",
        mileage: data.mileage || "N/A",
        location: data.location,
        transmission: transmissionMap[data.transmission] || data.transmission || "N/A",
        fuel: fuelMap[data.fuel] || data.fuel || "N/A",
        condition: data.condition,
        description: data.description,
        sellerName: data.seller_name,
        sellerPhone: data.seller_phone,
        sellerEmail: data.seller_email,
        sellerType: data.seller_type,
        images:
          data.images && data.images.length > 0
            ? data.images
            : ["https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80"],
      };

      setListing(formatted);
      setLoading(false);
    };

    if (id) fetchListing();
  }, [id, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading vehicle details...
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F8F9] p-4 text-center">
        <h1 className="text-3xl font-black text-[#34414A] mb-4">Listing Not Found</h1>
        <p className="text-[#66737C] mb-8">This vehicle may have been sold or removed.</p>
        <Link href="/marketplace" className="rounded-xl bg-[#34414A] px-6 py-4 font-bold text-white">
          Back to Marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* BREADCRUMB / BACK BUTTON */}
      <div className="bg-white border-b border-[#E1E5E8]">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-[#9A7B37] hover:underline"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <section className="w-full bg-[#F7F8F9] py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

            {/* LEFT COLUMN: IMAGES & DESCRIPTION */}
            <div>
              {/* MAIN IMAGE */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#D5DBDF] bg-[#E9EDF0]">
                <img
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full bg-[#34414A]/90 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                  {listing.category}
                </div>
              </div>

              {/* THUMBNAILS */}
              {listing.images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {listing.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        activeImage === index
                          ? "border-[#B08D3C]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* DESCRIPTION */}
              <div className="mt-8 rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-black text-[#34414A] mb-4">Description</h2>
                <p className="text-sm leading-7 text-[#66737C] whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: DETAILS & SELLER INFO */}
            <div className="space-y-6">
              {/* PRICE & TITLE CARD */}
              <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <h1 className="text-3xl font-black leading-tight text-[#34414A]">
                  {listing.title}
                </h1>
                <div className="mt-4 text-4xl font-black text-[#9A7B37]">
                  {listing.price}
                </div>
                <div className="mt-4 flex items-center text-sm font-bold text-[#66737C]">
                  📍 {listing.location}
                </div>
              </div>

              {/* SPECS GRID */}
              <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <h3 className="text-lg font-black text-[#34414A] mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg bg-[#F7F8F9] p-3">
                    <div className="text-[#89939A]">Year</div>
                    <div className="mt-1 font-bold text-[#34414A]">{listing.year}</div>
                  </div>
                  <div className="rounded-lg bg-[#F7F8F9] p-3">
                    <div className="text-[#89939A]">Mileage</div>
                    <div className="mt-1 font-bold text-[#34414A]">{listing.mileage}</div>
                  </div>
                  <div className="rounded-lg bg-[#F7F8F9] p-3">
                    <div className="text-[#89939A]">Transmission</div>
                    <div className="mt-1 font-bold text-[#34414A]">{listing.transmission}</div>
                  </div>
                  <div className="rounded-lg bg-[#F7F8F9] p-3">
                    <div className="text-[#89939A]">Fuel</div>
                    <div className="mt-1 font-bold text-[#34414A]">{listing.fuel}</div>
                  </div>
                  <div className="rounded-lg bg-[#F7F8F9] p-3">
                    <div className="text-[#89939A]">Condition</div>
                    <div className="mt-1 font-bold capitalize text-[#34414A]">{listing.condition}</div>
                  </div>
                  <div className="rounded-lg bg-[#F7F8F9] p-3">
                    <div className="text-[#89939A]">Category</div>
                    <div className="mt-1 font-bold text-[#34414A]">{listing.category}</div>
                  </div>
                </div>
              </div>

              {/* CONTACT SELLER CARD */}
              <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6 sm:p-8">
                <h3 className="text-lg font-black text-[#8F7130] mb-2">Contact Seller</h3>
                <p className="text-sm text-[#8F7130] mb-6">
                  {listing.sellerName} ({listing.sellerType})
                </p>

                <div className="flex flex-col gap-3">
                  <a
                    href={`tel:${listing.sellerPhone}`}
                    className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-center text-sm font-bold text-white shadow-md hover:brightness-105"
                  >
                    📞 Call {listing.sellerPhone}
                  </a>

                  {listing.sellerEmail && (
                    <a
                      href={`mailto:${listing.sellerEmail}`}
                      className="w-full rounded-xl border border-[#B08D3C] bg-white px-6 py-4 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                    >
                      ✉️ Email Seller
                    </a>
                  )}
                </div>

                <p className="mt-4 text-center text-xs text-[#8F7130]/70">
                  Always meet in a safe public place when buying a vehicle.
                </p>
              </div>
            </div>
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