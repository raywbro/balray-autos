"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

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
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewMessageType, setReviewMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!listingId) return;

    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        let amIAdmin = false;
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profile?.role === "admin") {
            amIAdmin = true;
            setIsAdmin(true);
          }
        }

        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select("*")
          .eq("id", listingId)
          .maybeSingle();

        if (listingError || !listingData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const isOwner = user && listingData.user_id === user.id;

        // Allow viewing if: active, OR owner, OR admin
        const canView =
          listingData.status === "active" || isOwner || amIAdmin;

        if (!canView) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setListing(listingData);

        const { data: sellerData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", listingData.user_id)
          .maybeSingle();
        setSeller(sellerData);

        if (!isOwner && listingData.status === "active") {
          try {
            await supabase
              .from("listings")
              .update({ views: (listingData.views || 0) + 1 })
              .eq("id", listingId);
          } catch (err) {
            console.error("View increment failed:", err);
          }
        }

        const { data: reviewData, error: reviewError } = await supabase
          .from("listing_reviews")
          .select("*")
          .eq("listing_id", listingId)
          .order("created_at", { ascending: false });

        if (!reviewError) {
          setReviews(reviewData || []);
        }

        if (user && user.id !== listingData.user_id) {
          const { data: existing } = await supabase
            .from("listing_reviews")
            .select("*")
            .eq("listing_id", listingId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (existing) {
            setMyReview(existing);
            setReviewRating(existing.rating);
            setReviewComment(existing.comment || "");
          }
        }
      } catch (err) {
        console.error("Load failed:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const fetchReviews = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("listing_reviews")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      setReviews([]);
      return;
    }
    setReviews(data || []);
  };

  const handleSubmitReview = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (reviewRating < 1) {
      setReviewMessage("Please select a star rating.");
      setReviewMessageType("error");
      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    const supabase = createClient();
    const reviewerName =
      currentUser.user_metadata?.full_name ||
      currentUser.email?.split("@")[0] ||
      "User";

    if (myReview) {
      const { error } = await supabase
        .from("listing_reviews")
        .update({
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        })
        .eq("id", myReview.id);

      if (error) {
        setReviewMessage("Error: " + error.message);
        setReviewMessageType("error");
      } else {
        setReviewMessage("✓ Review updated.");
        setReviewMessageType("success");
        await fetchReviews();
      }
    } else {
      const { error } = await supabase.from("listing_reviews").insert({
        listing_id: listingId,
        user_id: currentUser.id,
        reviewer_name: reviewerName,
        reviewer_email: currentUser.email,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });

      if (error) {
        setReviewMessage("Error: " + error.message);
        setReviewMessageType("error");
      } else {
        setReviewMessage("✓ Review posted.");
        setReviewMessageType("success");
        await fetchReviews();
        const { data: existing } = await supabase
          .from("listing_reviews")
          .select("*")
          .eq("listing_id", listingId)
          .eq("user_id", currentUser.id)
          .maybeSingle();
        setMyReview(existing);
      }
    }

    setSubmittingReview(false);
    setTimeout(() => setReviewMessage(""), 4000);
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!confirm("Delete your review?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("listing_reviews")
      .delete()
      .eq("id", myReview.id);

    if (error) {
      setReviewMessage("Error: " + error.message);
      setReviewMessageType("error");
      return;
    }

    setMyReview(null);
    setReviewRating(0);
    setReviewComment("");
    setReviewMessage("✓ Review deleted.");
    setReviewMessageType("success");
    await fetchReviews();
    setTimeout(() => setReviewMessage(""), 4000);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading listing...
        </div>
      </main>
    );
  }

  if (notFound || !listing) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="max-w-md rounded-2xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🔍</div>
          <h1 className="mt-4 text-2xl font-black text-[#34414A]">
            Listing not found
          </h1>
          <p className="mt-3 text-sm text-[#66737C]">
            This listing doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/marketplace"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-sm font-bold text-white"
          >
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["/placeholder.png"];

  const isOwner = currentUser && currentUser.id === listing.user_id;

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {listing.status !== "active" && (isOwner || isAdmin) && (
          <div className="mb-6 rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-4 text-center">
            <div className="text-sm font-black text-yellow-800">
              👁️ Preview Mode — This listing is{" "}
              <span className="uppercase">{listing.status}</span> and not yet
              visible to the public
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-[#89939A]">
          <Link href="/" className="hover:text-[#8F7130]">Home</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-[#8F7130]">Marketplace</Link>
          <span>/</span>
          <span className="text-[#34414A]">
            {listing.year} {listing.make} {listing.model}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                <img
                  src={images[activeImage]}
                  alt={`${listing.make} ${listing.model}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        activeImage === i
                          ? "border-[#B08D3C]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {listing.video_url && (
              <div className="overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#9A7B37]">
                  Video Walk-Around
                </div>
                <video src={listing.video_url} controls className="w-full rounded-xl" style={{ maxHeight: "400px" }} />
              </div>
            )}

            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-[#34414A]">Description</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#4A5962]">
                {listing.description}
              </p>
            </div>

            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-[#34414A]">Reviews & Ratings</h2>

              {reviews.length > 0 ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= Math.round(averageRating) ? "text-[#B08D3C]" : "text-[#D5DBDF]"}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-black text-[#34414A]">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-[#89939A]">({reviews.length} reviews)</span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-[#89939A]">No reviews yet.</p>
              )}

              {!currentUser ? (
                <div className="mt-6 rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-5 text-center">
                  <p className="text-sm font-bold text-[#8F7130]">
                    <Link href="/login" className="underline">Log in</Link> to leave a review.
                  </p>
                </div>
              ) : isOwner ? (
                <div className="mt-6 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-5 text-center text-xs text-[#66737C]">
                  You can&apos;t review your own listing.
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-5">
                  <div className="text-sm font-black text-[#34414A]">
                    {myReview ? "Update your review" : "Leave a review"}
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-3xl transition hover:scale-110 ${
                          star <= reviewRating ? "text-[#B08D3C]" : "text-[#D5DBDF]"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience (optional)..."
                    className="mt-4 w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm outline-none focus:border-[#B08D3C]"
                  />
                  {reviewMessage && (
                    <div className={`mt-3 rounded-xl border p-3 text-center text-xs font-bold ${
                      reviewMessageType === "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-600"
                    }`}>
                      {reviewMessage}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={submittingReview || reviewRating < 1}
                      className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {submittingReview ? "Saving..." : myReview ? "Update Review" : "Post Review"}
                    </button>
                    {myReview && (
                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D5DBDF] p-6 text-center text-xs text-[#89939A]">
                    No reviews yet.
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-[#E1E5E8] bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-sm font-black text-white">
                            {review.reviewer_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-black">{review.reviewer_name}</div>
                            <div className="text-xs text-[#89939A]">
                              {new Date(review.created_at).toLocaleDateString("en-ZA", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? "text-[#B08D3C]" : "text-[#D5DBDF]"}>★</span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4A5962]">{review.comment}</p>
                      )}
                      {isAdmin && (
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this review?")) return;
                            const supabase = createClient();
                            await supabase.from("listing_reviews").delete().eq("id", review.id);
                            await fetchReviews();
                          }}
                          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                        >
                          Admin: Delete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-6 shadow-sm sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.14em] text-[#9A7B37]">
                {categoryMap[listing.category] || listing.category}
              </div>
              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                {listing.year} {listing.make} {listing.model}
              </h1>
              <div className="mt-5 text-3xl font-black text-[#9A7B37] sm:text-4xl">
                R{Number(listing.price).toLocaleString()}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#F7F8F9] px-4 py-3">
                  <div className="text-xs text-[#89939A]">Year</div>
                  <div className="mt-1 font-bold">{listing.year || "N/A"}</div>
                </div>
                <div className="rounded-xl bg-[#F7F8F9] px-4 py-3">
                  <div className="text-xs text-[#89939A]">Mileage</div>
                  <div className="mt-1 font-bold">{listing.mileage || "N/A"}</div>
                </div>
                <div className="rounded-xl bg-[#F7F8F9] px-4 py-3">
                  <div className="text-xs text-[#89939A]">Transmission</div>
                  <div className="mt-1 font-bold">
                    {transmissionMap[listing.transmission] || listing.transmission || "N/A"}
                  </div>
                </div>
                <div className="rounded-xl bg-[#F7F8F9] px-4 py-3">
                  <div className="text-xs text-[#89939A]">Fuel</div>
                  <div className="mt-1 font-bold">{fuelMap[listing.fuel] || listing.fuel || "N/A"}</div>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-[#F7F8F9] px-4 py-3">
                <div className="text-xs text-[#89939A]">Location</div>
                <div className="mt-1 font-bold">📍 {listing.location}</div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <a href={`tel:${listing.seller_phone}`} className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-center text-sm font-black text-white">
                  📞 Call Seller
                </a>
                <a
                  href={`https://wa.me/${listing.seller_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model} listed on Balray Autos for R${Number(listing.price).toLocaleString()}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#25D366] px-6 py-4 text-center text-sm font-black text-white"
                >
                  💬 WhatsApp Seller
                </a>
              </div>
              <div className="mt-4 text-center text-xs text-[#89939A]">
                👁️ {listing.views || 0} views
              </div>
            </div>

            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-6 shadow-sm sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.14em] text-[#9A7B37]">Seller</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg font-black text-white">
                  {listing.seller_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">{listing.seller_name}</div>
                  <div className="text-xs text-[#66737C]">
                    {seller?.seller_type === "dealer"
                      ? "Dealer"
                      : seller?.seller_type === "business"
                      ? "Business"
                      : "Private Seller"}
                  </div>
                </div>
              </div>
            </div>

            {isOwner && listing.status !== "sold" && (
              <Link
                href={`/edit-listing/${listing.id}`}
                className="block rounded-3xl border-2 border-[#34414A] bg-[#34414A] p-5 text-center text-sm font-bold text-white hover:bg-[#4A5962]"
              >
                ✏️ Edit This Listing
              </Link>
            )}

            <Link
              href="/marketplace"
              className="block rounded-3xl border border-[#D5DBDF] bg-white p-5 text-center text-sm font-bold text-[#34414A] shadow-sm hover:border-[#B08D3C]"
            >
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}