"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              About Us
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl lg:text-6xl">
              More Than Just
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                A Marketplace.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Balray Autos is a South African automotive marketplace built to
              connect buyers and sellers of cars, bakkies, motorcycles, trucks,
              machinery, and parts.
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                Our Story
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
                Built for South African buyers and sellers.
              </h2>

              <p className="mt-6 text-base leading-7 text-[#68757D]">
                Balray Autos was created to make finding and listing vehicles
                simpler, clearer, and more accessible across South Africa.
                Whether you&apos;re a private seller, a dealer, or a business,
                our platform gives you a clean, trusted space to connect.
              </p>

              <p className="mt-4 text-base leading-7 text-[#68757D]">
                From everyday cars and bakkies to heavy machinery and spare
                parts — we cover the full automotive spectrum. Our goal is to
                put serious buyers and serious sellers in the same room.
              </p>

              <Link
                href="/marketplace"
                className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 font-bold text-white shadow-md hover:brightness-105"
              >
                Browse Marketplace
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#9A7B37]">🇿🇦</div>
                <div className="mt-3 font-bold text-[#34414A]">Proudly SA</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Built specifically for the South African automotive market.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#34414A]">🔒</div>
                <div className="mt-3 font-bold text-[#34414A]">Trusted</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Every listing is submitted by verified logged-in users.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#9A7B37]">🚗</div>
                <div className="mt-3 font-bold text-[#34414A]">All Categories</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Cars, bakkies, bikes, trucks, machinery and parts.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#34414A]">🤝</div>
                <div className="mt-3 font-bold text-[#34414A]">Connect Direct</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Buyers contact sellers directly, no middlemen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="w-full bg-[#F1F4F6]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              What We Stand For
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Our Values
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FBF7EC] text-2xl">
                ✅
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">Simplicity</h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Listing a vehicle should take minutes, not days. Our forms are
                designed to be fast and clear.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FBF7EC] text-2xl">
                🛡️
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">Trust</h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                We verify every account, so buyers know they&apos;re dealing
                with real sellers.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FBF7EC] text-2xl">
                🚀
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">Reach</h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Your listing is visible to buyers across all of South Africa —
                from Cape Town to Polokwane.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Join Balray Autos
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Ready to list your vehicle?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">
              It takes just a few minutes to reach buyers across South Africa.
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

      {/* FOOTER */}
      <footer className="w-full border-t border-[#D4DADF] bg-[#EEF1F3]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <img
                src="/balray-autos-logo.png"
                alt="Balray Autos"
                className="h-11 w-auto max-w-[180px] object-contain"
              />
              <p className="mt-3 text-sm text-[#68757D]">
                South African automotive marketplace.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <Link href="/" className="text-[#68757D] hover:text-[#9A7B37]">Home</Link>
              <Link href="/marketplace" className="text-[#68757D] hover:text-[#9A7B37]">Marketplace</Link>
              <Link href="/sell" className="text-[#68757D] hover:text-[#9A7B37]">Sell</Link>
              <Link href="/about" className="text-[#68757D] hover:text-[#9A7B37]">About</Link>
              <Link href="/contact" className="text-[#68757D] hover:text-[#9A7B37]">Contact</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[#D3D9DD] pt-5 text-center text-sm text-[#7A858C]">
            © {new Date().getFullYear()} Balray Autos (Pty) Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}