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

// Free AI-generated sketch — exactly like your image but without the logo.
const HERO_IMAGE =
  "https://image.pollinations.ai/prompt/black%20and%20white%20pencil%20sketch%20line%20art%20of%20a%20commercial%20truck%2C%20a%20pickup%20bakkie%2C%20a%20sports%20car%2C%20a%20motorcycle%2C%20an%20excavator%20and%20a%20tractor%20parked%20in%20a%20row%20on%20a%20plain%20white%20background%2C%20highly%20detailed%20outline%20drawing%2C%20technical%20illustration%2C%20professional%20sketch%20style%2C%20no%20color%2C%20no%20shading%2C%20sharp%20clean%20lines?width=2048&height=800&model=flux&nologo=true&seed=99";

export default function HeroBanner({
  subtitle = "South Africa's marketplace for vehicles, machinery & automotive products.",
  primaryCTA,
  secondaryCTA,
}: Props) {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-white">
      
      {/* --- TOP HEADER WITH LOGO & TEXT --- */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-10 pb-4 text-center">
        
        {/* YOUR LOGO */}
        <img
          src="/balray-autos-logo.png"
          alt="Balray Autos"
          className="h-20 w-auto max-w-[280px] object-contain sm:h-28 sm:max-w-[400px]"
        />

        {/* TAGLINE */}
        <div className="mt-6 flex w-full items-center justify-center gap-2 sm:gap-4">
          <span className="h-[1px] w-12 bg-[#34414A] sm:w-24" />
          <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#34414A] sm:text-sm sm:tracking-[0.3em]">
            Connecting Buyers &amp; Sellers
          </h1>
          <span className="h-[1px] w-12 bg-[#34414A] sm:w-24" />
        </div>
      </div>

      {/* --- SKETCHED IMAGE (TRUCKS, CARS, BIKES) --- */}
      <div className="relative w-full overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Sketch of trucks, cars, bakkies, bikes and machinery"
          className="mx-auto block h-auto w-full max-w-full object-contain"
          loading="eager"
        />
      </div>

      {/* --- CATEGORY ROW --- */}
      <div className="relative z-10 mt-6 w-full border-y border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-6 px-4 py-6 sm:gap-x-8 lg:gap-x-12">
          {categories.map((cat, index) => (
            <div key={cat.title} className="flex items-center">
              <Link
                href={cat.href}
                className="group flex flex-col items-center text-center"
              >
                <div className="text-2xl text-[#34414A] transition group-hover:-translate-y-1 group-hover:text-[#8F7130] sm:text-3xl">
                  {cat.icon}
                </div>
                <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#34414A] group-hover:text-[#8F7130] sm:text-[10px]">
                  {cat.title}
                </div>
              </Link>
              {/* Vertical Divider */}
              {index !== categories.length - 1 && (
                <div className="ml-4 hidden h-10 w-[1px] bg-gray-300 sm:ml-8 sm:block lg:ml-12"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- BOTTOM BAR --- */}
      <div className="relative z-10 bg-white py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#34414A] sm:gap-5 sm:text-[10px] sm:tracking-[0.3em]">
          <span className="h-[1px] w-8 bg-gray-300 sm:w-16" />
          <span>Quality Vehicles</span>
          <span className="text-[#B08D3C]">•</span>
          <span>Reliable Deals</span>
          <span className="text-[#B08D3C]">•</span>
          <span>South Africa</span>
          <span className="h-[1px] w-8 bg-gray-300 sm:w-16" />
        </div>
      </div>

    </section>
  );
}