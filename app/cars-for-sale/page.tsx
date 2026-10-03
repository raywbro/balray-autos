"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";



const CITIES = [
  { slug: "johannesburg", name: "Johannesburg", province: "Gauteng", icon: "🏙️" },
  { slug: "cape-town", name: "Cape Town", province: "Western Cape", icon: "🌊" },
  { slug: "durban", name: "Durban", province: "KwaZulu-Natal", icon: "🏖️" },
  { slug: "pretoria", name: "Pretoria", province: "Gauteng", icon: "🏛️" },
  { slug: "gqeberha", name: "Gqeberha", province: "Eastern Cape", icon: "⚓" },
  { slug: "bloemfontein", name: "Bloemfontein", province: "Free State", icon: "🌾" },
  { slug: "east-london", name: "East London", province: "Eastern Cape", icon: "🌅" },
  { slug: "polokwane", name: "Polokwane", province: "Limpopo", icon: "🌳" },
  { slug: "nelspruit", name: "Nelspruit", province: "Mpumalanga", icon: "⛰️" },
  { slug: "kimberley", name: "Kimberley", province: "Northern Cape", icon: "💎" },
  { slug: "soweto", name: "Soweto", province: "Gauteng", icon: "🏘️" },
  { slug: "sandton", name: "Sandton", province: "Gauteng", icon: "💼" },
  { slug: "centurion", name: "Centurion", province: "Gauteng", icon: "🚗" },
  { slug: "port-elizabeth", name: "Port Elizabeth", province: "Eastern Cape", icon: "🌊" },
  { slug: "pietermaritzburg", name: "Pietermaritzburg", province: "KwaZulu-Natal", icon: "🌸" },
  { slug: "rustenburg", name: "Rustenburg", province: "North West", icon: "⛏️" },
  { slug: "potchefstroom", name: "Potchefstroom", province: "North West", icon: "🎓" },
  { slug: "stellenbosch", name: "Stellenbosch", province: "Western Cape", icon: "🍇" },
  { slug: "paarl", name: "Paarl", province: "Western Cape", icon: "🏔️" },
  { slug: "george", name: "George", province: "Western Cape", icon: "🌲" },
];

export default function CitiesIndexPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCounts = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("public_listings")
        .select("location")
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      const countsMap: Record<string, number> = {};
      CITIES.forEach((city) => {
        countsMap[city.slug] = (data || []).filter((l: any) =>
          l.location?.toLowerCase().includes(city.name.toLowerCase())
        ).length;
      });
      setCounts(countsMap);
      setLoading(false);
    };

    fetchCounts();
  }, [supabase]);

  useEffect(() => {
    document.title = "Cars for Sale in South Africa by City | Balray Autos";
  }, []);

  const totalListings = Object.values(counts).reduce((a, b) => a + b, 0);

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
              Find Cars for Sale
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                in Your City
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Browse vehicles for sale across every major city in South Africa.
              {totalListings > 0 && ` Over ${totalListings} active listing${totalListings === 1 ? "" : "s"} available.`}
            </p>
          </div>
        </div>
      </section>

      {/* CITY GRID */}
      <section className="w-full bg-[#F7F8F9] py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Browse by City
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">
              All Cities in South Africa
            </h2>
            <p className="mt-2 text-sm text-[#66737C]">
              Click a city to see vehicles for sale in that area.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((city) => {
              const count = counts[city.slug] || 0;
              return (
                <Link
                  key={city.slug}
                  href={`/cars-for-sale/${city.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-[#D5DBDF] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C]/60 hover:shadow-[0_15px_40px_rgba(52,65,74,0.10)]"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#FBF7EC] text-2xl">
                    {city.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-black text-[#34414A] group-hover:text-[#9A7B37]">
                      {city.name}
                    </h3>
                    <p className="text-xs font-bold text-[#89939A]">
                      {city.province}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#9A7B37]">
                      {loading ? (
                        <span className="inline-block h-3 w-20 animate-pulse rounded bg-[#E1E5E8]" />
                      ) : (
                        <>
                          {count} listing{count === 1 ? "" : "s"}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-2xl text-[#89939A] transition group-hover:translate-x-1 group-hover:text-[#9A7B37]">
                    →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-16">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Selling Your Vehicle?
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Reach buyers in your city.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">
              List your vehicle for free and get contacted by buyers near you.
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