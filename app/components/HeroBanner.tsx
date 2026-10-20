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

// Free AI-generated natural outdoor scene — trucks, lorries, motorcycles on grass.
const HERO_IMAGE =
  "https://image.pollinations.ai/prompt/wide%20sunny%20outdoor%20photo%20of%20a%20truck%20and%20lorry%20dealership%20parked%20on%20green%20grass%20with%20motorcycles%20displayed%20in%20front%2C%20blue%20sky%20with%20soft%20clouds%2C%20bright%20natural%20daylight%2C%20clean%20clear%20professional%20photography%2C%20no%20cars%2C%20sharp%20focus%2C%20realistic?width=2000&height=900&model=flux&nologo=true&seed=42";

export default function HeroBanner({
  subtitle = "South Africa's marketplace for vehicles, machinery & automotive products.",
  primaryCTA,
  secondaryCTA,
}: Props) {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-[#DCE8F0]">
      {/* FULL-WIDTH NATURAL OUTDOOR SHOWROOM IMAGE */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[380px] lg:h-[460px]">
        <img
          src={HERO_IMAGE}
          alt="Trucks, lorries and motorcycles on green grass under a blue sky"
          className="absolute inset-0 block h-full w-full max-w-full object-cover"
          loading="eager"
        />
        {/* SOFT LIGHT OVERLAY — no black, just light dimming for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        {/* TOP BAR: BUY | SELL | CONNECT */}
        <div className="absolute inset-x-0 top-0 z-20 border-b border-white/20 bg-white/15 backdrop-blur-md">
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="hidden h-[2px] w-10 bg-gradient-to-r from-transparent to-[#F4E0A1] sm:block sm:w-16" />
            <h1 className="text-xs font-black uppercase tracking-[0.24em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-lg sm:tracking-[0.4em]">
              Connecting Buyers &amp; Sellers
            </h1>
            <span className="hidden h-[2px] w-10 bg-gradient-to-l from-transparent to-[#F4E0A1] sm:block sm:w-16" />
          </div>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] sm:mt-5 sm:max-w-2xl sm:text-base sm:leading-7">
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

      {/* CATEGORY ROW — light gray, no black */}
      <div className="relative z-10 border-t border-[#C5D0DA] bg-[#EEF2F6]">
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

      {/* BOTTOM BAR — light gray, no black */}
      <div className="relative z-10 border-t border-[#C5D0DA] bg-[#EEF2F6] py-3 sm:py-4">
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