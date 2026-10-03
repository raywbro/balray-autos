"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";



const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

function daysUntil(expiresAt: string | null) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MyListingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [boostListing, setBoostListing] = useState<any>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchMyListings(user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  const fetchMyListings = async (userId: string) => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handleMarkAsSold = async (listingId: string) => {
    const confirmed = confirm("Mark this listing as SOLD? It will be hidden from the marketplace.");
    if (!confirmed) return;
    setSellingId(listingId);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status: "sold", sold_at: new Date().toISOString() })
      .eq("id", listingId);

    if (error) {
      setMessage("Error marking as sold: " + error.message);
    } else {
      setListings(
        listings.map((item) =>
          item.id === listingId ? { ...item, status: "sold", sold_at: new Date().toISOString() } : item
        )
      );
      setMessage("🎉 Congratulations on the sale! Listing marked as sold.");
      setTimeout(() => setMessage(""), 5000);
    }
    setSellingId(null);
  };

  const handleRenew = async (listingId: string) => {
    const confirmed = confirm("Renew this listing for another 30 days?");
    if (!confirmed) return;
    setRenewingId(listingId);
    setMessage("");

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);

    const { error } = await supabase
      .from("listings")
      .update({ status: "pending", expires_at: newExpiry.toISOString() })
      .eq("id", listingId);

    if (error) {
      setMessage("Error renewing listing: " + error.message);
    } else {
      setListings(
        listings.map((item) =>
          item.id === listingId ? { ...item, status: "pending", expires_at: newExpiry.toISOString() } : item
        )
      );
      setMessage("Listing renewed! It will go live again once approved.");
      setTimeout(() => setMessage(""), 5000);
    }
    setRenewingId(null);
  };

  const handleDelete = async (listingId: string, imageUrls: string[]) => {
    const confirmed = confirm("Are you sure you want to delete this listing? This cannot be undone.");
    if (!confirmed) return;
    setDeletingId(listingId);
    setMessage("");

    try {
      if (imageUrls && imageUrls.length > 0) {
        const fileNames = imageUrls
          .map((url) => {
            const parts = url.split("/car-images/");
            return parts.length > 1 ? parts[1] : null;
          })
          .filter(Boolean) as string[];

        if (fileNames.length > 0) {
          await supabase.storage.from("car-images").remove(fileNames);
        }
      }

      const { error } = await supabase.from("listings").delete().eq("id", listingId);
      if (error) throw error;

      setListings(listings.filter((item) => item.id !== listingId));
      setMessage("Listing deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage("Error deleting listing: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">Loading your listings...</div>
      </main>
    );
  }

  if (!user) return null;

  const totalViews = listings.reduce((sum, item) => sum + (item.views || 0), 0);
  const activeCount = listings.filter((l) => l.status === "active").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;
  const featuredCount = listings.filter((l) => l.featured === true).length;

  const buildBoostWhatsAppUrl = (listing: any) => {
    const title = `${listing.year ? listing.year + " " : ""}${listing.make} ${listing.model}`;
    const price = `R${Number(listing.price).toLocaleString()}`;
    const message = encodeURIComponent(
      `Hi Balray Autos! I want to BOOST my listing:\n\n🚗 ${title}\n💰 ${price}\n📍 ${listing.location}\n\nListing ID: ${listing.id}\n\nI'd like to feature it for 30 days. Please send me payment details.`
    );
    return `https://wa.me/27815973009?text=${message}`;
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Your Account
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">My Listings</h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">Manage your vehicles. Listings stay live for 30 days — you can renew anytime.</p>

            {listings.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">Active</div>
                  <div className="mt-1 text-2xl font-black text-[#34414A]">{activeCount}</div>
                </div>
                <div className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">Featured</div>
                  <div className="mt-1 text-2xl font-black text-[#8F7130]">⭐ {featuredCount}</div>
                </div>
                <div className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">Sold</div>
                  <div className="mt-1 text-2xl font-black text-green-600">🎉 {soldCount}</div>
                </div>
                <div className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">Total Views</div>
                  <div className="mt-1 text-2xl font-black text-[#34414A]">👁️ {totalViews}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {message && (
            <div className="mb-6 rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 text-center text-sm font-bold text-[#8F7130]">
              {message}
            </div>
          )}

          {listings.filter((l) => l.status === "active" && !l.featured).length > 0 && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-[#D3B86A]/50 bg-gradient-to-r from-[#FBF7EC] via-[#F7F8F9] to-[#FBF7EC] p-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white shadow-md">🚀</div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-[#34414A]">Boost Your Listing for 3× More Views</h3>
                  <p className="mt-1 text-sm text-[#66737C]">Featured listings appear at the top of the marketplace with a golden badge.</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">Only</div>
                  <div className="text-2xl font-black text-[#8F7130]">R99</div>
                  <div className="text-xs text-[#66737C]">for 30 days</div>
                </div>
              </div>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">🚗</div>
              <h2 className="mt-6 text-2xl font-black text-[#34414A]">You have no listings yet</h2>
              <p className="mt-3 text-sm text-[#66737C]">Once you list a vehicle, it will appear here.</p>
              <Link href="/sell" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md hover:brightness-105">
                List Your First Vehicle
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {listings.map((listing) => {
                const title = `${listing.year ? listing.year + " " : ""}${listing.make} ${listing.model}`;
                const price = `R${Number(listing.price).toLocaleString()}`;
                const category = categoryMap[listing.category] || listing.category;
                const image =
                  listing.images && listing.images.length > 0
                    ? listing.images[0]
                    : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80";

                const daysLeft = daysUntil(listing.expires_at);
                const isExpired = daysLeft !== null && daysLeft <= 0 && listing.status === "active";
                const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 5;
                const isSold = listing.status === "sold";
                const canBoost = listing.status === "active" && !listing.featured && !isExpired;

                return (
                  <div
                    key={listing.id}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                      isSold ? "border-green-300 ring-2 ring-green-100" : listing.featured ? "border-2 border-[#B08D3C] ring-2 ring-[#B08D3C]/20" : "border-[#D5DBDF]"
                    }`}
                  >
                    <div className="grid gap-0 sm:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="relative aspect-[16/10] sm:aspect-auto sm:h-full bg-[#E9EDF0]">
                        <Image
                          src={image}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, 220px"
                          className={`object-cover ${isSold ? "opacity-60 grayscale" : ""}`}
                          quality={75}
                        />
                        {isSold && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="-rotate-12 rounded-lg bg-green-600 px-6 py-3 text-2xl font-black text-white shadow-lg">SOLD</div>
                          </div>
                        )}
                        {listing.featured && !isSold && (
                          <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-1.5 text-xs font-black text-white shadow-md">⭐ FEATURED</div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between p-6">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-block rounded-full bg-[#FBF7EC] px-3 py-1 text-xs font-bold text-[#8F7130]">{category}</div>
                            {isSold ? (
                              <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">🎉 Sold</div>
                            ) : listing.status === "active" ? (
                              isExpired ? (
                                <div className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700">⌛ Expired</div>
                              ) : (
                                <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">✓ Active</div>
                              )
                            ) : (
                              <div className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">⏳ Pending Review</div>
                            )}
                            <div className="inline-block rounded-full bg-[#F7F8F9] px-3 py-1 text-xs font-bold text-[#34414A]">👁️ {listing.views || 0} views</div>
                            {!isSold && listing.status === "active" && daysLeft !== null && !isExpired && (
                              <div className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${isExpiringSoon ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                                ⏰ {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                              </div>
                            )}
                          </div>

                          <h3 className="mt-3 text-xl font-black text-[#34414A]">{title}</h3>
                          <div className="mt-2 text-2xl font-black text-[#9A7B37]">{price}</div>
                          <div className="mt-3 text-sm text-[#66737C]">📍 {listing.location} • {listing.mileage || "N/A"}</div>

                          {isSold && listing.sold_at && (
                            <div className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                              🎉 Sold on {new Date(listing.sold_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                          )}

                          {!isSold && listing.expires_at && !isExpired && listing.status === "active" && (
                            <div className="mt-2 text-xs text-[#89939A]">
                              Expires on {new Date(listing.expires_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link href={`/listing/${listing.id}`} className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]">View</Link>
                          {!isSold && (
                            <Link href={`/edit-listing/${listing.id}`} className="rounded-xl border border-[#34414A] bg-white px-5 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]">Edit</Link>
                          )}
                          {canBoost && (
                            <button type="button" onClick={() => setBoostListing(listing)} className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-3 text-sm font-bold text-white shadow-md hover:brightness-105">
                              🚀 Boost Listing
                            </button>
                          )}
                          {!isSold && (isExpired || listing.status === "active") && (
                            <button type="button" disabled={renewingId === listing.id} onClick={() => handleRenew(listing.id)} className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-3 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed">
                              {renewingId === listing.id ? "Renewing..." : "🔄 Renew 30 Days"}
                            </button>
                          )}
                          {!isSold && listing.status === "active" && !isExpired && (
                            <button type="button" disabled={sellingId === listing.id} onClick={() => handleMarkAsSold(listing.id)} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed">
                              {sellingId === listing.id ? "Saving..." : "✅ Mark as Sold"}
                            </button>
                          )}
                          <button type="button" disabled={deletingId === listing.id} onClick={() => handleDelete(listing.id, listing.images || [])} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletingId === listing.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {boostListing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setBoostListing(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#8F7130] via-[#B08D3C] to-[#A47F32] p-6 text-white">
              <button onClick={() => setBoostListing(null)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg text-white hover:bg-white/30" aria-label="Close">×</button>
              <div className="text-4xl">🚀</div>
              <h2 className="mt-3 text-2xl font-black">Boost This Listing</h2>
              <p className="mt-1 text-sm text-white/90">Get up to 3× more views for 30 days</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 rounded-xl border border-[#D5DBDF] bg-[#F7F8F9] p-3">
                <Image
                  src={boostListing.images?.[0] || "/placeholder.png"}
                  alt="listing"
                  width={80}
                  height={56}
                  className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
                  quality={70}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-[#34414A]">{boostListing.year} {boostListing.make} {boostListing.model}</div>
                  <div className="text-xs font-bold text-[#9A7B37]">R{Number(boostListing.price).toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3"><span className="text-lg text-green-600">✓</span><span className="text-sm text-[#4A5962]">Appears at the <strong>top of the marketplace</strong></span></div>
                <div className="flex items-start gap-3"><span className="text-lg text-green-600">✓</span><span className="text-sm text-[#4A5962]">Gets a <strong>golden FEATURED badge</strong></span></div>
                <div className="flex items-start gap-3"><span className="text-lg text-green-600">✓</span><span className="text-sm text-[#4A5962]">Featured for a full <strong>30 days</strong></span></div>
              </div>
              <div className="mt-6 rounded-xl border-2 border-[#D3B86A]/60 bg-[#FBF7EC] p-4 text-center">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">Boost Price</div>
                <div className="mt-1 text-4xl font-black text-[#8F7130]">R99</div>
                <div className="text-xs text-[#66737C]">Once-off for 30 days</div>
              </div>
              <a href={buildBoostWhatsAppUrl(boostListing)} target="_blank" rel="noopener noreferrer" className="mt-5 block w-full rounded-xl bg-[#25D366] px-6 py-4 text-center text-sm font-bold text-white shadow-md hover:bg-[#20BD5A]">
                💬 Chat with Balray Autos to Boost
              </a>
            </div>
          </div>
        </div>
      )}

      
    </main>
  );
}