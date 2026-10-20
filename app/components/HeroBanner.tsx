"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  subtitle?: string;
  badgeText?: string;
  imageUrl?: string;
  imageAlt?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  height?: "sm" | "md" | "lg";
  children?: ReactNode;
};

const categories = [
  { title: "Cars & SUVs", href: "/marketplace?category=Cars+%26+SUVs", icon: "🚗" },
  { title: "Bakkies & 4x4s", href: "/marketplace?category=Bakkies+%26+4x4s", icon: "🛻" },
  { title: "Motorcycles", href: "/marketplace?category=Motorcycles", icon: "🏍️" },
  { title: "Trucks & Commercial", href: "/marketplace?category=Trucks+%26+Commercial", icon: "🚚" },
  { title: "Agricultural & Heavy Machinery", href: "/marketplace?category=Machinery+%26+Equipment", icon: "🚜" },
  { title: "Parts & Accessories", href: "/marketplace?category=Parts+%26+Accessories", icon: "⚙️" },
];

// Static, reliable outdoor automotive scene (trucks, cars, concrete ground).
// Loads instantly from a CDN. No AI generation. Never fails.
const STATIC_HERO_IMAGE =
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2000&q=80";

export default function HeroBanner({
  subtitle = "South Africa's marketplace for vehicles, machinery & automotive products.",
  primaryCTA,
  secondaryCTA,
}: Props) {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-[#E8EEF3]">
      {/* STATIC FULL-WIDTH IMAGE */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[380px] lg:h-[460px]">
        <img
          src={STATIC_HERO_IMAGE}
          alt="South African automotive marketplace - trucks, bakkies and cars"
          className="absolute inset-0 block h-full w-full max-w-full object-cover"
          loading="eager"
        />
        
        {/* SOFT NEUTRAL OVERLAY — keeps text readable, no color tint */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/20 to-black/50 pointer-events-none" />

        {/* TOP BAR: BUY | SELL | CONNECT */}
        <div className="absolute inset-x-0 top-0 z-20 border-b border-white/20 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-end px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-white drop-shadow-md sm:gap-5 sm:text-sm sm:tracking-[0.28em]">
              <Link href="/marketplace" className="transition hover:text-[#F4E0A1]">
                Buy
              </Link>
              <span className="text-[#F4E0A1]">|</span>
              <Link href="/sell" className="transition hover:text-[#F4E0A1]">
                Sell
              </Link>
              <span className="text-[#F4E0A1]">|</span>
              <Link href="/contact" className="transition hover:text-[#F4E0A1]">
                Connect
              </Link>
            </div>
          </div>
        </div>

        {/* CENTERED TEXT OVERLAY */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center sm:px-6">
          
          {/* South African Flag Badge using your local flag.jpg */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:mb-4 sm:px-4 sm:py-2 sm:text-xs">
            <img 
              src="/flag.jpg" 
              alt="South Africa Flag" 
              className="h-3.5 w-5 rounded-sm object-cover shadow-sm sm:h-4 sm:w-6" 
            />
            Proudly South African
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="hidden h-[2px] w-10 bg-gradient-to-r from-transparent to-[#F4E0A1] sm:block sm:w-16" />
            <h1 className="text-xs font-black uppercase tracking-[0.24em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-lg sm:tracking-[0.4em]">
              Connecting Buyers &amp; Sellers
            </h1>
            <span className="hidden h-[2px] w-10 bg-gradient-to-l from-transparent to-[#F4E0A1] sm:block sm:w-16" />
          </div>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:mt-5 sm:max-w-2xl sm:text-base sm:leading-7">
            {subtitle}
          </p>

          {(primaryCTA || secondaryCTA) && (
            <div className="mx-auto mt-5 flex w-full max-w-md flex-col justify-center gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:gap-3">
              {primaryCTA && (
                <Link
                  href={primaryCTA.href}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-center text-sm font-bold text-white shadow-xl transition hover:brightness-110 sm:w-auto sm:px-7 sm:py-3.5"
                >
                  {primaryCTA.label}
                </Link>
              )}
              {secondaryCTA && (
                <Link
                  href={secondaryCTA.href}
                  className="w-full rounded-xl border-2 border-white bg-white/90 px-6 py-3 text-center text-sm font-bold text-[#34414A] shadow-lg backdrop-blur-sm transition hover:bg-white sm:w-auto sm:px-7 sm:py-3.5"
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY ROW — neutral light grey */}
      <div className="relative z-10 border-t border-[#CBD5DD] bg-[#F1F4F7]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-3 gap-x-1 gap-y-4 px-2 py-4 sm:gap-x-3 sm:gap-y-5 sm:px-6 sm:py-6 lg:grid-cols-6 lg:px-8">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm transition group-hover:-translate-y-1 group-hover:bg-[#FBF7EC] sm:h-14 sm:w-14 sm:text-3xl">
                {cat.icon}
              </div>
              <div className="mt-2 px-1 text-[9px] font-black uppercase leading-tight tracking-[0.1em] text-[#34414A] group-hover:text-[#8F7130] sm:text-xs sm:tracking-[0.12em]">
                {cat.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR — neutral light grey */}
      <div className="relative z-10 border-t border-[#CBD5DD] bg-[#F1F4F7] py-3 sm:py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#34414A] sm:gap-x-4 sm:text-xs sm:tracking-[0.32em]">
          <span>Quality Vehicles</span>
          <span className="text-[#B08D3C]">•</span>
          <span>Reliable Deals</span>
          <span className="text-[#B08D3C]">•</span>
          <span>South Africa</span>
        </div>
      </div>

      {/* GOLD ACCENT LINE */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32]" />
    </section>
  );
}