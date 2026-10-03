"use client";

import Link from "next/link";

type CategoryItem = {
  title: string;
  href: string;
  icon: string;
};

type Props = {
  // Optional override of the background image
  bgImage?: string;
  // Optional override of the subtitle
  subtitle?: string;
  // Optional CTA buttons (below the tagline)
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

export default function ShowroomHero({
  bgImage = "/showroom-hero.jpg",
  subtitle = "South Africa's marketplace for vehicles, machinery & automotive products.",
  primaryCTA,
  secondaryCTA,
}: Props) {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a]">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Balray Autos - Vehicles, Machinery & Automotive Showroom"
          className="h-full w-full object-cover"
          loading="eager"
        />
        {/* DARK OVERLAY FOR CONTRAST */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>

      {/* TOP BAR: BUY | SELL | CONNECT */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-end px-4 py-5 sm:px-6 lg:px-8">
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

      {/* CENTER CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
        {/* LOGO */}
        <img
          src="/balray-autos-logo.png"
          alt="Balray Autos"
          className="mx-auto h-24 w-auto max-w-[320px] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] sm:h-32 sm:max-w-[420px]"
        />

        {/* TAGLINE */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#D2B66A] sm:w-16" />
          <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white sm:text-base sm:tracking-[0.4em]">
            Connecting Buyers &amp; Sellers
          </h1>
          <span className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#D2B66A] sm:w-16" />
        </div>

        {/* SUBTITLE */}
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 drop-shadow sm:text-base">
          {subtitle}
        </p>

        {/* CTAs */}
        {(primaryCTA || secondaryCTA) && (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
                className="rounded-xl border-2 border-white/50 bg-white/10 px-7 py-3.5 text-center text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* CATEGORY ROW */}
      <div className="relative z-10 border-t border-white/15 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-2 gap-y-6 px-4 py-6 sm:grid-cols-3 sm:gap-x-4 sm:px-6 lg:grid-cols-6 lg:px-8">
          {defaultCategories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl backdrop-blur-sm transition group-hover:-translate-y-1 group-hover:bg-[#D2B66A]/30 sm:h-14 sm:w-14 sm:text-3xl">
                {cat.icon}
              </div>
              <div className="mt-2 text-[10px] font-black uppercase leading-tight tracking-[0.12em] text-white group-hover:text-[#D2B66A] sm:text-xs">
                {cat.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM TAGLINE BAR */}
      <div className="relative z-10 border-t border-white/15 bg-black/60 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-center text-[10px] font-black uppercase tracking-[0.24em] text-white/80 sm:text-xs sm:tracking-[0.32em]">
          <span>Quality Vehicles</span>
          <span className="text-[#D2B66A]">•</span>
          <span>Reliable Deals</span>
          <span className="text-[#D2B66A]">•</span>
          <span>South Africa</span>
        </div>
      </div>

      {/* GOLD ACCENT LINE AT BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32]" />
    </section>
  );
}