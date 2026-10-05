"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

export default function EditListingPage() {
  const params = useParams();
  const listingId = params?.id as string;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

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

      if (listingData.status !== "pending") {
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

      setSuccessMessage("✓ Listing updated. Admin will review the changes.");
      setSaving(false);
      setTimeout(() => {
        router.push("/my-listings");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
      setSaving(false);
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

  if (forbidden || !listing) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="max-w-md rounded-2xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-4 text-2xl font-black text-[#34414A]">
            Cannot Edit This Listing
          </h1>
          <p className="mt-3 text-sm text-[#66737C]">
            Either this listing doesn&apos;t exist, it&apos;s not yours, or it
            has already been approved by admin. Only pending listings can be
            edited.
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/my-listings"
              className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A7B37] hover:underline"
            >
              ← Back to My Listings
            </Link>
            <h1 className="mt-2 text-3xl font-black text-[#34414A]">
              Edit Your Listing
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              You can edit this listing until admin approves it.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-yellow-800">
            ⏳ Pending Review
          </div>
        </div>

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

        <form
          onSubmit={handleSave}
          className="overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm"
        >
          <div className="border-b border-[#E1E5E8] bg-[#34414A] px-6 py-6 sm:px-8">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#D2B66A]">
              Edit Details
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">
              {listing.year} {listing.make} {listing.model}
            </h2>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
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
                  defaultValue={listing.seller_type || ""}
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
                  defaultValue={listing.category || ""}
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
                  defaultValue={listing.condition || ""}
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
                  defaultValue={listing.make || ""}
                  className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="mb-2 block text-sm font-bold text-[#34414A]"
                >
                  Model *
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  required
                  defaultValue={listing.model || ""}
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
                  defaultValue={listing.year || ""}
                  className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-bold text-[#34414A]"
                >
                  Price (R) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  required
                  defaultValue={listing.price || ""}
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
                  defaultValue={listing.mileage || ""}
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
                  defaultValue={listing.location || ""}
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
                  defaultValue={listing.transmission || ""}
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
                  defaultValue={listing.fuel || ""}
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

            <div>
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
                defaultValue={listing.description || ""}
                className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />
            </div>

            <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">ℹ️</span>
                <p className="text-xs leading-5 text-[#8F7130]">
                  <strong>Images & video cannot be changed here.</strong> If
                  you need to swap photos, delete this listing and create a new
                  one, or wait for admin to approve and update manually.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E1E5E8] pt-6 sm:flex-row">
              <Link
                href="/my-listings"
                className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-6 py-4 text-center text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}