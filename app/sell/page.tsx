"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import imageCompression from "browser-image-compression";

const CameraCapture = dynamic(() => import("@/app/components/CameraCapture"), {
  ssr: false,
});

export default function SellPage() {
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const combined = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(combined);

    const newPreviews: string[] = [];
    combined.forEach((file) => {
      newPreviews.push(URL.createObjectURL(file));
    });
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
  };

  const handlePhotosCaptured = (files: File[]) => {
    const combined = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(combined);

    const newPreviews: string[] = [];
    combined.forEach((file) => {
      newPreviews.push(URL.createObjectURL(file));
    });
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedFiles.length) return;

    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const make = (formData.get("make") as string)?.trim();
    const model = (formData.get("model") as string)?.trim();
    const year = formData.get("year") ? Number(formData.get("year")) : null;
    const price = Number(formData.get("price"));

    // Duplicate pre-check
    try {
      let query = supabase
        .from("listings")
        .select("id")
        .eq("user_id", user.id)
        .ilike("make", make)
        .ilike("model", model)
        .eq("price", price)
        .in("status", ["pending", "active"]);

      if (year !== null) {
        query = query.eq("year", year);
      } else {
        query = query.is("year", null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        setErrorMessage(
          "You already have a live listing for this exact vehicle. Please edit your existing listing instead."
        );
        setUploading(false);
        return;
      }
    } catch (err) {
      console.error("Duplicate check failed:", err);
    }

    const imageUrls: string[] = [];

    try {
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress(`Compressing image ${i + 1} of ${selectedFiles.length}...`);

          const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            fileType: "image/jpeg",
            initialQuality: 0.85,
          });

          setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`);

          const fileName = `${user.id}-${Date.now()}-${i}-${Math.random()
            .toString(36)
            .substring(7)}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("car-images")
            .upload(fileName, compressedFile, {
              contentType: "image/jpeg",
              cacheControl: "3600",
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("car-images")
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
        }
      }

      setUploadProgress("Saving your listing...");

      const newListing = {
        user_id: user.id,
        seller_name: formData.get("sellerName"),
        seller_phone: formData.get("phone"),
        seller_email: formData.get("email") || user.email,
        seller_type: formData.get("sellerType"),
        category: formData.get("category"),
        condition: formData.get("condition"),
        make,
        model,
        year,
        price,
        mileage: formData.get("mileage"),
        location: formData.get("location"),
        transmission: formData.get("transmission"),
        fuel: formData.get("fuel"),
        description: formData.get("description"),
        images: imageUrls,
        status: "pending",
      };

      const { data: inserted, error: dbError } = await supabase
        .from("listings")
        .insert([newListing])
        .select()
        .single();

      if (dbError) {
        if (
          dbError.message?.includes("listings_dedupe_idx") ||
          dbError.code === "23505" ||
          dbError.message?.toLowerCase().includes("duplicate")
        ) {
          throw new Error(
            "You already have a live listing for this exact vehicle. Please edit your existing listing instead."
          );
        }
        throw dbError;
      }

      // Admin notification (silent fail)
      try {
        await fetch("/api/notify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: inserted?.id,
            sellerName: newListing.seller_name,
            sellerEmail: newListing.seller_email,
            sellerPhone: newListing.seller_phone,
            listingTitle: `${newListing.year || ""} ${newListing.make} ${newListing.model}`.trim(),
            listingPrice: `R${newListing.price.toLocaleString()}`,
            category: newListing.category,
            location: newListing.location,
          }),
        });
      } catch (err) {
        console.error("Admin notification failed:", err);
      }

      previews.forEach((url) => URL.revokeObjectURL(url));

      setUploading(false);
      setUploadProgress("");
      setSubmitted(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      setUploading(false);
      setUploadProgress("");
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
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Sell With Balray Autos
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl lg:text-6xl">
              List Your<br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                Vehicle.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Submit your vehicle or automotive product to Balray Autos. Your listing will be reviewed before it appears on our marketplace.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9]">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {submitted ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FBF7EC] text-4xl">✓</div>
              <div className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">Listing Submitted</div>
              <h2 className="mt-3 text-3xl font-black text-[#34414A] sm:text-4xl">Thank You!</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#66737C]">
                Your listing and photos have been saved to our database and submitted to Balray Autos for review.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/marketplace" className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 font-bold text-white">
                  Browse Marketplace
                </Link>
                <Link href="/my-listings" className="rounded-xl border border-[#B08D3C] bg-white px-6 py-4 font-bold text-[#8F7130]">
                  View My Listings
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm">
              <div className="border-b border-[#E1E5E8] bg-[#34414A] px-6 py-8 sm:px-10">
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#D2B66A]">Listing Information</div>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Tell us about what you&apos;re selling</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#D9DEE2]">Complete the form below. Your information will be used to create your marketplace listing.</p>
                <div className="mt-4 inline-block rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-[#D2B66A]">
                  Logged in as: {user.email}
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 p-4 text-center text-sm font-bold text-red-600 border-b border-red-200">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="space-y-10 p-6 sm:p-10">
                {/* SELLER INFORMATION */}
                <div>
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">01</div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">Your Information</h3>
                    <p className="mt-1 text-sm text-[#66737C]">Tell us who is submitting this listing.</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="sellerName" className="mb-2 block text-sm font-bold text-[#34414A]">Full Name *</label>
                      <input id="sellerName" name="sellerName" type="text" required placeholder="Your full name" className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none transition focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-bold text-[#34414A]">Phone Number *</label>
                      <input id="phone" name="phone" type="tel" required placeholder="e.g. 082 123 4567" className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none transition focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#34414A]">Email Address</label>
                      <input id="email" name="email" type="email" placeholder={user.email} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none transition focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="sellerType" className="mb-2 block text-sm font-bold text-[#34414A]">Seller Type *</label>
                      <select id="sellerType" name="sellerType" required defaultValue="" className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
                        <option value="" disabled>Select seller type</option>
                        <option value="private">Private Seller</option>
                        <option value="dealer">Dealer</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LISTING CATEGORY */}
                <div className="border-t border-[#E1E5E8] pt-10">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">02</div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">What Are You Selling?</h3>
                    <p className="mt-1 text-sm text-[#66737C]">Choose the category that best matches your listing.</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="category" className="mb-2 block text-sm font-bold text-[#34414A]">Category *</label>
                      <select id="category" name="category" required defaultValue="" className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
                        <option value="" disabled>Select category</option>
                        <option value="cars">Cars & SUVs</option>
                        <option value="bakkies">Bakkies & 4x4s</option>
                        <option value="motorcycles">Motorcycles</option>
                        <option value="trucks">Trucks & Commercial</option>
                        <option value="machinery">Machinery & Equipment</option>
                        <option value="parts">Parts & Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="condition" className="mb-2 block text-sm font-bold text-[#34414A]">Condition *</label>
                      <select id="condition" name="condition" required defaultValue="" className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
                        <option value="" disabled>Select condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="demo">Demo / Ex-Demo</option>
                        <option value="refurbished">Refurbished</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* VEHICLE DETAILS */}
                <div className="border-t border-[#E1E5E8] pt-10">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">03</div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">Vehicle / Product Details</h3>
                    <p className="mt-1 text-sm text-[#66737C]">Give potential buyers the important information.</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="make" className="mb-2 block text-sm font-bold text-[#34414A]">Make / Brand *</label>
                      <input id="make" name="make" type="text" required placeholder="e.g. Toyota" className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="model" className="mb-2 block text-sm font-bold text-[#34414A]">Model / Product Name *</label>
                      <input id="model" name="model" type="text" required placeholder="e.g. Hilux 2.8 GD-6" className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="year" className="mb-2 block text-sm font-bold text-[#34414A]">Year</label>
                      <input id="year" name="year" type="number" min="1900" max="2100" placeholder="e.g. 2022" className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="price" className="mb-2 block text-sm font-bold text-[#34414A]">Asking Price (R) *</label>
                      <input id="price" name="price" type="number" min="0" required placeholder="e.g. 489900" className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="mileage" className="mb-2 block text-sm font-bold text-[#34414A]">Mileage / Hours</label>
                      <input id="mileage" name="mileage" type="text" placeholder="e.g. 68,000 km" className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="location" className="mb-2 block text-sm font-bold text-[#34414A]">Location *</label>
                      <input id="location" name="location" type="text" required placeholder="e.g. Gqeberha, Eastern Cape" className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    </div>
                    <div>
                      <label htmlFor="transmission" className="mb-2 block text-sm font-bold text-[#34414A]">Transmission</label>
                      <select id="transmission" name="transmission" defaultValue="" className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
                        <option value="">Select transmission</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                        <option value="cvt">CVT</option>
                        <option value="other">Other / N/A</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="fuel" className="mb-2 block text-sm font-bold text-[#34414A]">Fuel Type</label>
                      <select id="fuel" name="fuel" defaultValue="" className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
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
                    <label htmlFor="description" className="mb-2 block text-sm font-bold text-[#34414A]">Description *</label>
                    <textarea id="description" name="description" required rows={6} placeholder="Describe the vehicle or product, condition, features, service history..." className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm leading-6 text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                </div>

                {/* IMAGES */}
                <div className="border-t border-[#E1E5E8] pt-10">
                  <div className="mb-5">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">04</div>
                    <h3 className="mt-1 text-xl font-black text-[#34414A]">Photos</h3>
                    <p className="mt-1 text-sm text-[#66737C]">
                      Add up to 10 photos. The first image becomes the main photo. Use the arrows to reorder.
                    </p>
                  </div>

                  {previews.length > 0 && (
                    <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {previews.map((preview, index) => (
                        <div
                          key={index}
                          className={`relative overflow-hidden rounded-xl border-2 ${
                            index === 0 ? "border-[#B08D3C]" : "border-[#D5DBDF]"
                          }`}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="aspect-[16/10] h-full w-full object-cover"
                          />

                          {index === 0 && (
                            <div className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-2 py-1 text-[10px] font-bold text-white shadow-md">
                              MAIN
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                            aria-label="Remove image"
                          >
                            ×
                          </button>

                          <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => moveImage(index, "left")}
                              disabled={index === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-[#34414A] shadow-md transition hover:bg-white disabled:opacity-30"
                              aria-label="Move left"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(index, "right")}
                              disabled={index === previews.length - 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-[#34414A] shadow-md transition hover:bg-white disabled:opacity-30"
                              aria-label="Move right"
                            >
                              →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFiles.length < 10 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <label
                        htmlFor="photos"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D5DBDF] bg-[#F7F8F9] px-6 py-8 text-center transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
                      >
                        <div className="text-3xl">🖼️</div>
                        <div className="mt-3 font-bold text-[#34414A]">
                          {previews.length === 0 ? "Choose from Gallery" : "Add More Photos"}
                        </div>
                        <div className="mt-1 text-xs text-[#66737C]">JPG, PNG or WEBP</div>
                        <input
                          id="photos"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFilesSelected}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D5DBDF] bg-[#F7F8F9] px-6 py-8 text-center transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
                      >
                        <div className="text-3xl">📸</div>
                        <div className="mt-3 font-bold text-[#34414A]">Take Photos Now</div>
                        <div className="mt-1 text-xs text-[#66737C]">Take multiple photos in one session</div>
                      </button>
                    </div>
                  )}

                  {selectedFiles.length > 0 && (
                    <p className="mt-3 text-center text-xs text-[#89939A]">
                      {selectedFiles.length} image{selectedFiles.length === 1 ? "" : "s"} selected
                      {selectedFiles.length >= 10 && " (maximum reached)"}
                    </p>
                  )}
                </div>

                {/* TERMS */}
                <div className="border-t border-[#E1E5E8] pt-10">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" required className="mt-1 h-4 w-4 accent-[#B08D3C]" />
                    <span className="text-sm leading-6 text-[#66737C]">
                      I confirm that the information provided is accurate and that I have the right to advertise this vehicle or product.
                    </span>
                  </label>
                </div>

                {/* SUBMIT */}
                <div className="border-t border-[#E1E5E8] pt-8">
                  <button type="submit" disabled={uploading} className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-base font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed">
                    {uploading ? uploadProgress || "UPLOADING..." : "SUBMIT LISTING"}
                  </button>
                  <p className="mt-4 text-center text-xs leading-5 text-[#89939A]">
                    Your listing will be reviewed by Balray Autos before it becomes publicly visible.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {showCamera && (
        <CameraCapture
          onPhotosCaptured={handlePhotosCaptured}
          onClose={() => setShowCamera(false)}
        />
      )}

      <Footer />
    </main>
  );
}