"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";

const categories = [
  {
    title: "Cars & SUVs",
    description: "Everyday cars, luxury vehicles and SUVs.",
    href: "/marketplace",
    icon: "🚗",
  },
  {
    title: "Bakkies & 4x4s",
    description: "Bakkies, pickups and off-road vehicles.",
    href: "/marketplace",
    icon: "🛻",
  },
  {
    title: "Motorcycles",
    description: "Motorcycles, scooters and adventure bikes.",
    href: "/marketplace",
    icon: "🏍️",
  },
  {
    title: "Trucks & Commercial",
    description: "Trucks and vehicles for business.",
    href: "/marketplace",
    icon: "🚚",
  },
  {
    title: "Machinery & Equipment",
    description: "Machinery and equipment for work.",
    href: "/marketplace",
    icon: "🚜",
  },
  {
    title: "Parts & Accessories",
    description: "Parts, accessories and automotive products.",
    href: "/marketplace",
    icon: "⚙️",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        {/* Chrome decorative shapes */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />
        <div className="pointer-events-none absolute right-20 top-20 h-24 w-24 rounded-full border-[8px] border-[#D2B66A]/20" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          {/* Hero Text */}
          <div className="min-w-0">
            <div className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130] sm:text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              South Africa Automotive Marketplace
            </div>

            <h1 className="max-w-3xl break-words text-[clamp(2.7rem,10vw,5.5rem)] font-black leading-[0.95] tracking-[-0.05em] text-[#34414A]">
              Buy.
              <br />
              Sell.
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                Drive Forward.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg sm:leading-8">
              Balray Autos connects buyers and sellers across South Africa.
              Discover vehicles, connect with sellers and find your next
              automotive opportunity.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-center font-bold text-white shadow-md transition hover:brightness-105 sm:w-auto"
              >
                Browse Marketplace
              </Link>

              <Link
                href="/sell"
                className="w-full rounded-xl border border-[#B08D3C] bg-white px-6 py-4 text-center font-bold text-[#8F7130] transition hover:bg-[#FBF7EC] sm:w-auto"
              >
                Sell Your Vehicle
              </Link>
            </div>
          </div>

          {/* Hero Brand Card */}
          <div className="flex w-full min-w-0 justify-center lg:justify-end">
            <div className="w-full max-w-xl rounded-3xl border border-[#D5DBDF] bg-[#F1F4F6] p-5 shadow-[0_25px_70px_rgba(52,65,74,0.12)] sm:p-7">
              <div className="relative flex min-h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white px-5 py-10 text-center sm:min-h-[390px] sm:px-8">
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border-[16px] border-[#D9DEE2]/70" />
                <div className="pointer-events-none absolute -bottom-14 -left-12 h-36 w-36 rounded-full border-[14px] border-[#C3CBD0]/50" />
                <div className="absolute left-10 right-10 top-8 h-[2px] bg-gradient-to-r from-transparent via-[#B08D3C] to-transparent" />

                <img
                  src="/balray-autos-logo.png"
                  alt="Balray Autos logo"
                  className="relative z-10 h-auto w-full max-w-[300px] object-contain sm:max-w-[380px]"
                />

                <div className="relative z-10 mt-8 flex max-w-full flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-[#34414A] px-3 py-2 text-xs font-bold text-white">
                    BUY
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] px-3 py-2 text-xs font-bold text-white">
                    SELL
                  </span>
                  <span className="rounded-full border border-[#D3D9DD] bg-[#F1F4F6] px-3 py-2 text-xs font-bold text-[#34414A]">
                    CONNECT
                  </span>
                </div>

                <p className="relative z-10 mt-6 max-w-md text-sm leading-6 text-[#66737C] sm:text-base">
                  Your marketplace for vehicles and automotive opportunities
                  across South Africa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="w-full bg-[#34414A]">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D2B66A]">
            Marketplace Search
          </div>

          <div className="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_240px_170px]">
            <input
              type="text"
              placeholder="Search vehicles, makes, models..."
              className="min-w-0 w-full rounded-xl border border-white/10 bg-[#FAFBFC] px-4 py-4 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />

            <select
              className="min-w-0 w-full rounded-xl border border-white/10 bg-[#FAFBFC] px-4 py-4 text-sm font-medium text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              defaultValue=""
            >
              <option value="" disabled>
                Choose category
              </option>
              <option value="vehicles">Cars & SUVs</option>
              <option value="bakkies">Bakkies & 4x4s</option>
              <option value="motorcycles">Motorcycles</option>
              <option value="trucks">Trucks & Commercial</option>
              <option value="machinery">Machinery & Equipment</option>
              <option value="parts">Parts & Accessories</option>
            </select>

            <Link
              href="/marketplace"
              className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-center text-sm font-bold text-white transition hover:brightness-105"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* MARKETPLACE RANGE */}
      <section className="w-full border-b border-[#D9DEE2] bg-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 md:grid-cols-4">
          {[
            ["Cars", "/marketplace"],
            ["Bakkies", "/marketplace"],
            ["Motorcycles", "/marketplace"],
            ["Commercial", "/marketplace"],
          ].map(([title, href]) => (
            <Link
              key={title}
              href={href}
              className="w-full min-w-0 border-b border-[#D9DEE2] px-3 py-6 text-center transition hover:bg-[#FBF7EC] md:border-b-0 md:border-r md:last:border-r-0"
            >
              <div className="break-words text-base font-bold text-[#34414A] sm:text-lg">
                {title}
              </div>
              <div className="mt-1 text-xs text-[#7A858C] sm:text-sm">
                Explore listings
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="w-full bg-[#F1F4F6]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Explore
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Find What You&apos;re Looking For
            </h2>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              Browse different areas of the automotive marketplace and find
              vehicles, equipment and automotive products.
            </p>
          </div>

          <div className="mt-10 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group w-full min-w-0 rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C]/60 hover:shadow-[0_15px_40px_rgba(52,65,74,0.10)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FBF7EC] text-2xl">
                  {category.icon}
                </div>
                <h3 className="mt-5 break-words text-xl font-extrabold text-[#34414A] group-hover:text-[#9A7B37]">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  {category.description}
                </p>
                <div className="mt-5 text-sm font-bold text-[#9A7B37]">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Simple Process
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              How Balray Autos Works
            </h2>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              A simple marketplace designed to help buyers and sellers
              connect.
            </p>
          </div>

          <div className="mt-10 grid w-full gap-5 md:grid-cols-3">
            <div className="w-full min-w-0 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34414A] text-lg font-black text-white">
                1
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-[#34414A]">
                Search
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Search through vehicles and automotive listings available on
                the Balray Autos marketplace.
              </p>
            </div>

            <div className="w-full min-w-0 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] text-lg font-black text-white">
                2
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-[#34414A]">
                Connect
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Find a listing that interests you and connect with the seller
                to discuss the vehicle or product.
              </p>
            </div>

            <div className="w-full min-w-0 rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34414A] text-lg font-black text-white">
                3
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-[#34414A]">
                Sell
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66737C]">
                Sellers can submit their vehicles and automotive products for
                review and listing on the marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SELL CTA */}
      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-16">
          <div className="min-w-0">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Sell With Balray Autos
            </div>
            <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Have a vehicle to sell?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">
              Submit your vehicle and connect with potential buyers through
              the Balray Autos marketplace.
            </p>
          </div>

          <Link
            href="/sell"
            className="w-full rounded-xl bg-[#34414A] px-7 py-4 text-center font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4A5962] sm:w-auto"
          >
            List Your Vehicle
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="w-full bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div className="min-w-0">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              About Balray Autos
            </div>
            <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              More than just a vehicle website.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#68757D]">
              Balray Autos is being built as an automotive marketplace where
              buyers and sellers can connect around vehicles and automotive
              products.
            </p>
            <p className="mt-4 text-base leading-7 text-[#68757D]">
              The goal is to make finding and listing automotive opportunities
              simpler, clearer and more accessible across South Africa.
            </p>

            <Link
              href="/about"
              className="mt-7 inline-flex rounded-xl border border-[#B08D3C] px-5 py-3 font-bold text-[#8F7130] transition hover:bg-[#FBF7EC]"
            >
              Learn More
            </Link>
          </div>

          <div className="w-full min-w-0">
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#9A7B37]">SA</div>
                <div className="mt-2 font-bold text-[#34414A]">South Africa</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Built for the South African automotive market.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#34414A]">24/7</div>
                <div className="mt-2 font-bold text-[#34414A]">Online Marketplace</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Browse listings whenever you need them.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#9A7B37]">BUY</div>
                <div className="mt-2 font-bold text-[#34414A]">Discover Vehicles</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Find vehicles and automotive products.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5DBDF] bg-[#F7F8F9] p-6">
                <div className="text-3xl font-black text-[#34414A]">SELL</div>
                <div className="mt-2 font-bold text-[#34414A]">List Your Vehicle</div>
                <p className="mt-2 text-sm leading-6 text-[#6B747A]">
                  Submit your listing to the marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="w-full bg-[#F1F4F6]">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#9A7B37]">
            Balray Autos
          </div>

          <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl lg:text-5xl">
            Ready to find your next vehicle?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#66737C]">
            Explore the Balray Autos marketplace or list your vehicle and
            connect with potential buyers.
          </p>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/marketplace"
              className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 font-bold text-white shadow-md transition hover:brightness-105 sm:w-auto"
            >
              Browse Marketplace
            </Link>

            <Link
              href="/sell"
              className="w-full rounded-xl border border-[#B08D3C] bg-white px-6 py-4 font-bold text-[#8F7130] transition hover:bg-[#FBF7EC] sm:w-auto"
            >
              Sell a Vehicle
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#D4DADF] bg-[#EEF1F3]">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid w-full gap-10 md:grid-cols-3">
            <div className="min-w-0">
              <img
                src="/balray-autos-logo.png"
                alt="Balray Autos"
                className="h-12 w-auto max-w-[190px] object-contain"
              />
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#68757D]">
                Balray Autos is a South African automotive marketplace
                connecting buyers and sellers.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#34414A]">Marketplace</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <Link href="/marketplace" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Cars & SUVs
                </Link>
                <Link href="/marketplace" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Bakkies & 4x4s
                </Link>
                <Link href="/marketplace" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Motorcycles
                </Link>
                <Link href="/marketplace" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Trucks & Commercial
                </Link>
                <Link href="/marketplace" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Machinery & Equipment
                </Link>
                <Link href="/marketplace" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Parts & Accessories
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#34414A]">Company</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <Link href="/about" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  About Balray Autos
                </Link>
                <Link href="/contact" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Contact
                </Link>
                <Link href="/sell" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Sell Your Vehicle
                </Link>
                <Link href="/terms" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="text-[#68757D] transition hover:text-[#9A7B37]">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-[#D3D9DD] pt-6 text-center text-sm text-[#7A858C]">
            © {new Date().getFullYear()} Balray Autos (Pty) Ltd. All rights
            reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}