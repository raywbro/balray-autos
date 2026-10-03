"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import CameraCapture from "@/app/components/CameraCapture";
import ImageVideoManager from "@/app/components/ImageVideoManager";
import ShowroomHero from "@/app/components/ShowroomHero";

export default function SellPage() {
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  const uploadRef = useRef<
    (() => Promise<{ images: string[]; video: string | null }>) | null
  >(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profile);
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

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
    setUploading(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      let uploadedImages: string[] = [];
      let uploadedVideo: string | null = null;

      if (uploadRef.current) {
        const result = await uploadRef.current();
        uploadedImages = result.images;
        uploadedVideo = result.video;
      }

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

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      {/* SHOWROOM HERO */}
      <ShowroomHero
        subtitle="Reach thousands of buyers across South Africa. List your car, bakkie, motorcycle, truck, tractor, machinery or parts — completely free."
        primaryCTA={{ label: "Browse Marketplace", href: "/marketplace" }}
        secondaryCTA={{ label: "Start Selling Below", href: "#sell-form" }}
      />

      <section id="sell-form" className="w-full bg-[#F7F8F9]">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {submitted ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FBF7EC] text-4xl">
                ✓
              </div>
              <div className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                Listing Submitted
              </div>
              <h2 className="mt-3 text-3xl font-black text-[#34414A] sm:text-4xl">
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
                          Your name, email, and phone are locked to your account and are used automatically on this advert.
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
                            {profile?.full_name || user.user_metadata?.full_name || "Not set"}
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
                            {profile?.phone || user.user_metadata?.phone || "Not set"}
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
                      placeholder="Describe the vehicle or product..."
                      className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm leading-6 text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                    />
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