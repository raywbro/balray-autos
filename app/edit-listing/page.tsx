"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function EditListingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [listing, setListing] = useState<any>(null);

  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const id = params.id as string;

  useEffect(() => {
    const loadListing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErrorMessage("Listing not found.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const isOwner = data.user_id === user.id;
      const isAdmin = profile?.role === "admin";

      if (!isOwner && !isAdmin) {
        setErrorMessage("You do not have permission to edit this listing.");
        setLoading(false);
        return;
      }

      setListing(data);
      setLoading(false);
    };

    if (id) loadListing();
  }, [id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const newPrice = Number(formData.get("price"));
    const oldPrice = Number(listing.price);

    // Detect price drop and store previous price
    const priceDropped = newPrice < oldPrice;
    const previousPrice = priceDropped ? oldPrice : listing.previous_price || null;

    const updates: any = {
      seller_name: formData.get("sellerName"),
      seller_phone: formData.get("phone"),
      seller_email: formData.get("email"),
      seller_type: formData.get("sellerType"),
      category: formData.get("category"),
      condition: formData.get("condition"),
      make: formData.get("make"),
      model: formData.get("model"),
      year: formData.get("year") ? Number(formData.get("year")) : null,
      price: newPrice,
      mileage: formData.get("mileage"),
      location: formData.get("location"),
      transmission: formData.get("transmission"),
      fuel: formData.get("fuel"),
      description: formData.get("description"),
      status: "pending",
    };

    // Only update previous_price when a drop occurs (preserve original "was" price for buyers)
    if (priceDropped) {
      updates.previous_price = previousPrice;
    }

    const { error } = await supabase.from("listings").update(updates).eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
    } else {
      if (priceDropped) {
        const savings = oldPrice - newPrice;
        setSuccessMessage(
          `🎉 Listing updated! Price dropped by R${savings.toLocaleString()}. It will be re-approved by an admin.`
        );
      } else {
        setSuccessMessage("Listing updated! It will need to be re-approved by an admin.");
      }
      setSaving(false);
      setTimeout(() => router.push("/my-listings"), 2500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading listing...
        </div>
      </main>
    );
  }

  if (errorMessage && !listing) {
    return (
      <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-black text-[#34414A] mb-4">{errorMessage}</h1>
          <Link
            href="/my-listings"
            className="inline-block rounded-xl bg-[#34414A] px-6 py-4 font-bold text-white"
          >
            Back to My Listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Edit Listing
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              Update Your<br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                Vehicle.
              </span>
            </h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              Make changes below. Your listing will go back to pending review.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9]">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm"
          >
            <div className="border-b border-[#E1E5E8] bg-[#34414A] px-6 py-8 sm:px-10">
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Edit Listing Details
              </h2>
              <p className="mt-2 text-sm text-[#D9DEE2]">
                You cannot edit images here — that feature is coming soon.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 p-4 text-center text-sm font-bold text-red-600 border-b border-red-200">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 p-4 text-center text-sm font-bold text-green-600 border-b border-green-200">
                {successMessage}
              </div>
            )}

            <div className="space-y-10 p-6 sm:p-10">
              {/* SELLER INFO */}
              <div>
                <div className="mb-5">
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">01</div>
                  <h3 className="mt-1 text-xl font-black text-[#34414A]">Your Information</h3>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Full Name *</label>
                    <input name="sellerName" type="text" required defaultValue={listing.seller_name} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Phone Number *</label>
                    <input name="phone" type="tel" required defaultValue={listing.seller_phone} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Email Address</label>
                    <input name="email" type="email" defaultValue={listing.seller_email} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Seller Type *</label>
                    <select name="sellerType" required defaultValue={listing.seller_type} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
                      <option value="private">Private Seller</option>
                      <option value="dealer">Dealer</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CATEGORY */}
              <div className="border-t border-[#E1E5E8] pt-10">
                <div className="mb-5">
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">02</div>
                  <h3 className="mt-1 text-xl font-black text-[#34414A]">What Are You Selling?</h3>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Category *</label>
                    <select name="category" required defaultValue={listing.category} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
                      <option value="cars">Cars & SUVs</option>
                      <option value="bakkies">Bakkies & 4x4s</option>
                      <option value="motorcycles">Motorcycles</option>
                      <option value="trucks">Trucks & Commercial</option>
                      <option value="machinery">Machinery & Equipment</option>
                      <option value="parts">Parts & Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Condition *</label>
                    <select name="condition" required defaultValue={listing.condition} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
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
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Make / Brand *</label>
                    <input name="make" type="text" required defaultValue={listing.make} className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Model / Product Name *</label>
                    <input name="model" type="text" required defaultValue={listing.model} className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Year</label>
                    <input name="year" type="number" min="1900" max="2100" defaultValue={listing.year || ""} className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Asking Price (R) *</label>
                    <input name="price" type="number" min="0" required defaultValue={listing.price} className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                    <p className="mt-2 text-xs text-[#89939A]">
                      💡 Lower the price to trigger a &quot;Price Drop&quot; badge on your listing.
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Mileage / Hours</label>
                    <input name="mileage" type="text" defaultValue={listing.mileage || ""} className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Location *</label>
                    <input name="location" type="text" required defaultValue={listing.location} className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Transmission</label>
                    <select name="transmission" defaultValue={listing.transmission || ""} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
                      <option value="">Select transmission</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="cvt">CVT</option>
                      <option value="other">Other / N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#34414A]">Fuel Type</label>
                    <select name="fuel" defaultValue={listing.fuel || ""} className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20">
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
                  <label className="mb-2 block text-sm font-bold text-[#34414A]">Description *</label>
                  <textarea name="description" required rows={6} defaultValue={listing.description} className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20" />
                </div>
              </div>

              {/* SUBMIT */}
              <div className="border-t border-[#E1E5E8] pt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-base font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? "SAVING CHANGES..." : "SAVE CHANGES"}
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-[#89939A]">
                  After saving, your listing will be re-reviewed by Balray Autos.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}