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

// Free AI-generated sketched automotive showroom image.
// This URL generates a sketch-style image on every request — no file, no JPG.
const HERO_IMAGE =
  "https://image.pollinations.ai/prompt/sketched%20automotive%20showroom%20with%20trucks%20lorries%20cars%20motorcycles%20bakkies%20and%20heavy%20machinery%20parked%20in%20a%20row%2C%20pencil%20sketch%20style%2C%20detailed%20line%20art%2C%20black%20and%20white%20with%20gold%20accents%2C%20wide%20landscape%20view?width=2000&height=800&model=flux&nologo=true";

export default function HeroBanner({
  subtitle = "South Africa's marketplace for vehicles, machinery & automotive products.",
  primaryCTA,
  secondaryCTA,
}: Props) {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-[#0a0a0a]">
      {/* FULL-WIDTH SKETCHED SHOWROOM IMAGE */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[380px] lg:h-[460px]">
        <img
          src={HERO_IMAGE}
          alt="Sketched automotive showroom with trucks, cars, motorcycles and machinery"
          className="absolute inset-0 block h-full w-full max-w-full object-cover"
          loading="eager"
        />
        {/* DARK OVERLAY so white text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

        {/* TOP BAR: BUY | SELL | CONNECT */}
        <div className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-end px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-white sm:gap-5 sm:text-sm sm:tracking-[0.28em]">
              <Link href="/marketplace" className="transition hover:text-[#D2B66A]">
                Buy
              </Link>
              <span className="text-[#D2B66A]">|</span>
              <Link href="/sell" className="transition hover:text-[#D2B66A]">
                Sell
              </Link>
              <span className="text-[#D2B66A]">|</span>
              <Link href="/contact" className="transition hover:text-[#D2B66A]">
                Connect
              </Link>
            </div>
          </div>
        </div>

        {/* CENTERED TEXT OVERLAY */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="hidden h-[2px] w-10 bg-gradient-to-r from-transparent to-[#D2B66A] sm:block sm:w-16" />
            <h1 className="text-[11px] font-black uppercase tracking-[0.24em] text-white drop-shadow-lg sm:text-base sm:tracking-[0.4em]">
              Connecting Buyers &amp; Sellers
            </h1>
            <span className="hidden h-[2px] w-10 bg-gradient-to-l from-transparent to-[#D2B66A] sm:block sm:w-16" />
          </div>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/85 drop-shadow sm:mt-5 sm:max-w-2xl sm:text-base sm:leading-7">
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
                  className="w-full rounded-xl border-2 border-[#D2B66A]/70 bg-black/30 px-6 py-3 text-center text-sm font-bold text-white backdrop-blur-sm transition hover:bg-black/50 sm:w-auto sm:px-7 sm:py-3.5"
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY ROW */}
      <div className="relative z-10 border-t border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-3 gap-x-1 gap-y-4 px-2 py-4 sm:gap-x-3 sm:gap-y-5 sm:px-6 sm:py-6 lg:grid-cols-6 lg:px-8">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl transition group-hover:-translate-y-1 group-hover:bg-[#D2B66A]/30 sm:h-14 sm:w-14 sm:text-3xl">
                {cat.icon}
              </div>
              <div className="mt-2 px-1 text-[9px] font-black uppercase leading-tight tracking-[0.1em] text-white group-hover:text-[#D2B66A] sm:text-xs sm:tracking-[0.12em]">
                {cat.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="relative z-10 border-t border-white/10 bg-[#0a0a0a] py-3 sm:py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-white/80 sm:gap-x-4 sm:text-xs sm:tracking-[0.32em]">
          <span>Quality Vehicles</span>
          <span className="text-[#D2B66A]">•</span>
          <span>Reliable Deals</span>
          <span className="text-[#D2B66A]">•</span>
          <span>South Africa</span>
        </div>
      </div>

      {/* GOLD ACCENT LINE */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32]" />
    </section>
  );
}