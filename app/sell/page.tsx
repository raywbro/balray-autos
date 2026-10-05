"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import CameraCapture from "@/app/components/CameraCapture";
import ImageVideoManager from "@/app/components/ImageVideoManager";
import HeroBanner from "@/app/components/HeroBanner";

const FREE_LISTING_LIMIT = 3;
const SA_PHONE_REGEX = /(\+27|27|0)[\s\-.]?[1-9](?:[\s\-.]?\d){8}/g;

function containsPhoneNumber(text: string): boolean {
  if (!text) return false;
  SA_PHONE_REGEX.lastIndex = 0;
  return SA_PHONE_REGEX.test(text);
}

export default function SellPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  const [listingCount, setListingCount] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState("none");
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Phone-required gate
  const [needsPhone, setNeedsPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  const uploadRef = useRef<
    (() => Promise<{ images: string[]; video: string | null }>) | null
  >(null);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/login");
          return;
        }
        setUser(user);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profileData || {});

        // Check if phone is missing
        const phone =
          profileData?.phone || user.user_metadata?.phone || "";
        if (!phone || phone.trim() === "") {
          setNeedsPhone(true);
          setLoading(false);
          return;
        }

        const { count } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const total = count || 0;
        setListingCount(total);

        const tier = profileData?.subscription_tier || "none";
        const expiry = profileData?.subscription_expires_at || null;
        const isActive =
          tier !== "none" && expiry !== null && new Date(expiry) > new Date();

        setSubscriptionTier(tier);
        setSubscriptionExpiry(expiry);
        setHasActiveSubscription(isActive);

        if (total >= FREE_LISTING_LIMIT && !isActive) {
          setShowPaywall(true);
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");

    const cleanPhone = phoneInput.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setPhoneError("Please enter a valid South African number (e.g. 0821234567).");
      return;
    }

    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+27" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("27")) {
      formattedPhone = "+27" + formattedPhone;
    } else {
      formattedPhone = "+" + formattedPhone;
    }

    setSavingPhone(true);
    const supabase = createClient();

    // Check if phone is used by another account
    const { data: exists } = await supabase.rpc("check_phone_exists", {
      phone_input: formattedPhone,
    });

    if (exists) {
      setPhoneError(
        "This phone number is already registered to another account."
      );
      setSavingPhone(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ phone: formattedPhone })
      .eq("id", user.id);

    if (error) {
      setPhoneError("Could not save phone: " + error.message);
      setSavingPhone(false);
      return;
    }

    await supabase.auth.updateUser({
      data: { phone: formattedPhone },
    });

    setProfile({ ...profile, phone: formattedPhone });
    setNeedsPhone(false);
    setSavingPhone(false);
  };

  const handleCameraCapture = (files: File[]) => {
    setShowCamera(false);
    const input = document.getElementById("add-photos") as HTMLInputElement;
    if (input) {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (needsPhone) {
      setErrorMessage("Please add your phone number before posting.");
      return;
    }

    if (listingCount >= FREE_LISTING_LIMIT && !hasActiveSubscription) {
      setShowPaywall(true);
      return;
    }

    setUploading(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const description = (formData.get("description") as string) || "";
    const make = (formData.get("make") as string) || "";
    const model = (formData.get("model") as string) || "";
    const location = (formData.get("location") as string) || "";

    if (
      containsPhoneNumber(description) ||
      containsPhoneNumber(make) ||
      containsPhoneNumber(model) ||
      containsPhoneNumber(location)
    ) {
      setErrorMessage(
        "Your listing contains a phone number. Please remove it — buyers contact you via the Call/WhatsApp buttons on your listing."
      );
      setUploading(false);
      return;
    }

    try {
      let uploadedImages: string[] = [];
      let uploadedVideo: string | null = null;

      if (uploadRef.current) {
        const result = await uploadRef.current();
        uploadedImages = result.images;
        uploadedVideo = result.video;
      }

      const supabase = createClient();
      const lockedEmail = user.email;
      const lockedPhone = profile?.phone || user.user_metadata?.phone || "";
      const lockedName =
        profile?.full_name || user.user_metadata?.full_name || "User";

      if (!lockedPhone) {
        throw new Error("No phone number found on your account.");
      }

      const newListing = {
        user_id: user.id,
        seller_name: lockedName,
        seller_phone: lockedPhone,
        seller_email: lockedEmail,
        seller_type: formData.get("sellerType"),
        category: formData.get("category"),
        condition: formData.get("condition"),
        make: formData.get("make"),
        model: formData.get("model"),
        year: formData.get("year") ? Number(formData.get("year")) : null,
        price: Number(formData.get("price")),
        mileage: formData.get("mileage"),
        location: formData.get("location"),
        transmission: formData.get("transmission"),
        fuel: formData.get("fuel"),
        description: formData.get("description"),
        images: uploadedImages,
        video_url: uploadedVideo,
        status: "pending",
      };

      const { data: inserted, error: dbError } = await supabase
        .from("listings")
        .insert([newListing])
        .select()
        .single();

      if (dbError) throw dbError;

      try {
        const listingTitle = `${newListing.year ? newListing.year + " " : ""}${newListing.make} ${newListing.model}`;
        const listingPrice = `R${newListing.price.toLocaleString()}`;

        await fetch("/api/notify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: inserted.id,
            sellerName: newListing.seller_name,
            sellerEmail: newListing.seller_email,
            sellerPhone: newListing.seller_phone,
            listingTitle,
            listingPrice,
            category: newListing.category,
            location: newListing.location,
          }),
        });
      } catch (notifyErr) {
        console.error("Admin notify failed:", notifyErr);
      }

      setUploading(false);
      setSubmitted(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong.");
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Verifying your account...
        </div>
      </main>
    );
  }

  if (!user) return null;

  // ===== PHONE REQUIRED GATE =====
  if (needsPhone) {
    return (
      <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A] p-4 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border-2 border-[#B08D3C] bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-3xl text-white">
              📱
            </div>
            <h1 className="mt-5 text-2xl font-black text-[#34414A]">
              Add Your Phone Number
            </h1>
            <p className="mt-3 text-sm text-[#66737C]">
              You signed up with Google. We need your phone number so buyers can
              call or WhatsApp you about your listings.
            </p>
          </div>

          <form onSubmit={handleSavePhone} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#34414A]">
                South African Phone Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. 082 123 4567"
                required
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />
              {phoneError && (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                  {phoneError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPhone}
              className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60"
            >
              {savingPhone ? "Saving..." : "Save & Continue"}
            </button>

            <p className="text-center text-xs text-[#89939A]">
              This phone can only be linked to one account.
            </p>
          </form>
        </div>
      </main>
    );
  }

  // ===== PAYWALL =====
  if (showPaywall) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
        <section className="relative overflow-hidden bg-black px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-4xl shadow-xl">
              🔒
            </div>
            <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl">
              You&apos;ve Used All 3 Free Listings
            </h1>
            <p className="mt-4 text-base leading-7 text-white/80">
              You&apos;ve posted {listingCount} free listings. To post another
              advert, subscribe and wait for admin to confirm your payment.
            </p>

            <div className="mt-8 rounded-2xl border-2 border-[#D3B86A]/60 bg-white/5 p-6 text-left backdrop-blur-sm">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#D2B66A]">
                Subscription Unlocks
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-400">✓</span>
                  <span className="text-sm text-white/90">
                    <strong>Unlimited adverts</strong> during your plan
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-400">✓</span>
                  <span className="text-sm text-white/90">
                    All your listings go to the <strong>TOP</strong> of the
                    marketplace
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">R39</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/60">
                    Weekly
                  </div>
                </div>
                <div className="border-x border-white/10 text-center">
                  <div className="text-2xl font-black text-[#D2B66A]">R99</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/60">
                    Monthly
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">R799</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/60">
                    Yearly
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/account/subscription"
              className="mt-8 inline-block w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-xl hover:brightness-110 sm:w-auto"
            >
              🚀 Subscribe Now
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ===== SELL FORM =====
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <HeroBanner
        badgeText="Sell With Balray Autos"
        title={
          <>
            List Your
            <br />
            <span className="bg-gradient-to-r from-[#D2B66A] via-[#F4E0A1] to-[#B08D3C] bg-clip-text text-transparent">
              Vehicle.
            </span>
          </>
        }
        subtitle="Reach thousands of buyers across all 9 South African provinces. Add up to 10 watermarked photos and a video — free for your first 3 listings."
        primaryCTA={{ label: "Browse Marketplace", href: "/marketplace" }}
        secondaryCTA={{ label: "Start Selling Below", href: "#sell-form" }}
        height="md"
      />

      <section id="sell-form" className="w-full bg-[#F7F8F9]">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {!hasActiveSubscription && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-[#D3B86A]/50 bg-gradient-to-r from-[#FBF7EC] to-[#F7F8F9] p-5">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-xl text-white">
                    🎁
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
                      Free Listings
                    </div>
                    <div className="mt-1 text-lg font-black text-[#34414A]">
                      {listingCount} of {FREE_LISTING_LIMIT} used
                    </div>
                  </div>
                </div>
                {listingCount === FREE_LISTING_LIMIT - 1 && (
                  <div className="text-xs font-bold text-red-600">
                    ⚠ Last free listing — subscribe next time to keep posting
                  </div>
                )}
              </div>
            </div>
          )}

          {hasActiveSubscription && (
            <div className="mb-6 rounded-2xl border border-green-300 bg-green-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-xl text-white">
                  🚀
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">
                    Active {subscriptionTier} Subscription
                  </div>
                  <div className="mt-1 text-sm font-black text-green-700">
                    ✅ Unlimited posting unlocked
                    {subscriptionExpiry &&
                      ` — expires ${new Date(subscriptionExpiry).toLocaleDateString(
                        "en-ZA",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FBF7EC] text-4xl">
                ✓
              </div>
              <h2 className="mt-6 text-3xl font-black text-[#34414A] sm:text-4xl">
                Thank You!
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#66737C]">
                Your listing has been saved and submitted for review.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/marketplace"
                  className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 font-bold text-white"
                >
                  Browse Marketplace
                </Link>
                <Link
                  href="/my-listings"
                  className="rounded-xl border border-[#B08D3C] bg-white px-6 py-4 font-bold text-[#8F7130]"
                >
                  View My Listings
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm"
            >
              <div className="border-b border-[#E1E5E8] bg-[#34414A] px-6 py-8 sm:px-10">
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#D2B66A]">
                  Listing Information
                </div>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  Tell us about what you&apos;re selling
                </h2>
              </div>

              {errorMessage && (
                <div className="bg-red-50 p-4 text-center text-sm font-bold text-red-600 border-b border-red-200">
                  Error: {errorMessage}
                </div>
              )}

              <div className="space-y-10 p-6 sm:p-10">
                <div>
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                      01
                    </div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">
                      Your Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">🔒</span>
                        <p className="text-xs leading-5 text-[#8F7130]">
                          Your name, email, and phone are locked to your account
                          and are used automatically on this advert.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-[#34414A]">
                          Full Name
                        </label>
                        <div className="flex items-center gap-2 rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] px-4 py-3.5">
                          <span className="text-lg">👤</span>
                          <span className="truncate text-sm font-bold text-[#66737C]">
                            {profile?.full_name ||
                              user.user_metadata?.full_name ||
                              "Not set"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-[#34414A]">
                          Email
                        </label>
                        <div className="flex items-center gap-2 rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] px-4 py-3.5">
                          <span className="text-lg">✉️</span>
                          <span className="truncate text-sm font-bold text-[#66737C]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-[#34414A]">
                          Phone
                        </label>
                        <div className="flex items-center gap-2 rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] px-4 py-3.5">
                          <span className="text-lg">📱</span>
                          <span className="truncate text-sm font-bold text-[#66737C]">
                            {profile?.phone ||
                              user.user_metadata?.phone ||
                              "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="sellerType"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Seller Type *
                      </label>
                      <select
                        id="sellerType"
                        name="sellerType"
                        required
                        defaultValue=""
                        className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      >
                        <option value="" disabled>
                          Select seller type
                        </option>
                        <option value="private">Private Seller</option>
                        <option value="dealer">Dealer</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E1E5E8] pt-10">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                      02
                    </div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">
                      What Are You Selling?
                    </h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="category"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        defaultValue=""
                        className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        <option value="cars">Cars & SUVs</option>
                        <option value="bakkies">Bakkies & 4x4s</option>
                        <option value="motorcycles">Motorcycles</option>
                        <option value="trucks">Trucks & Commercial</option>
                        <option value="machinery">Machinery & Equipment</option>
                        <option value="parts">Parts & Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="condition"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Condition *
                      </label>
                      <select
                        id="condition"
                        name="condition"
                        required
                        defaultValue=""
                        className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      >
                        <option value="" disabled>
                          Select condition
                        </option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="demo">Demo / Ex-Demo</option>
                        <option value="refurbished">Refurbished</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E1E5E8] pt-10">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                      03
                    </div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">
                      Vehicle / Product Details
                    </h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="make"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Make / Brand *
                      </label>
                      <input
                        id="make"
                        name="make"
                        type="text"
                        required
                        placeholder="e.g. Toyota"
                        className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="model"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Model / Product Name *
                      </label>
                      <input
                        id="model"
                        name="model"
                        type="text"
                        required
                        placeholder="e.g. Hilux 2.8 GD-6"
                        className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="year"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Year
                      </label>
                      <input
                        id="year"
                        name="year"
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="e.g. 2022"
                        className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="price"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Asking Price (R) *
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 489900"
                        className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="mileage"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Mileage / Hours
                      </label>
                      <input
                        id="mileage"
                        name="mileage"
                        type="text"
                        placeholder="e.g. 68,000 km"
                        className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="location"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Location *
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        required
                        placeholder="e.g. Gqeberha, Eastern Cape"
                        className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="transmission"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Transmission
                      </label>
                      <select
                        id="transmission"
                        name="transmission"
                        defaultValue=""
                        className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      >
                        <option value="">Select transmission</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                        <option value="cvt">CVT</option>
                        <option value="other">Other / N/A</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="fuel"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Fuel Type
                      </label>
                      <select
                        id="fuel"
                        name="fuel"
                        defaultValue=""
                        className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      >
                        <option value="">Select fuel type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                        <option value="other">Other / N/A</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-5">
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-bold text-[#34414A]"
                    >
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={6}
                      placeholder="Describe the vehicle or product. Do not include phone numbers — buyers will contact you using the Call/WhatsApp buttons."
                      className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm leading-6 text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                    />
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                      <span>⚠️</span>
                      <span>
                        Phone numbers in descriptions are automatically blocked
                        to protect buyers from scams.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E1E5E8] pt-10">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                      04
                    </div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">
                      Photos & Video
                    </h3>
                    <p className="mt-1 text-sm text-[#66737C]">
                      Up to 10 photos (watermarked) and 1 optional video.
                    </p>
                  </div>

                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D3B86A] bg-[#FBF7EC] px-4 py-2 text-xs font-bold text-[#8F7130] hover:bg-[#F5EDD8]"
                    >
                      📷 Take Photo with Camera
                    </button>
                  </div>

                  <ImageVideoManager
                    userId={user.id}
                    initialImages={[]}
                    initialVideo={null}
                    onImagesChange={() => {}}
                    onVideoChange={() => {}}
                    maxImages={10}
                    uploadRef={uploadRef}
                  />
                </div>

                <div className="border-t border-[#E1E5E8] pt-10">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 accent-[#B08D3C]"
                    />
                    <span className="text-sm leading-6 text-[#66737C]">
                      I confirm that the information provided is accurate and
                      that I have the right to advertise this vehicle or
                      product.
                    </span>
                  </label>
                </div>

                <div className="border-t border-[#E1E5E8] pt-8">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-base font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {uploading ? "UPLOADING..." : "SUBMIT LISTING"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {showCamera && (
        <CameraCapture
          onPhotosCaptured={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </main>
  );
}