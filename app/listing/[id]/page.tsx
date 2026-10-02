"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Lazy-loaded — only downloads when opened
const ReportModal = dynamic(() => import("@/app/components/ReportModal"), {
  ssr: false,
});

const FinancingCalculator = dynamic(
  () => import("@/app/components/FinancingCalculator"),
  { ssr: false }
);

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

function cleanPhone(phone: string) {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "27" + cleaned.substring(1);
  }
  return cleaned;
}

function saveRecentlyViewed(listingId: string) {
  try {
    const existing = JSON.parse(localStorage.getItem("balray_recently_viewed") || "[]");
    const filtered = existing.filter((id: string) => id !== listingId);
    filtered.unshift(listingId);
    const trimmed = filtered.slice(0, 8);
    localStorage.setItem("balray_recently_viewed", JSON.stringify(trimmed));
  } catch (err) {
    console.error("Error saving recently viewed:", err);
  }
}

export default function ListingDetailPage() {
  const [listing, setListing] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  useEffect(() => {
    const fetchListing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const isLoggedIn = !!user;
      const source = isLoggedIn ? "listings" : "public_listings";

      const { data, error } = await supabase
        .from(source)
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching listing:", error);
        setLoading(false);
        return;
      }

      const price = Number(data.price);
      const previous = data.previous_price ? Number(data.previous_price) : null;
      const hasPriceDrop = previous !== null && previous > price;
      const savings = hasPriceDrop ? previous - price : 0;
      const percentOff = hasPriceDrop ? Math.round((savings / previous) * 100) : 0;

      const formatted = {
        id: data.id,
        title: `${data.year ? data.year + " " : ""}${data.make} ${data.model}`,
        category: categoryMap[data.category] || data.category,
        price: `R${price.toLocaleString()}`,
        priceValue: price,
        previousPriceFormatted: previous ? `R${previous.toLocaleString()}` : null,
        hasPriceDrop,
        savingsFormatted: `R${savings.toLocaleString()}`,
        percentOff,
        year: data.year ? data.year.toString() : "N/A",
        mileage: data.mileage || "N/A",
        location: data.location,
        transmission: transmissionMap[data.transmission] || data.transmission || "N/A",
        fuel: fuelMap[data.fuel] || data.fuel || "N/A",
        condition: data.condition,
        description: data.description,
        sellerName: (data as any).seller_name || null,
        sellerPhone: (data as any).seller_phone || null,
        sellerEmail: (data as any).seller_email || null,
        sellerType: (data as any).seller_type || null,
        sellerId: data.user_id,
        views: data.views || 0,
        isLoggedIn,
        images:
          data.images && data.images.length > 0
            ? data.images
            : ["https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80"],
      };

      setListing(formatted);
      setLoading(false);
      saveRecentlyViewed(data.id);

      const now = new Date().toISOString();
      const { data: similarData } = await supabase
        .from(source)
        .select("*")
        .eq("category", data.category)
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .neq("id", data.id)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      const formattedSimilar = (similarData || []).map((item: any) => ({
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
      setSimilar(formattedSimilar);

      try {
        await supabase.rpc("increment_view", { listing_id: id });
      } catch (err) {
        console.error("Error incrementing views:", err);
      }
    };

    if (id) fetchListing();
  }, [id, supabase]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen || !listing) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActiveImage((prev) => (prev + 1) % listing.images.length);
      if (e.key === "ArrowLeft") setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    },
    [lightboxOpen, listing]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (lightboxOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: listing?.title,
      text: `Check out this ${listing?.title} for ${listing?.price} on Balray Autos`,
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">Loading vehicle details...</div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F8F9] p-4 text-center">
        <h1 className="text-3xl font-black text-[#34414A] mb-4">Listing Not Found</h1>
        <p className="text-[#66737C] mb-8">This vehicle may have been sold or removed.</p>
        <Link href="/marketplace" className="rounded-xl bg-[#34414A] px-6 py-4 font-bold text-white">Back to Marketplace</Link>
      </main>
    );
  }

  // Quick preview monthly payment for the sidebar (matches calculator defaults)
  const previewDeposit = (listing.priceValue * 10) / 100;
  const previewLoan = listing.priceValue - previewDeposit;
  const previewRate = 11.75 / 100 / 12;
  const previewMonthly =
    previewRate > 0
      ? (previewLoan * previewRate * Math.pow(1 + previewRate, 60)) /
        (Math.pow(1 + previewRate, 60) - 1)
      : previewLoan / 60;
  const previewMonthlyFormatted = `R${Math.round(previewMonthly).toLocaleString()}`;

  const whatsappNumber = listing.sellerPhone ? cleanPhone(listing.sellerPhone) : "";
  const whatsappMessage = encodeURIComponent(
    `Hi ${listing.sellerName || "there"}, I saw your ${listing.title} listed on Balray Autos for ${listing.price}. Is it still available?`
  );
  const whatsappUrl = listing.sellerPhone ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}` : "#";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      <div className="bg-white border-b border-[#E1E5E8]">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-[#9A7B37] hover:underline">
            ← Back to Marketplace
          </button>
        </div>
      </div>

      <section className="w-full bg-[#F7F8F9] py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-[#D5DBDF] bg-[#E9EDF0]"
              >
                <Image
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  priority
                  quality={80}
                />
                <div className="absolute left-4 top-4 rounded-full bg-[#34414A]/90 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                  {listing.category}
                </div>
                {listing.hasPriceDrop && (
                  <div className="absolute left-4 top-16 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg animate-pulse">
                    💰 PRICE DROP -{listing.percentOff}%
                  </div>
                )}
                {listing.images.length > 1 && (
                  <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {activeImage + 1} / {listing.images.length}
                  </div>
                )}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur opacity-0 transition group-hover:opacity-100">
                  🔍 Click to view fullscreen
                </div>
              </button>

              {listing.images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {listing.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        activeImage === index ? "border-[#B08D3C]" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${index}`} fill sizes="112px" className="object-cover" quality={60} />
                    </button>
                  ))}
                </div>
              )}

              {listing.hasPriceDrop && (
                <div className="mt-6 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-md">💰</div>
                    <div className="flex-1">
                      <div className="text-xs font-black uppercase tracking-[0.14em] text-red-600">Price Dropped!</div>
                      <div className="mt-1 flex flex-wrap items-baseline gap-3">
                        <span className="text-sm font-bold text-[#89939A] line-through">{listing.previousPriceFormatted}</span>
                        <span className="text-2xl font-black text-[#34414A]">{listing.price}</span>
                      </div>
                      <div className="mt-1 text-sm font-bold text-green-700">🎉 You save {listing.savingsFormatted} ({listing.percentOff}% off)</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-black text-[#34414A] mb-4">Description</h2>
                <p className="text-sm leading-7 text-[#66737C] whitespace-pre-wrap">{listing.description}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={handleShare} className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]">
                  {copied ? "✓ Link Copied!" : "🔗 Share Listing"}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this ${listing.title} on Balray Autos: ${typeof window !== "undefined" ? window.location.href : ""}`)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-3 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/20">
                  💬 Share on WhatsApp
                </a>
                <button onClick={() => setReportOpen(true)} className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
                  🚩 Report Listing
                </button>
              </div>

              {similar.length > 0 && (
                <div className="mt-12">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">You Might Also Like</div>
                    <h2 className="mt-2 text-2xl font-black text-[#34414A]">Similar {listing.category}</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {similar.map((item) => (
                      <Link key={item.id} href={`/listing/${item.id}`} className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 ${item.featured ? "border-2 border-[#B08D3C]" : "border border-[#D5DBDF] hover:border-[#B08D3C]/60"}`}>
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                          <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" quality={70} />
                          {item.featured && (
                            <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-1 text-xs font-bold text-white shadow-md">⭐ FEATURED</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-2 min-h-[48px] text-base font-extrabold leading-6 text-[#34414A]">{item.title}</h3>
                          <div className="mt-2 text-xl font-black text-[#9A7B37]">{item.price}</div>
                          <div className="mt-2 text-xs text-[#66737C]">📍 {item.location} • {item.mileage}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <h1 className="text-3xl font-black leading-tight text-[#34414A]">{listing.title}</h1>

                <div className="mt-4">
                  {listing.hasPriceDrop ? (
                    <div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-4xl font-black text-[#9A7B37]">{listing.price}</span>
                        <span className="text-lg font-bold text-[#89939A] line-through">{listing.previousPriceFormatted}</span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        💰 Save {listing.savingsFormatted} ({listing.percentOff}% off)
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl font-black text-[#9A7B37]">{listing.price}</div>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-gradient-to-r from-[#FBF7EC] to-[#F7F8F9] p-4 border border-[#D3B86A]/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">Estimated Monthly</div>
                      <div className="mt-1 text-2xl font-black text-[#8F7130]">
                        {previewMonthlyFormatted}
                        <span className="text-sm font-bold text-[#66737C]">/pm</span>
                      </div>
                    </div>
                    <button onClick={() => setShowCalculator(!showCalculator)} className="rounded-xl border border-[#B08D3C] bg-white px-4 py-2.5 text-xs font-bold text-[#8F7130] hover:bg-[#FBF7EC]">
                      {showCalculator ? "Hide" : "Calculate"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm font-bold text-[#66737C]">
                  <span>📍 {listing.location}</span>
                  <span className="rounded-full bg-[#FBF7EC] px-3 py-1 text-xs text-[#8F7130]">👁️ {listing.views + 1} views</span>
                </div>
              </div>

              {showCalculator && (
                <FinancingCalculator
                  price={listing.priceValue}
                  priceFormatted={listing.price}
                />
              )}

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

              <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6 sm:p-8">
                <h3 className="text-lg font-black text-[#8F7130] mb-2">Contact Seller</h3>

                {listing.isLoggedIn ? (
                  <>
                    {listing.sellerName && (
                      <Link href={`/seller/${listing.sellerId}`} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#8F7130] hover:underline">
                        {listing.sellerName} ({listing.sellerType}) →
                      </Link>
                    )}

                    <div className="flex flex-col gap-3">
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full rounded-xl bg-[#25D366] px-6 py-4 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#20BD5A]">
                        💬 WhatsApp Seller
                      </a>
                      <a href={`tel:${listing.sellerPhone}`} className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-center text-sm font-bold text-white shadow-md hover:brightness-105">
                        📞 Call {listing.sellerPhone}
                      </a>
                      {listing.sellerEmail && (
                        <a href={`mailto:${listing.sellerEmail}`} className="w-full rounded-xl border border-[#B08D3C] bg-white px-6 py-4 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]">
                          ✉️ Email Seller
                        </a>
                      )}
                    </div>

                    <p className="mt-4 text-center text-xs text-[#8F7130]/70">Always meet in a safe public place when buying a vehicle.</p>
                  </>
                ) : (
                  <div className="rounded-xl border border-[#D3B86A]/60 bg-white p-6 text-center">
                    <div className="text-3xl">🔒</div>
                    <h4 className="mt-3 text-base font-black text-[#34414A]">Log in to see contact details</h4>
                    <p className="mt-2 text-xs leading-5 text-[#66737C]">Create a free account to contact sellers directly via WhatsApp, phone, or email.</p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <Link href="/login" className="flex-1 rounded-xl bg-[#34414A] px-5 py-3 text-center text-sm font-bold text-white hover:bg-[#4A5962]">Log In</Link>
                      <Link href="/signup" className="flex-1 rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]">Sign Up Free</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }} className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20" aria-label="Close">×</button>
          <div className="absolute left-4 top-6 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">{activeImage + 1} / {listing.images.length}</div>
          {listing.images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length); }} className="absolute left-4 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20" aria-label="Previous">‹</button>
          )}
          <img src={listing.images[activeImage]} alt={listing.title} className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
          {listing.images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev + 1) % listing.images.length); }} className="absolute right-4 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20" aria-label="Next">›</button>
          )}
        </div>
      )}

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
      />

      <Footer />
    </main>
  );
}