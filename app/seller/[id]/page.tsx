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

function Stars({
  rating,
  size = "base",
}: {
  rating: number;
  size?: "sm" | "base" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
      ? "text-xs sm:text-sm"
      : "text-base sm:text-xl";
  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass} text-[#B08D3C]`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{i <= rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

type Badge = {
  id: string;
  icon: string;
  label: string;
  color: string;
  description: string;
};

export default function SellerProfilePage() {
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const [badges, setBadges] = useState<Badge[]>([]);

  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  useEffect(() => {
    const supabase = createClient();

    const fetchSellerData = async () => {
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", sellerId)
        .order("created_at", { ascending: false });

      if (listingsError || !listingsData || listingsData.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const activeListings = listingsData.filter(
        (l) =>
          l.status === "active" &&
          (!l.expires_at || new Date(l.expires_at) > new Date())
      );
      const soldListings = listingsData.filter((l) => l.status === "sold");

      const sample = listingsData[0];
      const totalViews = listingsData.reduce(
        (sum, item) => sum + (item.views || 0),
        0
      );
      const totalPhotos = listingsData.reduce(
        (sum, item) => sum + (item.images?.length || 0),
        0
      );
      const avgPhotos =
        listingsData.length > 0 ? totalPhotos / listingsData.length : 0;

      const distinctCategories = new Set(listingsData.map((l) => l.category));

      const latestListingDate = new Date(listingsData[0].created_at);
      const daysSinceLastListing = Math.floor(
        (Date.now() - latestListingDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      setSeller({
        id: sellerId,
        name: sample.seller_name || "Seller",
        phone: sample.seller_phone || "",
        email: sample.seller_email || "",
        type: sample.seller_type || "private",
        totalListings: activeListings.length,
        totalViews,
        avgPhotos,
        distinctCategories: distinctCategories.size,
        soldCount: soldListings.length,
        daysSinceLastListing,
        joinedAt: sample.created_at,
      });

      const formatted = activeListings.map((item) => ({
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
        console.error("Reviews error:", error);
        setReviews([]);
        return;
      }

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
            reviewerName: userListing?.seller_name || "Anonymous",
          };
        })
      );

      setReviews(enriched);

      if (user) {
        const own = enriched.find((r) => r.reviewer_id === user.id);
        if (own) setMyReview(own);
      }
    };

    const load = async () => {
      try {
        await fetchSellerData();
        await fetchReviews();
      } catch (err) {
        console.error("Load failed:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sellerId]);

  useEffect(() => {
    if (!seller) return;

    const computed: Badge[] = [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    if (seller.totalListings >= 5) {
      computed.push({
        id: "established",
        icon: "🏆",
        label: "Established Seller",
        color: "from-[#8F7130] to-[#B08D3C]",
        description: "Has 5 or more active listings on Balray Autos.",
      });
    }

    if (avgRating >= 4 && reviews.length >= 3) {
      computed.push({
        id: "top-rated",
        icon: "⭐",
        label: "Top Rated",
        color: "from-[#B08D3C] to-[#D2B66A]",
        description: "Maintains a 4+ star rating from at least 3 reviews.",
      });
    }

    if (seller.daysSinceLastListing <= 7) {
      computed.push({
        id: "active",
        icon: "⚡",
        label: "Active Seller",
        color: "from-[#34414A] to-[#4A5962]",
        description: "Posted a listing within the last 7 days.",
      });
    }

    if (seller.avgPhotos >= 4) {
      computed.push({
        id: "photographer",
        icon: "📸",
        label: "Photo Pro",
        color: "from-[#8F7130] to-[#A47F32]",
        description: "Averages 4 or more photos per listing.",
      });
    }

    if (seller.distinctCategories >= 3) {
      computed.push({
        id: "variety",
        icon: "🎯",
        label: "Variety Seller",
        color: "from-[#B08D3C] to-[#8F7130]",
        description: "Lists across 3 or more categories.",
      });
    }

    if (seller.soldCount >= 1) {
      computed.push({
        id: "sold",
        icon: "✅",
        label: "Sold Successfully",
        color: "from-green-600 to-green-700",
        description: `Has successfully marked ${seller.soldCount} listing${
          seller.soldCount === 1 ? "" : "s"
        } as sold.`,
      });
    }

    setBadges(computed);
  }, [seller, reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (currentUser.id === sellerId) {
      setReviewMessage("You cannot review your own listings.");
      return;
    }

    setReviewSubmitting(true);
    const supabase = createClient();

    if (myReview) {
      const { error } = await supabase
        .from("reviews")
        .update({ rating: reviewRating, comment: reviewComment })
        .eq("id", myReview.id);

      if (error) {
        setReviewMessage("Error: " + error.message);
      } else {
        setReviews(
          reviews.map((r) =>
            r.id === myReview.id
              ? { ...r, rating: reviewRating, comment: reviewComment }
              : r
          )
        );
        setMyReview({ ...myReview, rating: reviewRating, comment: reviewComment });
        setReviewMessage("✓ Review updated.");
        setShowReviewForm(false);
        setTimeout(() => setReviewMessage(""), 2000);
      }
    } else {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          seller_id: sellerId,
          reviewer_id: currentUser.id,
          rating: reviewRating,
          comment: reviewComment,
        })
        .select()
        .single();

      if (error) {
        setReviewMessage("Error: " + error.message);
      } else {
        const newReview = { ...data, reviewerName: "You" };
        setReviews([newReview, ...reviews]);
        setMyReview(newReview);
        setReviewMessage("✓ Review posted.");
        setShowReviewForm(false);
        setReviewComment("");
        setTimeout(() => setReviewMessage(""), 2000);
      }
    }
    setReviewSubmitting(false);
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!confirm("Delete your review?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", myReview.id);

    if (error) {
      setReviewMessage("Error: " + error.message);
    } else {
      setReviews(reviews.filter((r) => r.id !== myReview.id));
      setMyReview(null);
      setReviewMessage("✓ Deleted.");
      setTimeout(() => setReviewMessage(""), 2000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="text-base font-bold animate-pulse text-[#9A7B37] sm:text-lg">
          Loading seller...
        </div>
      </main>
    );
  }

  if (notFound || !seller) {
    return (
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <div className="text-4xl sm:text-5xl">🔍</div>
          <h1 className="mt-6 text-2xl font-black text-[#34414A] sm:text-3xl">
            Seller Not Found
          </h1>
          <p className="mt-3 text-sm text-[#66737C] sm:text-base">
            This seller has no active listings or the link is broken.
          </p>
          <Link
            href="/marketplace"
            className="mt-8 inline-block rounded-xl bg-[#34414A] px-6 py-4 text-sm font-bold text-white sm:text-base"
          >
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  let cleanPhone = (seller.phone || "").replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) cleanPhone = "27" + cleanPhone.substring(1);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hi ${seller.name}, I'm interested in your listings on Balray Autos.`
  )}`;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const isOwnProfile = currentUser?.id === sellerId;

  const memberSince = seller.joinedAt
    ? new Date(seller.joinedAt).toLocaleDateString("en-ZA", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <section className="relative w-full max-w-full overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />

        <div className="relative mx-auto w-full max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="flex w-full max-w-full flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] via-[#D2B66A] to-[#A47F32] text-3xl font-black text-white shadow-md sm:h-28 sm:w-28 sm:text-4xl">
              {seller.name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F7130] sm:gap-3 sm:px-4 sm:py-2 sm:text-xs">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A] sm:h-2.5 sm:w-2.5" />
                {seller.type === "dealer"
                  ? "Verified Dealer"
                  : seller.type === "business"
                  ? "Business Seller"
                  : "Private Seller"}
              </div>

              <h1 className="break-words text-2xl font-black tracking-tight text-[#34414A] sm:text-4xl">
                {seller.name}
              </h1>

              {reviews.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Stars rating={Math.round(avgRating)} size="sm" />
                  <span className="text-xs font-bold text-[#34414A] sm:text-sm">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#66737C] sm:text-sm">
                    ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                  </span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-[#66737C] sm:mt-4 sm:gap-x-5 sm:text-sm">
                <span>Member since {memberSince}</span>
                <span>
                  🚗 {seller.totalListings} active listing
                  {seller.totalListings === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="w-full flex-shrink-0 sm:w-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-[#25D366] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md hover:bg-[#20BD5A] sm:w-auto sm:py-4"
              >
                💬 Contact Seller
              </a>
            </div>
          </div>

          {badges.length > 0 && (
            <div className="mt-6 w-full max-w-full rounded-2xl border border-[#D5DBDF] bg-white/80 p-4 backdrop-blur sm:mt-8 sm:p-5">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7B37] sm:text-xs">
                Seller Achievements
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`group relative flex items-center gap-2 rounded-full bg-gradient-to-r ${badge.color} px-3 py-1.5 text-xs font-bold text-white shadow-md sm:px-4 sm:py-2 sm:text-sm`}
                  >
                    <span className="text-base sm:text-lg">{badge.icon}</span>
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="w-full max-w-full overflow-x-hidden bg-[#F7F8F9] py-8 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A7B37] sm:text-sm">
              Active Listings
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#34414A] sm:mt-2 sm:text-3xl">
              {listings.length} vehicle{listings.length === 1 ? "" : "s"} for sale
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="w-full max-w-full rounded-2xl border border-[#D5DBDF] bg-white p-8 text-center sm:p-10">
              <p className="text-sm text-[#66737C]">
                This seller has no active listings right now.
              </p>
            </div>
          ) : (
            <div className="grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className={`group flex w-full max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 ${
                    listing.featured
                      ? "border-2 border-[#B08D3C]"
                      : "border border-[#D5DBDF]"
                  }`}
                >
                  <div className="relative w-full max-w-full overflow-hidden bg-[#E9EDF0]">
                    <div className="aspect-[4/3] w-full max-w-full sm:aspect-[16/10]">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="block h-full w-full max-w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute left-2.5 top-2.5 rounded-full bg-[#34414A]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:py-2 sm:text-xs">
                      {listing.category}
                    </div>
                    {listing.featured && (
                      <div className="absolute right-2.5 top-2.5 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-2.5 py-1 text-[10px] font-bold text-white shadow-md sm:right-4 sm:top-4 sm:px-3 sm:py-2 sm:text-xs">
                        ⭐ FEATURED
                      </div>
                    )}
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="w-full max-w-full overflow-x-hidden bg-white py-10 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-full gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-10">
            <div className="w-full max-w-full min-w-0">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A7B37] sm:text-sm">
                Ratings
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#34414A] sm:mt-2 sm:text-3xl">
                Seller Reviews
              </h2>

              {reviews.length > 0 ? (
                <div className="mt-5 w-full max-w-full rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-4 sm:mt-6 sm:p-6">
                  <div className="text-center">
                    <div className="text-4xl font-black text-[#34414A] sm:text-5xl">
                      {avgRating.toFixed(1)}
                    </div>
                    <div className="mt-2">
                      <Stars rating={Math.round(avgRating)} size="lg" />
                    </div>
                    <div className="mt-2 text-xs text-[#66737C] sm:text-sm">
                      Based on {reviews.length} review
                      {reviews.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="mt-5 space-y-1.5 sm:mt-6 sm:space-y-2">
                    {ratingDist.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2 sm:gap-3">
                        <span className="w-10 flex-shrink-0 text-[10px] font-bold text-[#66737C] sm:w-12 sm:text-xs">
                          {star} ★
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E1E5E8] sm:h-2">
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
                        <span className="w-6 flex-shrink-0 text-right text-[10px] font-bold text-[#66737C] sm:w-8 sm:text-xs">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 w-full max-w-full rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6 text-center sm:mt-6 sm:p-8">
                  <div className="text-4xl">⭐</div>
                  <p className="mt-3 text-xs text-[#66737C] sm:text-sm">
                    No reviews yet. Be the first to review this seller.
                  </p>
                </div>
              )}

              {isOwnProfile ? (
                <div className="mt-5 w-full max-w-full sm:mt-6">
                  <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 sm:p-5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A7B37] sm:text-xs">
                      This is your profile
                    </div>
                    <p className="mt-2 text-xs text-[#66737C] sm:text-sm">
                      You cannot review your own listings.
                    </p>
                  </div>
                </div>
              ) : !currentUser ? (
                <div className="mt-5 w-full max-w-full sm:mt-6">
                  <Link
                    href="/login"
                    className="block w-full rounded-xl border border-[#B08D3C] bg-white px-6 py-3.5 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC] sm:py-4 sm:text-base"
                  >
                    Log in to leave a review
                  </Link>
                </div>
              ) : (
                <div className="mt-5 w-full max-w-full sm:mt-6">
                  {myReview ? (
                    <div className="w-full max-w-full rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 sm:p-5">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A7B37] sm:text-xs">
                        Your Review
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Stars rating={myReview.rating} size="sm" />
                        <span className="text-xs text-[#66737C] sm:text-sm">
                          ({myReview.rating} ★)
                        </span>
                      </div>
                      {myReview.comment && (
                        <p className="mt-2 text-xs leading-5 text-[#4A5962] sm:text-sm sm:leading-6">
                          {myReview.comment}
                        </p>
                      )}
                      <div className="mt-4 flex w-full gap-2">
                        <button
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          className="flex-1 rounded-lg border border-[#B08D3C] bg-white px-3 py-2 text-[10px] font-bold text-[#8F7130] hover:bg-[#FBF7EC] sm:px-4 sm:text-xs"
                        >
                          {showReviewForm ? "Cancel" : "Edit"}
                        </button>
                        <button
                          onClick={handleDeleteReview}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600 hover:bg-red-100 sm:px-4 sm:text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105 sm:py-4 sm:text-base"
                    >
                      {showReviewForm ? "Cancel" : "Write a Review"}
                    </button>
                  )}

                  {showReviewForm && (
                    <form
                      onSubmit={handleSubmitReview}
                      className="mt-5 w-full max-w-full rounded-2xl border border-[#D5DBDF] bg-white p-4 shadow-sm sm:mt-6 sm:p-6"
                    >
                      <h3 className="text-base font-black text-[#34414A] sm:text-lg">
                        {myReview ? "Update your review" : "Write a review"}
                      </h3>

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-bold text-[#34414A] sm:text-sm">
                          Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="text-3xl transition hover:scale-110 sm:text-4xl"
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
                        <p className="mt-1 text-[10px] text-[#89939A] sm:text-xs">
                          {reviewRating} star{reviewRating === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="mt-5">
                        <label className="mb-2 block text-xs font-bold text-[#34414A] sm:text-sm">
                          Your review
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={4}
                          placeholder="Tell other buyers about your experience with this seller..."
                          className="w-full max-w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                        />
                      </div>

                      {reviewMessage && (
                        <div
                          className={`mt-4 rounded-xl border p-3 text-center text-xs font-bold sm:text-sm ${
                            reviewMessage.startsWith("✓")
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-red-200 bg-red-50 text-red-600"
                          }`}
                        >
                          {reviewMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 sm:text-base"
                      >
                        {reviewSubmitting
                          ? "Submitting..."
                          : myReview
                          ? "Update Review"
                          : "Post Review"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="w-full max-w-full min-w-0">
              <h3 className="text-base font-black text-[#34414A] sm:text-lg">
                All Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="mt-4 w-full max-w-full rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6 text-center sm:p-8">
                  <p className="text-xs text-[#66737C] sm:text-sm">
                    No reviews yet. Be the first to review this seller.
                  </p>
                </div>
              ) : (
                <div className="mt-4 w-full max-w-full space-y-3 sm:space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="w-full max-w-full rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-3.5 sm:p-5"
                    >
                      <div className="flex w-full items-start gap-3 sm:gap-4">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-xs font-black text-white sm:h-11 sm:w-11 sm:text-sm">
                          {review.reviewerName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-xs font-bold text-[#34414A] sm:text-sm">
                              {review.reviewerName}
                            </span>
                            {review.reviewer_id === currentUser?.id && (
                              <span className="rounded-full bg-[#FBF7EC] px-2 py-0.5 text-[10px] font-bold text-[#8F7130] sm:text-xs">
                                You
                              </span>
                            )}
                            <span className="text-[10px] text-[#89939A] sm:text-xs">
                              {new Date(review.created_at).toLocaleDateString(
                                "en-ZA",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="mt-1">
                            <Stars rating={review.rating} size="sm" />
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-xs leading-5 text-[#4A5962] sm:mt-3 sm:text-sm sm:leading-6">
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
    </main>
  );
}