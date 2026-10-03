"use client";

import Link from "next/link";

type CategoryItem = {
  title: string;
  href: string;
  icon: string;
};

type Props = {
  bgImage?: string;
  subtitle?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
};

const defaultCategories: CategoryItem[] = [
  { title: "Cars & SUVs", href: "/marketplace?category=Cars+%26+SUVs", icon: "🚗" },
  { title: "Bakkies & 4x4s", href: "/marketplace?category=Bakkies+%26+4x4s", icon: "🛻" },
  { title: "Motorcycles", href: "/marketplace?category=Motorcycles", icon: "🏍️" },
  { title: "Trucks & Commercial", href: "/marketplace?category=Trucks+%26+Commercial", icon: "🚚" },
  { title: "Agricultural & Heavy Machinery", href: "/marketplace?category=Machinery+%26+Equipment", icon: "🚜" },
  { title: "Parts & Accessories", href: "/marketplace?category=Parts+%26+Accessories", icon: "⚙️" },
];

// Live image URL — always works
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1920&q=80";

export default function ShowroomHero({
  bgImage = DEFAULT_IMAGE,
  subtitle = "South Africa's marketplace for vehicles, machinery & automotive products.",
  primaryCTA,
  secondaryCTA,
}: Props) {
  return (
    <section className="relative w-full bg-[#0a0a0a]">
      {/* TOP BAR */}
      <div className="relative z-20 border-b border-white/10 bg-black">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.28em] text-white sm:gap-5 sm:text-sm">
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

      {/* FULL SHOWROOM IMAGE */}
      <div className="relative w-full bg-black">
        <img
          src={bgImage}
          alt="Balray Autos - Vehicles, Machinery & Automotive Showroom"
          className="mx-auto block h-auto w-full object-contain"
          loading="eager"
        />
        {/* Subtle top/bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* CONTENT BELOW */}
      <div className="relative z-10 bg-gradient-to-b from-[#0a0a0a] via-[#141414] to-[#0a0a0a] px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
        <img
          src="/balray-autos-logo.png"
          alt="Balray Autos"
          className="mx-auto h-20 w-auto max-w-[260px] object-contain sm:h-28 sm:max-w-[360px]"
        />

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#D2B66A] sm:w-16" />
          <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white sm:text-base sm:tracking-[0.4em]">
            Connecting Buyers &amp; Sellers
          </h1>
          <span className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#D2B66A] sm:w-16" />
        </div>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
          {subtitle}
        </p>

        {(primaryCTA || secondaryCTA) && (
          <div className="mx-auto mt-8 flex max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-7 py-3.5 text-center text-sm font-bold text-white shadow-xl transition hover:brightness-110"
              >
                {primaryCTA.label}
              </Link>
            )}
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="rounded-xl border-2 border-[#D2B66A]/60 bg-white/5 px-7 py-3.5 text-center text-sm font-bold text-white transition hover:bg-white/10"
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* CATEGORIES */}
      <div className="relative z-10 border-t border-white/10 bg-black">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-2 gap-y-6 px-4 py-6 sm:grid-cols-3 sm:gap-x-4 sm:px-6 lg:grid-cols-6 lg:px-8">
          {defaultCategories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl transition group-hover:-translate-y-1 group-hover:bg-[#D2B66A]/30 sm:h-14 sm:w-14 sm:text-3xl">
                {cat.icon}
              </div>
              <div className="mt-2 text-[10px] font-black uppercase leading-tight tracking-[0.12em] text-white group-hover:text-[#D2B66A] sm:text-xs">
                {cat.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="relative z-10 border-t border-white/10 bg-black py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-center text-[10px] font-black uppercase tracking-[0.24em] text-white/80 sm:text-xs sm:tracking-[0.32em]">
          <span>Quality Vehicles</span>
          <span className="text-[#D2B66A]">•</span>
          <span>Reliable Deals</span>
          <span className="text-[#D2B66A]">•</span>
          <span>South Africa</span>
        </div>
      </div>

      {/* GOLD LINE */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32]" />
    </section>
  );
}