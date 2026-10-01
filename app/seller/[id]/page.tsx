"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

// Star display component
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

export default function SellerProfilePage() {
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reviews state
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
  const sellerId = params.id as string;

  useEffect(() => {
    const fetchSellerData = async () => {
      // 1. Fetch all active listings by this seller
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

    const fetchReviews = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      // Enrich with reviewer names (from listings they have or fallback)
      const enriched = await Promise.all(
        (data || []).map(async (review) => {
          // Try to find a name from any listing they made
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

    if (sellerId) {
      fetchSellerData();
      fetchReviews();
    }
  }, [sellerId, supabase]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser.id === sellerId) {
      setReviewMessage("You cannot review yourself.");
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage("");

    if (myReview) {
      // Update existing review
      const { error } = await supabase
        .from("reviews")
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
      // Create new review
      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            seller_id: sellerId,
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

    const { error } = await supabase.from("reviews").delete().eq("id", myReview.id);

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

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const isOwnProfile = currentUser?.id === sellerId;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* PROFILE HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] via-[#D2B66A] to-[#A47F32] text-4xl font-black text-white shadow-md sm:h-28 sm:w-28">
              {seller.name ? seller.name.charAt(0).toUpperCase() : "?"}
            </div>

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

              {reviews.length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <Stars rating={Math.round(avgRating)} />
                  <span className="text-sm font-bold text-[#34414A]">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-[#66737C]">
                    ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                  </span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[#66737C]">
                <span>📍 {seller.location}</span>
                <span>🚗 {seller.totalListings} active listing{seller.totalListings === 1 ? "" : "s"}</span>
                <span>👁️ {seller.totalViews} total views</span>
              </div>
            </div>

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

      {/* REVIEWS */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">

            {/* LEFT: SUMMARY */}
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                Reviews
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">
                Seller Reputation
              </h2>

              {reviews.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                  <div className="text-center">
                    <div className="text-5xl font-black text-[#34414A]">
                      {avgRating.toFixed(1)}
                    </div>
                    <div className="mt-2">
                      <Stars rating={Math.round(avgRating)} size="lg" />
                    </div>
                    <div className="mt-2 text-sm text-[#66737C]">
                      Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    {ratingDist.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-12 text-xs font-bold text-[#66737C]">
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
                        <span className="w-8 text-right text-xs font-bold text-[#66737C]">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-8 text-center">
                  <div className="text-4xl">⭐</div>
                  <p className="mt-3 text-sm text-[#66737C]">
                    No reviews yet. Be the first to leave one!
                  </p>
                </div>
              )}

              {/* WRITE REVIEW BUTTON */}
              {!isOwnProfile && currentUser && (
                <div className="mt-6">
                  {myReview ? (
                    <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-5">
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
                      <div className="mt-4 flex gap-2">
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
                      className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 font-bold text-white shadow-md hover:brightness-105"
                    >
                      ⭐ {showReviewForm ? "Cancel" : "Write a Review"}
                    </button>
                  )}
                </div>
              )}

              {!currentUser && (
                <div className="mt-6">
                  <Link
                    href="/login"
                    className="block w-full rounded-xl border border-[#B08D3C] bg-white px-6 py-4 text-center font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                  >
                    Log In to Write a Review
                  </Link>
                </div>
              )}

              {/* REVIEW FORM */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="mt-6 rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-black text-[#34414A]">
                    {myReview ? "Update Your Review" : "Share Your Experience"}
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
                          className="text-4xl transition hover:scale-110"
                          aria-label={`${star} stars`}
                        >
                          <span className={star <= reviewRating ? "text-[#B08D3C]" : "text-[#D5DBDF]"}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-[#89939A]">
                      {reviewRating} of 5 stars
                    </p>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">
                      Comment (optional)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      placeholder="Tell other buyers about your experience with this seller..."
                      className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                    />
                  </div>

                  {reviewMessage && (
                    <div
                      className={`mt-4 rounded-xl border p-3 text-center text-sm font-bold ${
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
                    className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3.5 font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60"
                  >
                    {reviewSubmitting
                      ? "Submitting..."
                      : myReview
                      ? "Update Review"
                      : "Submit Review"}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT: REVIEW LIST */}
            <div>
              <h3 className="text-lg font-black text-[#34414A]">
                {reviews.length > 0
                  ? `All Reviews (${reviews.length})`
                  : "No Reviews Yet"}
              </h3>

              {reviews.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-8 text-center">
                  <p className="text-sm text-[#66737C]">
                    This seller hasn&apos;t received any reviews yet.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-sm font-black text-white">
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
                            <p className="mt-3 text-sm leading-6 text-[#4A5962]">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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