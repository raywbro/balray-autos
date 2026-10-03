"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import WatermarkedVideoPlayer from "@/app/components/WatermarkedVideoPlayer";

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

function Stars({ rating, size = "base" }: { rating: number; size?: "sm" | "base" | "lg" }) {
  const sizeClass =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-xl";
  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass} text-[#B08D3C]`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{i <= rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function ListingDetailPage() {
  const [listing, setListing] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [depositPercent, setDepositPercent] = useState(10);
  const [termMonths, setTermMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(11.75);
  const [showCalculator, setShowCalculator] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportDone, setReportDone] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

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

      const price = Number(data.price);
      const previous = data.previous_price ? Number(data.previous_price) : null;
      const hasPriceDrop = previous !== null && previous > price;
      const savings = hasPriceDrop ? previous - price : 0;
      const percentOff = hasPriceDrop ? Math.round((savings / previous) * 100) : 0;

      const formatted = {
        id: data.id,
        title: `${data.year ? data.year + " " : ""}${data.make} ${data.model}`,
        category: categoryMap[data.category] || data.category,
        categoryKey: data.category,
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
        sellerName: data.seller_name,
        sellerPhone: data.seller_phone,
        sellerEmail: data.seller_email,
        sellerType: data.seller_type,
        sellerId: data.user_id,
        views: data.views || 0,
        videoUrl: data.video_url || null,
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
        .from("listings")
        .select("*")
        .eq("category", data.category)
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .neq("id", data.id)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      const formattedSimilar = (similarData || []).map((item) => ({
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

    const fetchReviews = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error } = await supabase
        .from("listing_reviews")
        .select("*")
        .eq("listing_id", id)
        .order("created_at", { ascending: false });

      if (error) return;

      const enriched = await Promise.all(
        (data || []).map(async (review) => {
          const { data: userListing } = await supabase
            .from("listings")
            .select("seller_name")
            .eq("user_id", review.reviewer_id)
            .limit(1)
            .maybeSingle();

          return {
            ...review,
            reviewerName: userListing?.seller_name || "Verified User",
          };
        })
      );

      setReviews(enriched);

      if (user) {
        const own = enriched.find((r) => r.reviewer_id === user.id);
        if (own) {
          setMyReview(own);
          setReviewRating(own.rating);
          setReviewComment(own.comment || "");
        }
      }
    };

    if (id) {
      fetchListing();
      fetchReviews();
    }
  }, [id, supabase]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen || !listing) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setActiveImage((prev) => (prev + 1) % listing.images.length);
      }
      if (e.key === "ArrowLeft") {
        setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
      }
    },
    [lightboxOpen, listing]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: listing?.title,
      text: `Check out this ${listing?.title} for ${listing?.price} on Balray Autos`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) {
      setReportMessage("Please select a reason.");
      return;
    }

    setReportSubmitting(true);
    setReportMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("reports").insert([
      {
        listing_id: listing.id,
        reporter_id: user?.id || null,
        reason: reportReason,
        details: reportDetails || null,
      },
    ]);

    if (error) {
      setReportMessage("Error: " + error.message);
      setReportSubmitting(false);
    } else {
      setReportDone(true);
      setReportSubmitting(false);
    }
  };

  const closeReportModal = () => {
    setReportOpen(false);
    setReportReason("");
    setReportDetails("");
    setReportMessage("");
    setReportDone(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (currentUser.id === listing.sellerId) {
      setReviewMessage("You cannot review your own listing.");
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage("");

    if (myReview) {
      const { error } = await supabase
        .from("listing_reviews")
        .update({ rating: reviewRating, comment: reviewComment })
        .eq("id", myReview.id);

      if (error) {
        setReviewMessage("Error: " + error.message);
        setReviewSubmitting(false);
      } else {
        setReviewMessage("Review updated!");
        setReviews(
          reviews.map((r) =>
            r.id === myReview.id ? { ...r, rating: reviewRating, comment: reviewComment } : r
          )
        );
        setMyReview({ ...myReview, rating: reviewRating, comment: reviewComment });
        setReviewSubmitting(false);
        setTimeout(() => {
          setReviewMessage("");
          setShowReviewForm(false);
        }, 2000);
      }
    } else {
      const { data, error } = await supabase
        .from("listing_reviews")
        .insert([
          {
            listing_id: listing.id,
            reviewer_id: currentUser.id,
            rating: reviewRating,
            comment: reviewComment,
          },
        ])
        .select()
        .single();

      if (error) {
        setReviewMessage("Error: " + error.message);
        setReviewSubmitting(false);
      } else {
        setReviewMessage("Review submitted! Thank you.");
        const newReview = { ...data, reviewerName: "You" };
        setReviews([newReview, ...reviews]);
        setMyReview(newReview);
        setReviewSubmitting(false);
        setTimeout(() => {
          setReviewMessage("");
          setShowReviewForm(false);
        }, 2000);
      }
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!confirm("Delete your review?")) return;

    const { error } = await supabase.from("listing_reviews").delete().eq("id", myReview.id);

    if (!error) {
      setReviews(reviews.filter((r) => r.id !== myReview.id));
      setMyReview(null);
      setReviewRating(5);
      setReviewComment("");
      setShowReviewForm(false);
      setReviewMessage("Review deleted.");
      setTimeout(() => setReviewMessage(""), 2000);
    }
  };

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

  const deposit = (listing.priceValue * depositPercent) / 100;
  const loanAmount = listing.priceValue - deposit;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      : loanAmount / termMonths;
  const totalPaid = monthlyPayment * termMonths + deposit;
  const totalInterest = totalPaid - listing.priceValue;
  const monthlyPaymentFormatted = `R${Math.round(monthlyPayment).toLocaleString()}`;
  const depositFormatted = `R${Math.round(deposit).toLocaleString()}`;
  const totalPaidFormatted = `R${Math.round(totalPaid).toLocaleString()}`;
  const totalInterestFormatted = `R${Math.round(totalInterest).toLocaleString()}`;

  const preApprovalMessage = encodeURIComponent(
    `Hi Balray Autos! I'm interested in the ${listing.title} listed at ${listing.price}.\n\nI'd like to know about financing options:\n- Deposit: ${depositFormatted}\n- Term: ${termMonths} months\n- Estimated monthly: ${monthlyPaymentFormatted}\n\nCan you help me get pre-approved?`
  );
  const preApprovalUrl = `https://wa.me/27815973009?text=${preApprovalMessage}`;

  const whatsappNumber = cleanPhone(listing.sellerPhone);
  const whatsappMessage = encodeURIComponent(
    `Hi ${listing.sellerName}, I saw your ${listing.title} listed on Balray Autos for ${listing.price}. Is it still available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const avgListingRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const listingRatingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const isOwnListing = currentUser?.id === listing.sellerId;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
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

      <section className="w-full bg-[#F7F8F9] py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

            {/* LEFT COLUMN */}
            <div>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-[#D5DBDF] bg-[#E9EDF0]"
              >
                <img
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
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

              {/* VIDEO PLAYER */}
              {listing.videoUrl && (
                <div className="mt-6 rounded-2xl border border-[#D5DBDF] bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xl">🎥</span>
                    <div className="text-sm font-black text-[#34414A]">
                      Walk-around video
                    </div>
                  </div>
                  <WatermarkedVideoPlayer
                    src={listing.videoUrl}
                    poster={listing.images?.[0]}
                  />
                </div>
              )}

              {listing.hasPriceDrop && (
                <div className="mt-6 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-md">
                      💰
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-black uppercase tracking-[0.14em] text-red-600">
                        Price Dropped!
                      </div>
                      <div className="mt-1 flex flex-wrap items-baseline gap-3">
                        <span className="text-sm font-bold text-[#89939A] line-through">
                          {listing.previousPriceFormatted}
                        </span>
                        <span className="text-2xl font-black text-[#34414A]">
                          {listing.price}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-bold text-green-700">
                        🎉 You save {listing.savingsFormatted} ({listing.percentOff}% off)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-black text-[#34414A] mb-4">Description</h2>
                <p className="text-sm leading-7 text-[#66737C] whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleShare}
                  className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
                >
                  {copied ? "✓ Link Copied!" : "🔗 Share Listing"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out this ${listing.title} on Balray Autos: ${typeof window !== "undefined" ? window.location.href : ""}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-3 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/20"
                >
                  💬 Share on WhatsApp
                </a>
                <button
                  onClick={() => setReportOpen(true)}
                  className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  🚩 Report Listing
                </button>
              </div>

              {/* LISTING REVIEWS */}
              <div className="mt-12 rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <div className="mb-6">
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                    Buyer Reviews
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-[#34414A]">
                    What Buyers Say About This Vehicle
                  </h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
                  <div>
                    {reviews.length > 0 ? (
                      <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-5">
                        <div className="text-center">
                          <div className="text-5xl font-black text-[#34414A]">
                            {avgListingRating.toFixed(1)}
                          </div>
                          <div className="mt-2">
                            <Stars rating={Math.round(avgListingRating)} size="lg" />
                          </div>
                          <div className="mt-2 text-sm text-[#66737C]">
                            {reviews.length} review{reviews.length === 1 ? "" : "s"}
                          </div>
                        </div>

                        <div className="mt-5 space-y-2">
                          {listingRatingDist.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-3">
                              <span className="w-10 text-xs font-bold text-[#66737C]">
                                {star} star
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E1E5E8]">
                                <div
                                  className="h-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C]"
                                  style={{
                                    width:
                                      reviews.length > 0
                                        ? `${(count / reviews.length) * 100}%`
                                        : "0%",
                                  }}
                                />
                              </div>
                              <span className="w-6 text-right text-xs font-bold text-[#66737C]">
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6 text-center">
                        <div className="text-4xl">⭐</div>
                        <p className="mt-3 text-sm text-[#66737C]">
                          No reviews yet. Be the first to leave one!
                        </p>
                      </div>
                    )}

                    {!isOwnListing && currentUser && (
                      <div className="mt-5">
                        {myReview ? (
                          <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
                              Your Review
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Stars rating={myReview.rating} size="sm" />
                              <span className="text-sm text-[#66737C]">
                                ({myReview.rating} star{myReview.rating === 1 ? "" : "s"})
                              </span>
                            </div>
                            {myReview.comment && (
                              <p className="mt-2 text-sm leading-6 text-[#4A5962]">
                                &ldquo;{myReview.comment}&rdquo;
                              </p>
                            )}
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="flex-1 rounded-lg border border-[#B08D3C] bg-white px-4 py-2 text-xs font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                              >
                                {showReviewForm ? "Cancel" : "Edit"}
                              </button>
                              <button
                                onClick={handleDeleteReview}
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105"
                          >
                            ⭐ {showReviewForm ? "Cancel" : "Write a Review"}
                          </button>
                        )}
                      </div>
                    )}

                    {!currentUser && (
                      <div className="mt-5">
                        <Link
                          href="/login"
                          className="block w-full rounded-xl border border-[#B08D3C] bg-white px-5 py-3.5 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                        >
                          Log In to Review
                        </Link>
                      </div>
                    )}

                    {isOwnListing && (
                      <div className="mt-5 rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] p-4 text-center text-xs text-[#89939A]">
                        This is your listing — you can&apos;t review it.
                      </div>
                    )}
                  </div>

                  <div>
                    {showReviewForm && !myReview && (
                      <form
                        onSubmit={handleSubmitReview}
                        className="mb-6 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-5"
                      >
                        <h3 className="text-base font-black text-[#34414A]">
                          Share Your Experience
                        </h3>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold text-[#34414A]">
                            Rating *
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="text-3xl transition hover:scale-110"
                                aria-label={`${star} stars`}
                              >
                                <span
                                  className={
                                    star <= reviewRating
                                      ? "text-[#B08D3C]"
                                      : "text-[#D5DBDF]"
                                  }
                                >
                                  ★
                                </span>
                              </button>
                            ))}
                          </div>
                          <p className="mt-1 text-xs text-[#89939A]">
                            {reviewRating} of 5 stars
                          </p>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold text-[#34414A]">
                            Comment (optional)
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            placeholder="Tell other buyers what you think about this vehicle..."
                            className="w-full resize-y rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                          />
                        </div>

                        {reviewMessage && (
                          <div
                            className={`mt-3 rounded-xl border p-3 text-center text-sm font-bold ${
                              reviewMessage.toLowerCase().includes("error") ||
                              reviewMessage.toLowerCase().includes("cannot")
                                ? "border-red-200 bg-red-50 text-red-600"
                                : "border-green-200 bg-green-50 text-green-600"
                            }`}
                          >
                            {reviewMessage}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-3 font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60"
                        >
                          {reviewSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    )}

                    {reviews.length > 0 && (
                      <div>
                        <h3 className="text-base font-black text-[#34414A] mb-4">
                          All Reviews ({reviews.length})
                        </h3>
                        <div className="space-y-3">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-sm font-black text-white">
                                  {review.reviewerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-[#34414A]">
                                      {review.reviewerName}
                                    </span>
                                    {review.reviewer_id === currentUser?.id && (
                                      <span className="rounded-full bg-[#FBF7EC] px-2 py-0.5 text-xs font-bold text-[#8F7130]">
                                        You
                                      </span>
                                    )}
                                    <span className="text-xs text-[#89939A]">
                                      {new Date(review.created_at).toLocaleDateString("en-ZA", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    <Stars rating={review.rating} size="sm" />
                                  </div>
                                  {review.comment && (
                                    <p className="mt-2 text-sm leading-6 text-[#4A5962]">
                                      {review.comment}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reviews.length === 0 && !showReviewForm && (
                      <div className="rounded-2xl border border-dashed border-[#D5DBDF] bg-[#F7F8F9] p-8 text-center">
                        <p className="text-sm text-[#66737C]">
                          Be the first to review this vehicle.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {similar.length > 0 && (
                <div className="mt-12">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                      You Might Also Like
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-[#34414A]">
                      Similar {listing.category}
                    </h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {similar.map((item) => (
                      <Link
                        key={item.id}
                        href={`/listing/${item.id}`}
                        className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 ${
                          item.featured
                            ? "border-2 border-[#B08D3C]"
                            : "border border-[#D5DBDF] hover:border-[#B08D3C]/60"
                        }`}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          {item.featured && (
                            <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-1 text-xs font-bold text-white shadow-md">
                              ⭐ FEATURED
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-2 min-h-[48px] text-base font-extrabold leading-6 text-[#34414A]">
                            {item.title}
                          </h3>
                          <div className="mt-2 text-xl font-black text-[#9A7B37]">
                            {item.price}
                          </div>
                          <div className="mt-2 text-xs text-[#66737C]">
                            📍 {item.location} • {item.mileage}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 sm:p-8">
                <h1 className="text-3xl font-black leading-tight text-[#34414A]">
                  {listing.title}
                </h1>

                {reviews.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Stars rating={Math.round(avgListingRating)} size="sm" />
                    <span className="text-sm font-bold text-[#34414A]">
                      {avgListingRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#66737C]">
                      ({reviews.length})
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  {listing.hasPriceDrop ? (
                    <div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-4xl font-black text-[#9A7B37]">
                          {listing.price}
                        </span>
                        <span className="text-lg font-bold text-[#89939A] line-through">
                          {listing.previousPriceFormatted}
                        </span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        💰 Save {listing.savingsFormatted} ({listing.percentOff}% off)
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl font-black text-[#9A7B37]">
                      {listing.price}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-gradient-to-r from-[#FBF7EC] to-[#F7F8F9] p-4 border border-[#D3B86A]/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
                        Estimated Monthly
                      </div>
                      <div className="mt-1 text-2xl font-black text-[#8F7130]">
                        {monthlyPaymentFormatted}
                        <span className="text-sm font-bold text-[#66737C]">/pm</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="rounded-xl border border-[#B08D3C] bg-white px-4 py-2.5 text-xs font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                    >
                      {showCalculator ? "Hide" : "Calculate"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm font-bold text-[#66737C]">
                  <span>📍 {listing.location}</span>
                  <span className="rounded-full bg-[#FBF7EC] px-3 py-1 text-xs text-[#8F7130]">
                    👁️ {listing.views + 1} views
                  </span>
                </div>
              </div>

              {showCalculator && (
                <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg text-white">
                      💳
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#34414A]">
                        Financing Calculator
                      </h3>
                      <p className="text-xs text-[#89939A]">
                        Estimate your monthly payment
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-[#34414A]">
                        Deposit
                      </label>
                      <span className="text-sm font-black text-[#8F7130]">
                        {depositPercent}% ({depositFormatted})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={depositPercent}
                      onChange={(e) => setDepositPercent(Number(e.target.value))}
                      className="mt-2 w-full accent-[#B08D3C]"
                    />
                    <div className="mt-1 flex justify-between text-xs text-[#89939A]">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-bold text-[#34414A]">Term</label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[12, 24, 36, 48, 60, 72].map((months) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setTermMonths(months)}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                            termMonths === months
                              ? "border-[#B08D3C] bg-[#B08D3C] text-white"
                              : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#B08D3C]"
                          }`}
                        >
                          {months} mo
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-[#34414A]">
                        Interest Rate (annual)
                      </label>
                      <span className="text-sm font-black text-[#8F7130]">
                        {interestRate.toFixed(2)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="7"
                      max="20"
                      step="0.25"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="mt-2 w-full accent-[#B08D3C]"
                    />
                    <div className="mt-1 flex justify-between text-xs text-[#89939A]">
                      <span>7%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 rounded-xl bg-[#F7F8F9] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#66737C]">Vehicle Price</span>
                      <span className="font-bold text-[#34414A]">{listing.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#66737C]">Deposit</span>
                      <span className="font-bold text-[#34414A]">- {depositFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#66737C]">Amount Financed</span>
                      <span className="font-bold text-[#34414A]">
                        R{Math.round(loanAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-[#E1E5E8] pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#34414A]">
                          Monthly Payment
                        </span>
                        <span className="text-2xl font-black text-[#8F7130]">
                          {monthlyPaymentFormatted}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#89939A]">Total Interest Paid</span>
                      <span className="font-bold text-[#89939A]">
                        {totalInterestFormatted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#89939A]">Total Amount Paid</span>
                      <span className="font-bold text-[#89939A]">
                        {totalPaidFormatted}
                      </span>
                    </div>
                  </div>

                  <a
                    href={preApprovalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md hover:brightness-105"
                  >
                    💬 Get Pre-Approved
                  </a>

                  <p className="mt-3 text-center text-xs leading-5 text-[#89939A]">
                    ⓘ Estimate only. Actual rates depend on your credit profile
                    and lender terms.
                  </p>
                </div>
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

                <Link
                  href={`/seller/${listing.sellerId}`}
                  className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#8F7130] hover:underline"
                >
                  {listing.sellerName} ({listing.sellerType}) →
                </Link>

                <div className="flex flex-col gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-xl bg-[#25D366] px-6 py-4 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#20BD5A]"
                  >
                    💬 WhatsApp Seller
                  </a>

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

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close"
          >
            ×
          </button>

          <div className="absolute left-4 top-6 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            {activeImage + 1} / {listing.images.length}
          </div>

          {listing.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
              }}
              className="absolute left-4 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          <img
            src={listing.images[activeImage]}
            alt={listing.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {listing.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage((prev) => (prev + 1) % listing.images.length);
              }}
              className="absolute right-4 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Next"
            >
              ›
            </button>
          )}

          {listing.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 z-10 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl bg-white/10 p-2 backdrop-blur">
              {listing.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(index);
                  }}
                  className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    activeImage === index ? "border-[#B08D3C]" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${index}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="absolute top-6 right-20 z-10 hidden rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur md:block">
            Use ← → keys to navigate • ESC to close
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            {reportDone ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  ✓
                </div>
                <h2 className="mt-5 text-2xl font-black text-[#34414A]">
                  Report Submitted
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#66737C]">
                  Thank you. Our team will review this listing shortly.
                </p>
                <button
                  onClick={closeReportModal}
                  className="mt-8 w-full rounded-xl bg-[#34414A] px-6 py-3.5 font-bold text-white hover:bg-[#4A5962]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#34414A]">
                      Report Listing
                    </h2>
                    <p className="mt-1 text-xs text-[#89939A]">
                      Help us keep Balray Autos safe.
                    </p>
                  </div>
                  <button
                    onClick={closeReportModal}
                    className="text-2xl leading-none text-[#89939A] hover:text-[#34414A]"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleReport} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">
                      Why are you reporting this? *
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                    >
                      <option value="" disabled>Select a reason</option>
                      <option value="Suspected scam or fraud">Suspected scam or fraud</option>
                      <option value="Fake or misleading listing">Fake or misleading listing</option>
                      <option value="Stolen vehicle">Stolen vehicle</option>
                      <option value="Wrong category">Wrong category</option>
                      <option value="Duplicate listing">Duplicate listing</option>
                      <option value="Offensive content">Offensive content</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">
                      Additional details (optional)
                    </label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      rows={4}
                      placeholder="Tell us more about the issue..."
                      className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                    />
                  </div>

                  {reportMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                      {reportMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="w-full rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>

                  <p className="text-center text-xs text-[#89939A]">
                    Your report is anonymous. The seller will not be notified.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}