"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";

const faqs = [
  {
    q: "Is it really free to list my vehicle?",
    a: "Yes! Listing your vehicle on Balray Autos is 100% free. There are no hidden fees, no commission on sales, and no payment required to publish your ad.",
  },
  {
    q: "How long does my listing stay live?",
    a: "Once approved, your listing stays live for 30 days. You can renew it for another 30 days at any time with a single click — completely free.",
  },
  {
    q: "How do buyers contact me?",
    a: "Buyers can reach you directly via WhatsApp, phone call, or email. We show your contact details on your listing so buyers can reach out instantly. There's no middleman.",
  },
  {
    q: "How long does approval take?",
    a: "Most listings are reviewed and approved within 24 hours. You'll receive an email notification the moment your listing goes live.",
  },
  {
    q: "Can I edit my listing after posting?",
    a: "Absolutely. You can edit your listing anytime from your dashboard. Change the price, update the description, or add more photos — it's all in your control.",
  },
  {
    q: "What can I sell on Balray Autos?",
    a: "Cars, SUVs, bakkies, 4x4s, motorcycles, trucks, commercial vehicles, machinery (like diggers and tractors), and automotive parts and accessories.",
  },
  {
    q: "Is my phone number safe?",
    a: "Your phone number is only shown to buyers on your listing page so they can contact you. We never sell your data to third parties, and we require all users to verify their phone number, which helps keep scammers out.",
  },
];

export default function StartSellingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />
        <div className="pointer-events-none absolute right-20 top-20 h-24 w-24 rounded-full border-[8px] border-[#D2B66A]/20" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Sell With Balray Autos
            </div>

            <h1 className="text-[clamp(2.2rem,8vw,4.5rem)] font-black leading-[1.05] tracking-tight text-[#34414A]">
              Sell Your Vehicle
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                The Smart Way.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg sm:leading-8">
              Reach thousands of serious buyers across South Africa. List your car,
              bakkie, motorcycle, truck, or machinery in under 5 minutes —
              completely free.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/sell"
                className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 text-center font-bold text-white shadow-md transition hover:brightness-105"
              >
                List Your Vehicle — Free
              </Link>
              <Link
                href="/marketplace"
                className="rounded-xl border border-[#B08D3C] bg-white px-8 py-4 text-center font-bold text-[#8F7130] transition hover:bg-[#FBF7EC]"
              >
                Browse Marketplace
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-bold text-[#66737C]">
              <span className="flex items-center gap-2">
                <span className="text-[#25D366]">✓</span> 100% Free
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#25D366]">✓</span> No Commission
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#25D366]">✓</span> Direct Buyer Contact
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SELL WITH US */}
      <section className="w-full bg-white py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Why Balray Autos
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              The Better Way to Sell
            </h2>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              We built Balray Autos to be the easiest, safest, and most
              affordable way to sell vehicles in South Africa.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white">
                💰
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">
                100% Free to List
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                No listing fees. No commission when you sell. Keep every rand
                of your sale.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white">
                🇿🇦
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">
                Reach SA Buyers
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Your listing is visible to buyers in every province — from
                Cape Town to Polokwane.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white">
                💬
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">
                Direct Contact
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Buyers reach you instantly on WhatsApp, phone, or email. No
                middlemen, no delays.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white">
                📸
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">
                Show Off Your Vehicle
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Upload up to 10 photos. Buyers see every angle with our
                full-screen gallery.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white">
                🛡️
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">
                Verified Users Only
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Every account requires a verified phone number. Scammers can&apos;t
                hide behind fake accounts.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white">
                🔄
              </div>
              <h3 className="mt-5 text-xl font-black text-[#34414A]">
                Manage Anytime
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Edit, renew, or mark your listing as sold at any time from
                your personal dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full bg-[#F1F4F6] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Simple Process
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              List in 3 Easy Steps
            </h2>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              You could have your vehicle in front of thousands of buyers in
              under 5 minutes.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="relative rounded-2xl border border-[#D5DBDF] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34414A] text-xl font-black text-white">
                1
              </div>
              <h3 className="mt-6 text-xl font-black text-[#34414A]">
                Create Your Account
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Sign up with your email and phone number. We verify your phone
                to keep the marketplace safe. Takes 30 seconds.
              </p>
            </div>

            <div className="relative rounded-2xl border border-[#D5DBDF] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] text-xl font-black text-white">
                2
              </div>
              <h3 className="mt-6 text-xl font-black text-[#34414A]">
                Fill In Your Listing
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Add your vehicle details, upload up to 10 photos, set your
                price, and submit. Our form is fast and mobile-friendly.
              </p>
            </div>

            <div className="relative rounded-2xl border border-[#D5DBDF] bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34414A] text-xl font-black text-white">
                3
              </div>
              <h3 className="mt-6 text-xl font-black text-[#34414A]">
                Get Contacted by Buyers
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Once approved, buyers contact you directly on WhatsApp, phone,
                or email. You handle the sale — you keep all the money.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/sell"
              className="inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md transition hover:brightness-105"
            >
              Start Listing Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="w-full bg-white py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Pricing
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Simple. Honest. Free.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              No tricks. No hidden fees. No commission. Just a great place to
              sell.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <div className="overflow-hidden rounded-3xl border-2 border-[#B08D3C] bg-white shadow-[0_25px_70px_rgba(176,141,60,0.15)]">
              <div className="bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-6 text-center">
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-white/80">
                  Everything You Need
                </div>
                <div className="mt-2 text-5xl font-black text-white">
                  R0
                </div>
                <div className="mt-1 text-sm font-bold text-white/80">
                  Free Forever
                </div>
              </div>

              <div className="space-y-4 p-8">
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-600">✓</span>
                  <span className="text-sm text-[#4A5962]">
                    Unlimited listing renewals (every 30 days)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-600">✓</span>
                  <span className="text-sm text-[#4A5962]">
                    Up to 10 photos per listing with automatic compression
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-600">✓</span>
                  <span className="text-sm text-[#4A5962]">
                    Direct buyer contact via WhatsApp, phone, and email
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-600">✓</span>
                  <span className="text-sm text-[#4A5962]">
                    Personal dashboard to edit, renew, or mark as sold
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-600">✓</span>
                  <span className="text-sm text-[#4A5962]">
                    Featured listing option for extra visibility
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg text-green-600">✓</span>
                  <span className="text-sm text-[#4A5962]">
                    Buyer favorites and view statistics
                  </span>
                </div>
              </div>

              <div className="border-t border-[#E1E5E8] p-8">
                <Link
                  href="/sell"
                  className="block w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-center font-bold text-white shadow-md hover:brightness-105"
                >
                  List Your Vehicle Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-[#F1F4F6] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Questions?
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-[#FBF7EC]"
                >
                  <span className="text-base font-black text-[#34414A] sm:text-lg">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FBF7EC] text-lg font-black text-[#8F7130] transition-transform ${
                      openFaq === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === index && (
                  <div className="border-t border-[#E1E5E8] px-6 py-5 text-sm leading-7 text-[#66737C]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#9A7B37]">
            Ready to Sell?
          </div>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl lg:text-5xl">
            Let&apos;s find your buyer.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#66737C]">
            Post your listing today and reach serious buyers across South
            Africa. It takes just a few minutes — and it&apos;s completely free.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sell"
              className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md transition hover:brightness-105"
            >
              List Your Vehicle Free
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-[#B08D3C] bg-white px-8 py-4 font-bold text-[#8F7130] transition hover:bg-[#FBF7EC]"
            >
              Need Help? Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#D4DADF] bg-[#EEF1F3]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <img src="/balray-autos-logo.png" alt="Balray Autos" className="h-11 w-auto max-w-[180px] object-contain" />
              <p className="mt-3 text-sm text-[#68757D]">South African automotive marketplace.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <Link href="/" className="text-[#68757D] hover:text-[#9A7B37]">Home</Link>
              <Link href="/marketplace" className="text-[#68757D] hover:text-[#9A7B37]">Marketplace</Link>
              <Link href="/start-selling" className="text-[#68757D] hover:text-[#9A7B37]">Start Selling</Link>
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