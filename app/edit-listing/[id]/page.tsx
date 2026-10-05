"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

export default function EditListingPage() {
  const params = useParams();
  const listingId = params?.id as string;
  const router = useRouter();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: listingData, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (error || !listingData) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      if (listingData.user_id !== user.id) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      if (listingData.status === "sold") {
        setForbidden(true);
        setLoading(false);
        return;
      }

      setListing(listingData);
      setLoading(false);
    };
    load();
  }, [listingId, router]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    try {
      const wasActive = listing.status === "active";

      const updates = {
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
        status: "pending",
        expires_at: null,
      };

      const { error } = await supabase
        .from("listings")
        .update(updates)
        .eq("id", listingId);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage(
        wasActive
          ? "✓ Saved. Your listing is back in review."
          : "✓ Listing updated."
      );
      setSaving(false);
      setTimeout(() => router.push("/my-listings"), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading...
        </div>
      </main>
    );
  }

  if (forbidden || !listing) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="max-w-md rounded-2xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-4 text-2xl font-black text-[#34414A]">
            Cannot Edit
          </h1>
          <p className="mt-3 text-sm text-[#66737C]">
            This listing doesn&apos;t exist, isn&apos;t yours, or is sold.
          </p>
          <Link
            href="/my-listings"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-sm font-bold text-white"
          >
            Back to My Listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/my-listings"
            className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A7B37] hover:underline"
          >
            ← Back
          </Link>
          <h1 className="mt-2 text-3xl font-black">Edit Listing</h1>
          <p className="mt-2 text-sm text-[#66737C]">
            {listing.status === "active"
              ? "This listing is live. Saving will send it back to admin for approval."
              : "Saving updates your pending listing."}
          </p>
        </div>

        {listing.status === "active" && (
          <div className="mb-6 rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            ⚠️ Editing will take this listing off the marketplace until admin
            re-approves.
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm font-bold text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 rounded-3xl border border-[#D5DBDF] bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">Seller Type *</label>
              <select
                name="sellerType"
                required
                defaultValue={listing.seller_type || ""}
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              >
                <option value="" disabled>Select</option>
                <option value="private">Private Seller</option>
                <option value="dealer">Dealer</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Category *</label>
              <select
                name="category"
                required
                defaultValue={listing.category || ""}
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              >
                <option value="" disabled>Select</option>
                <option value="cars">Cars & SUVs</option>
                <option value="bakkies">Bakkies & 4x4s</option>
                <option value="motorcycles">Motorcycles</option>
                <option value="trucks">Trucks & Commercial</option>
                <option value="machinery">Machinery & Equipment</option>
                <option value="parts">Parts & Accessories</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Condition *</label>
              <select
                name="condition"
                required
                defaultValue={listing.condition || ""}
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              >
                <option value="" disabled>Select</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="demo">Demo / Ex-Demo</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Make *</label>
              <input
                name="make"
                type="text"
                required
                defaultValue={listing.make || ""}
                className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Model *</label>
              <input
                name="model"
                type="text"
                required
                defaultValue={listing.model || ""}
                className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Year</label>
              <input
                name="year"
                type="number"
                defaultValue={listing.year || ""}
                className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Price (R) *</label>
              <input
                name="price"
                type="number"
                required
                defaultValue={listing.price || ""}
                className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Mileage</label>
              <input
                name="mileage"
                type="text"
                defaultValue={listing.mileage || ""}
                className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Location *</label>
              <input
                name="location"
                type="text"
                required
                defaultValue={listing.location || ""}
                className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Transmission</label>
              <select
                name="transmission"
                defaultValue={listing.transmission || ""}
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              >
                <option value="">Select</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="cvt">CVT</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Fuel Type</label>
              <select
                name="fuel"
                defaultValue={listing.fuel || ""}
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
              >
                <option value="">Select</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Description *</label>
            <textarea
              name="description"
              required
              rows={6}
              defaultValue={listing.description || ""}
              className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/my-listings"
              className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-6 py-4 text-center text-sm font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}