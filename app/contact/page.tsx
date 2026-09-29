"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Get In Touch
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl lg:text-6xl">
              Contact
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                Balray Autos.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Have a question, need help with a listing, or want to partner
              with us? Reach out — we&apos;ll get back to you as soon as we can.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="w-full bg-[#F7F8F9] py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">

            {/* CONTACT DETAILS */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#D5DBDF] bg-white p-8">
                <h2 className="text-2xl font-black text-[#34414A]">
                  Contact Details
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#66737C]">
                  Reach us directly through any of the channels below.
                </p>

                <div className="mt-8 space-y-5">
                  {/* EMAIL */}
                  <a
                    href="mailto:balrayautos@gmail.com"
                    className="flex items-start gap-4 rounded-xl border border-[#D5DBDF] bg-[#F7F8F9] p-5 transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] text-xl text-white">
                      ✉️
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
                        Email
                      </div>
                      <div className="mt-1 break-all text-sm font-bold text-[#34414A]">
                        balrayautos@gmail.com
                      </div>
                    </div>
                  </a>

                  {/* PHONE */}
                  <a
                    href="tel:+27815973009"
                    className="flex items-start gap-4 rounded-xl border border-[#D5DBDF] bg-[#F7F8F9] p-5 transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] text-xl text-white">
                      📞
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
                        Phone / WhatsApp
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#34414A]">
                        +27 81 597 3009
                      </div>
                    </div>
                  </a>

                  {/* LOCATION */}
                  <div className="flex items-start gap-4 rounded-xl border border-[#D5DBDF] bg-[#F7F8F9] p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] text-xl text-white">
                      📍
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
                        Location
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#34414A]">
                        South Africa
                      </div>
                    </div>
                  </div>

                  {/* HOURS */}
                  <div className="flex items-start gap-4 rounded-xl border border-[#D5DBDF] bg-[#F7F8F9] p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] text-xl text-white">
                      🕐
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
                        Response Time
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#34414A]">
                        Within 24 hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHATSAPP CTA */}
              <a
                href="https://wa.me/27815973009"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 p-8 text-center transition hover:bg-[#25D366]/20"
              >
                <div className="text-4xl">💬</div>
                <div className="mt-3 text-lg font-black text-[#34414A]">
                  Chat on WhatsApp
                </div>
                <div className="mt-2 text-sm text-[#66737C]">
                  Fastest way to reach us
                </div>
              </a>
            </div>

            {/* CONTACT FORM */}
            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-8 sm:p-10">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FBF7EC] text-4xl">
                    ✓
                  </div>
                  <h2 className="mt-6 text-2xl font-black text-[#34414A]">
                    Message Sent!
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#66737C]">
                    Thanks for reaching out. We&apos;ll get back to you within
                    24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-8 rounded-xl border border-[#B08D3C] bg-white px-6 py-3 font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-[#34414A]">
                    Send Us a Message
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#66737C]">
                    Fill in the form and we&apos;ll respond as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none transition focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-bold text-[#34414A]"
                        >
                          Email *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none transition focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-2 block text-sm font-bold text-[#34414A]"
                        >
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="e.g. 082 123 4567"
                          className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none transition focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        defaultValue=""
                        className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      >
                        <option value="" disabled>
                          Choose a subject
                        </option>
                        <option value="general">General Enquiry</option>
                        <option value="listing">Listing Help</option>
                        <option value="buying">Buying a Vehicle</option>
                        <option value="selling">Selling a Vehicle</option>
                        <option value="partnership">Partnership / Business</option>
                        <option value="report">Report a Listing</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-bold text-[#34414A]"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        placeholder="Tell us how we can help..."
                        className="w-full resize-y rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm leading-6 text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-base font-bold text-white shadow-md transition hover:brightness-105"
                    >
                      Send Message
                    </button>

                    <p className="text-center text-xs leading-5 text-[#89939A]">
                      We typically respond within 24 hours.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
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