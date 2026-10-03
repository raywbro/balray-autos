"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";



const BRANDS = [
  // Popular everyday brands
  { slug: "toyota", name: "Toyota", group: "Popular" },
  { slug: "volkswagen", name: "Volkswagen", group: "Popular" },
  { slug: "ford", name: "Ford", group: "Popular" },
  { slug: "nissan", name: "Nissan", group: "Popular" },
  { slug: "hyundai", name: "Hyundai", group: "Popular" },
  { slug: "kia", name: "Kia", group: "Popular" },
  { slug: "honda", name: "Honda", group: "Popular" },
  { slug: "mazda", name: "Mazda", group: "Popular" },
  { slug: "isuzu", name: "Isuzu", group: "Popular" },
  { slug: "suzuki", name: "Suzuki", group: "Popular" },

  // Luxury
  { slug: "bmw", name: "BMW", group: "Luxury" },
  { slug: "mercedes-benz", name: "Mercedes-Benz", group: "Luxury" },
  { slug: "audi", name: "Audi", group: "Luxury" },
  { slug: "land-rover", name: "Land Rover", group: "Luxury" },
  { slug: "jeep", name: "Jeep", group: "Luxury" },
  { slug: "volvo", name: "Volvo", group: "Luxury" },
  { slug: "lexus", name: "Lexus", group: "Luxury" },
  { slug: "porsche", name: "Porsche", group: "Luxury" },
  { slug: "jaguar", name: "Jaguar", group: "Luxury" },
  { slug: "mini", name: "MINI", group: "Luxury" },

  // Budget & Value
  { slug: "renault", name: "Renault", group: "Value" },
  { slug: "chevrolet", name: "Chevrolet", group: "Value" },
  { slug: "peugeot", name: "Peugeot", group: "Value" },
  { slug: "citroen", name: "Citroën", group: "Value" },
  { slug: "fiat", name: "Fiat", group: "Value" },
  { slug: "opel", name: "Opel", group: "Value" },
  { slug: "datsun", name: "Datsun", group: "Value" },
  { slug: "mahindra", name: "Mahindra", group: "Value" },
  { slug: "mg", name: "MG", group: "Value" },
  { slug: "chery", name: "Chery", group: "Value" },
  { slug: "haval", name: "Haval", group: "Value" },
  { slug: "gwm", name: "GWM", group: "Value" },
  { slug: "omoda", name: "Omoda", group: "Value" },
  { slug: "jac", name: "JAC", group: "Value" },
  { slug: "subaru", name: "Subaru", group: "Value" },

  // Motorcycles
  { slug: "yamaha", name: "Yamaha", group: "Motorcycles" },
  { slug: "kawasaki", name: "Kawasaki", group: "Motorcycles" },
  { slug: "harley", name: "Harley-Davidson", group: "Motorcycles" },

  // Trucks & Commercial
  { slug: "scania", name: "Scania", group: "Trucks" },
  { slug: "man", name: "MAN", group: "Trucks" },
  { slug: "jcb", name: "JCB", group: "Trucks" },
  { slug: "caterpillar", name: "Caterpillar", group: "Trucks" },
  { slug: "kubota", name: "Kubota", group: "Trucks" },
];

export default function BrandsIndexPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCounts = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("public_listings")
        .select("make")
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      const countsMap: Record<string, number> = {};
      BRANDS.forEach((brand) => {
        countsMap[brand.slug] = (data || []).filter(
          (l: any) => l.make?.toLowerCase() === brand.name.toLowerCase()
        ).length;
      });
      setCounts(countsMap);
      setLoading(false);
    };

    fetchCounts();
  }, [supabase]);

  useEffect(() => {
    document.title = "All Car Brands for Sale in South Africa | Balray Autos";
  }, []);

  const totalListings = Object.values(counts).reduce((a, b) => a + b, 0);

  const groups = ["Popular", "Luxury", "Value", "Motorcycles", "Trucks"];

  const groupLabels: Record<string, string> = {
    Popular: "🔥 Popular Brands",
    Luxury: "💎 Luxury Brands",
    Value: "💰 Value & Budget Brands",
    Motorcycles: "🏍️ Motorcycle Brands",
    Trucks: "🚚 Trucks, Commercial & Machinery",
  };

  const groupDescriptions: Record<string, string> = {
    Popular: "The most common and trusted car brands in South Africa.",
    Luxury: "Premium and high-end luxury vehicles.",
    Value: "Great value for money and affordable brands.",
    Motorcycles: "Bikes, scooters and adventure motorcycles.",
    Trucks: "Commercial vehicles, trucks and heavy machinery.",
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />
        <div className="pointer-events-none absolute right-20 top-20 h-24 w-24 rounded-full border-[8px] border-[#D2B66A]/20" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              🇿🇦 South Africa
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl lg:text-6xl">
              Browse by
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                Car Brand
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Find your dream car by brand. Every major car brand in South Africa — from everyday Toyota and VW to luxury BMW and Mercedes-Benz.
              {totalListings > 0 && ` Over ${totalListings} active listing${totalListings === 1 ? "" : "s"} available.`}
            </p>
          </div>
        </div>
      </section>

      {/* BRAND SECTIONS */}
      {groups.map((group) => {
        const brandGroup = BRANDS.filter((b) => b.group === group);
        if (brandGroup.length === 0) return null;

        return (
          <section key={group} className="w-full bg-[#F7F8F9] py-12">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                  {groupLabels[group]}
                </div>
                <p className="mt-2 text-sm text-[#66737C]">
                  {groupDescriptions[group]}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {brandGroup.map((brand) => {
                  const count = counts[brand.slug] || 0;
                  return (
                    <Link
                      key={brand.slug}
                      href={`/brands/${brand.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[#D5DBDF] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C]/60 hover:shadow-[0_15px_40px_rgba(52,65,74,0.10)]"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-[#34414A] group-hover:text-[#9A7B37]">
                          {brand.name}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-[#9A7B37]">
                          {loading ? (
                            <span className="inline-block h-3 w-16 animate-pulse rounded bg-[#E1E5E8]" />
                          ) : (
                            <>
                              {count} listing{count === 1 ? "" : "s"}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-xl text-[#89939A] transition group-hover:translate-x-1 group-hover:text-[#9A7B37]">
                        →
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-16">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Selling Your Vehicle?
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Reach thousands of buyers across South Africa.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">
              List your vehicle for free and get contacted by real buyers looking for your exact make and model.
            </p>
          </div>
          <Link
            href="/sell"
            className="w-full rounded-xl bg-[#34414A] px-7 py-4 text-center font-bold text-white shadow-md hover:bg-[#4A5962] sm:w-auto"
          >
            List Your Vehicle
          </Link>
        </div>
      </section>

      
    </main>
  );
}