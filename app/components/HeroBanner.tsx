"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle: string;
  badgeText?: string;
  imageUrl: string;
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
  imageUrl,
  imageAlt = "Hero",
  primaryCTA,
  secondaryCTA,
  height = "md",
  children,
}: Props) {
  const heightClass =
    height === "sm"
      ? "min-h-[300px] sm:min-h-[380px]"
      : height === "lg"
      ? "min-h-[520px] sm:min-h-[600px]"
      : "min-h-[420px] sm:min-h-[500px]";

  return (
    <section className={`relative w-full overflow-hidden ${heightClass}`}>
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          {badgeText && (
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/60 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#D2B66A] backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              {badgeText}
            </div>
          )}

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 drop-shadow-md sm:text-lg">
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
                  className="rounded-xl border-2 border-white/60 bg-white/10 px-7 py-4 text-center font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
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