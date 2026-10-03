"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle: string;
  badgeText?: string;
  imageUrl?: string;
  imageAlt?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  height?: "sm" | "md" | "lg";
  children?: ReactNode;
};

export default function HeroBanner({
  title,
  subtitle,
  badgeText,
  primaryCTA,
  secondaryCTA,
  height = "md",
  children,
}: Props) {
  const heightClass =
    height === "sm"
      ? "min-h-[260px] sm:min-h-[320px]"
      : height === "lg"
      ? "min-h-[400px] sm:min-h-[500px]"
      : "min-h-[340px] sm:min-h-[400px]";

  return (
    <section
      className={`relative w-full overflow-hidden bg-black ${heightClass}`}
    >
      {/* Subtle gold circles */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-white/5" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-24 w-24 rounded-full border-[8px] border-[#D2B66A]/10" />

      {/* Gold accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32]" />

      {/* Content */}
      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          {badgeText && (
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/60 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#D2B66A] backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              {badgeText}
            </div>
          )}

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            {subtitle}
          </p>

          {(primaryCTA || secondaryCTA) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryCTA && (
                <Link
                  href={primaryCTA.href}
                  className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-7 py-4 text-center font-bold text-white shadow-xl transition hover:brightness-110"
                >
                  {primaryCTA.label}
                </Link>
              )}
              {secondaryCTA && (
                <Link
                  href={secondaryCTA.href}
                  className="rounded-xl border-2 border-white/40 bg-white/5 px-7 py-4 text-center font-bold text-white transition hover:bg-white/10"
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}