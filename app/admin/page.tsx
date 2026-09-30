"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setListings(data || []);
      }
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [router, supabase]);

  const handleApprove = async (id: string) => {
    const confirmed = confirm("Approve this listing? It will become visible on the public marketplace.");
    if (!confirmed) return;

    const { error } = await supabase
      .from("listings")
      .update({ status: "active" })
      .eq("id", id);

    if (error) {
      alert("Error approving listing: " + error.message);
    } else {
      setListings(listings.map((item) => (item.id === id ? { ...item, status: "active" } : item)));
      setMessage("Listing approved successfully.");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const newValue = !currentFeatured;
    const action = newValue ? "feature" : "un-feature";
    const confirmed = confirm(`Are you sure you want to ${action} this listing?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("listings")
      .update({ featured: newValue })
      .eq("id", id);

    if (error) {
      alert("Error updating listing: " + error.message);
    } else {
      setListings(listings.map((item) => (item.id === id ? { ...item, featured: newValue } : item)));
      setMessage(`Listing ${newValue ? "featured" : "un-featured"} successfully.`);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Admin Action: Are you sure you want to delete this listing permanently?");
    if (!confirmed) return;

    const { error } = await supabase.from("listings").delete().eq("id", id);
    
    if (error) {
      alert("Error deleting listing: " + error.message);
    } else {
      setListings(listings.filter((item) => item.id !== id));
      setMessage("Listing deleted successfully.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading Admin Dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
            Admin Control Panel
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#34414A]">
            Manage All Listings
          </h1>
          <p className="mt-2 text-sm text-[#66737C]">
            Review, approve, feature, and delete any vehicle on the Balray Autos marketplace.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 text-center text-sm font-bold text-[#8F7130]">
            {message}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
            <h2 className="text-xl font-black text-[#34414A]">No listings found</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm ${
                  item.featured ? "border-[#B08D3C] ring-2 ring-[#B08D3C]/20" : "border-[#D5DBDF]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images?.[0] || "/placeholder.png"}
                    className="h-20 w-28 rounded-xl object-cover bg-[#E9EDF0]"
                    alt={item.model}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-[#34414A]">
                        {item.year} {item.make} {item.model}
                      </h3>
                      {item.featured && (
                        <span className="rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-2 py-0.5 text-xs font-bold text-white">
                          ⭐ Featured
                        </span>
                      )}
                      {item.status === "active" ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Active</span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">Pending</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#9A7B37]">
                      R{Number(item.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-[#66737C] mt-1">
                      Listed by: {item.seller_name} • 📍 {item.location} • 👁️ {item.views || 0} views
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/listing/${item.id}`}
                    className="rounded-xl border border-[#B08D3C] bg-white px-5 py-2.5 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                  >
                    View
                  </Link>

                  {item.status !== "active" && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleFeatured(item.id, item.featured)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold ${
                      item.featured
                        ? "border border-[#B08D3C] bg-[#FBF7EC] text-[#8F7130] hover:bg-[#F5EDD8]"
                        : "bg-gradient-to-r from-[#8F7130] to-[#B08D3C] text-white hover:brightness-105"
                    }`}
                  >
                    {item.featured ? "★ Un-feature" : "☆ Feature"}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}