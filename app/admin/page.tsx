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
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Check if user is an admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/"); // Kick non-admins back to home
        return;
      }

      // 3. If admin, fetch ALL listings
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
            Review, approve, and delete any vehicle on the Balray Autos marketplace.
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#D5DBDF] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images?.[0] || "/placeholder.png"}
                    className="h-20 w-28 rounded-xl object-cover bg-[#E9EDF0]"
                    alt={item.model}
                  />
                  <div>
                    <h3 className="text-lg font-black text-[#34414A]">
                      {item.year} {item.make} {item.model}
                    </h3>
                    <p className="text-sm font-bold text-[#9A7B37] mt-1">
                      R{Number(item.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-[#66737C] mt-1">
                      Listed by: {item.seller_name} • 📍 {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-stretch lg:flex-row">
                  <Link
                    href={`/listing/${item.id}`}
                    className="rounded-xl border border-[#B08D3C] bg-white px-5 py-2.5 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                  >
                    View
                  </Link>
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