"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";



const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

const transmissionMap: Record<string, string> = {
  automatic: "Automatic",
  manual: "Manual",
  cvt: "CVT",
  other: "N/A",
};

const fuelMap: Record<string, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Electric",
  other: "N/A",
};

export default function ComparePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCompareListings = async () => {
      try {
        const storedIds = JSON.parse(localStorage.getItem("balray_compare") || "[]");
        if (storedIds.length === 0) {
          setLoading(false);
          return;
        }

        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("public_listings")
          .select("*")
          .in("id", storedIds)
          .eq("status", "active")
          .or(`expires_at.is.null,expires_at.gt.${now}`);

        if (error || !data) {
          setLoading(false);
          return;
        }

        const ordered = storedIds
          .map((id: string) => data.find((item: any) => item.id === id))
          .filter(Boolean);

        const formatted = ordered.map((item: any) => ({
          id: item.id,
          title: `${item.year ? item.year + " " : ""}${item.make} ${item.model}`,
          category: categoryMap[item.category] || item.category,
          price: `R${Number(item.price).toLocaleString()}`,
          priceValue: Number(item.price),
          year: item.year ? item.year.toString() : "N/A",
          yearValue: item.year || 0,
          mileage: item.mileage || "N/A",
          location: item.location,
          transmission: transmissionMap[item.transmission] || item.transmission || "N/A",
          fuel: fuelMap[item.fuel] || item.fuel || "N/A",
          condition: item.condition,
          make: item.make,
          model: item.model,
          image:
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
        }));

        setListings(formatted);
      } catch (err) {
        console.error("Error loading compare listings:", err);
      }
      setLoading(false);
    };

    fetchCompareListings();
  }, [supabase]);

  const removeFromCompare = (id: string) => {
    const updated = listings.filter((l) => l.id !== id);
    setListings(updated);
    localStorage.setItem("balray_compare", JSON.stringify(updated.map((l) => l.id)));
  };

  const clearAll = () => {
    setListings([]);
    localStorage.removeItem("balray_compare");
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">Loading comparison...</div>
      </main>
    );
  }

  const lowestPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.priceValue)) : 0;
  const newestYear = listings.length > 0 ? Math.max(...listings.map((l) => l.yearValue)) : 0;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Side by Side
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">Compare Vehicles</h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">See up to 4 vehicles side by side to make the best decision.</p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {listings.length === 0 ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">⚖️</div>
              <h2 className="mt-6 text-2xl font-black text-[#34414A]">Nothing to compare yet</h2>
              <p className="mt-3 text-sm text-[#66737C]">Add vehicles to your comparison from the marketplace. You can compare up to 4 at once.</p>
              <Link href="/marketplace" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md hover:brightness-105">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-bold text-[#66737C]">Comparing {listings.length} vehicle{listings.length === 1 ? "" : "s"}</div>
                <button onClick={clearAll} className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100">✕ Clear All</button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#D5DBDF] bg-white shadow-sm">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr>
                      <th className="w-40 border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Vehicle</th>
                      {listings.map((item) => (
                        <th key={item.id} className="border-b border-r border-[#E1E5E8] bg-white p-4 text-center last:border-r-0">
                          <div className="relative">
                            <button onClick={() => removeFromCompare(item.id)} className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-md hover:bg-red-600" aria-label="Remove">×</button>
                            <div className="relative mx-auto aspect-[16/10] w-full max-w-[200px] overflow-hidden rounded-xl">
                              <Image src={item.image} alt={item.title} fill sizes="200px" className="object-cover" quality={70} />
                            </div>
                            <div className="mt-3 text-base font-black text-[#34414A]">{item.title}</div>
                            <Link href={`/listing/${item.id}`} className="mt-2 inline-block text-xs font-bold text-[#9A7B37] hover:underline">View Full Listing →</Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Price</td>
                      {listings.map((item) => (
                        <td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center last:border-r-0">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-black text-[#9A7B37]">{item.price}</span>
                            {item.priceValue === lowestPrice && listings.length > 1 && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">💰 Lowest</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Year</td>
                      {listings.map((item) => (
                        <td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center last:border-r-0">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-base font-bold text-[#34414A]">{item.year}</span>
                            {item.yearValue === newestYear && listings.length > 1 && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">🆕 Newest</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Make</td>
                      {listings.map((item) => (<td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center text-sm text-[#4A5962] last:border-r-0">{item.make}</td>))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Model</td>
                      {listings.map((item) => (<td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center text-sm text-[#4A5962] last:border-r-0">{item.model}</td>))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Category</td>
                      {listings.map((item) => (<td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center text-sm text-[#4A5962] last:border-r-0">{item.category}</td>))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Mileage</td>
                      {listings.map((item) => (<td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center text-sm text-[#4A5962] last:border-r-0">{item.mileage}</td>))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Condition</td>
                      {listings.map((item) => (<td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center text-sm capitalize text-[#4A5962] last:border-r-0">{item.condition}</td>))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Transmission</td>
                      {listings.map((item) => (<td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center text-sm text-[#4A5962] last:border-r-0">{item.transmission}</td>))}
                    </tr>
                    <tr>
                      <td className="border-b border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Fuel</td>
                      {listings.map((item) => (<td key={item.id} className="border-b border-r border-[#E1E5E8] p-4 text-center text-sm text-[#4A5962] last:border-r-0">{item.fuel}</td>))}
                    </tr>
                    <tr>
                      <td className="border-r border-[#E1E5E8] bg-[#F7F8F9] p-4 text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">Location</td>
                      {listings.map((item) => (<td key={item.id} className="border-r border-[#E1E5E8] p-4 text-center text-sm text-[#4A5962] last:border-r-0">📍 {item.location}</td>))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6">
                <h3 className="text-lg font-black text-[#8F7130]">💡 Comparison Tips</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#8F7130]">
                  <li>• Look for the <strong>💰 Lowest</strong> and <strong>🆕 Newest</strong> badges to spot the best values.</li>
                  <li>• Lower mileage with a newer year is usually a better long-term buy.</li>
                  <li>• Always inspect the vehicle in person and check the service history before buying.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      
    </main>
  );
}