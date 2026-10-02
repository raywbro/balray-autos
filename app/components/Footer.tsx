"use client";

import Link from "next/link";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com/balrayautos",
    bg: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045]",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/balrayautos",
    bg: "bg-[#1877F2]",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "X (Twitter)",
    href: "https://twitter.com/balrayautos",
    bg: "bg-[#34414A]",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/27815973009",
    bg: "bg-[#25D366]",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
];

// Top cities for footer links
const FOOTER_CITIES = [
  { slug: "johannesburg", name: "Johannesburg" },
  { slug: "cape-town", name: "Cape Town" },
  { slug: "durban", name: "Durban" },
  { slug: "pretoria", name: "Pretoria" },
  { slug: "gqeberha", name: "Gqeberha" },
  { slug: "bloemfontein", name: "Bloemfontein" },
];

// Top brands for footer links
const FOOTER_BRANDS = [
  { slug: "toyota", name: "Toyota" },
  { slug: "volkswagen", name: "Volkswagen" },
  { slug: "ford", name: "Ford" },
  { slug: "bmw", name: "BMW" },
  { slug: "mercedes-benz", name: "Mercedes-Benz" },
  { slug: "audi", name: "Audi" },
  { slug: "nissan", name: "Nissan" },
  { slug: "hyundai", name: "Hyundai" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#D4DADF] bg-[#EEF1F3]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* BRAND + SOCIALS */}
          <div className="min-w-0 md:col-span-2 lg:col-span-2">
            <img
              src="/balray-autos-logo.png"
              alt="Balray Autos"
              className="h-12 w-auto max-w-[190px] object-contain"
            />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#68757D]">
              South Africa&apos;s automotive marketplace connecting buyers and
              sellers of cars, bakkies, motorcycles, trucks, machinery, and
              parts.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${social.bg}`}
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* POPULAR BRANDS */}
          <div>
            <h3 className="font-bold text-[#34414A]">Popular Brands</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {FOOTER_BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}`}
                  className="text-[#68757D] transition hover:text-[#9A7B37]"
                >
                  {brand.name} for Sale
                </Link>
              ))}
              <Link
                href="/brands"
                className="font-bold text-[#9A7B37] transition hover:underline"
              >
                View All Brands →
              </Link>
            </div>
          </div>

          {/* CITIES */}
          <div>
            <h3 className="font-bold text-[#34414A]">Browse by City</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {FOOTER_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cars-for-sale/${city.slug}`}
                  className="text-[#68757D] transition hover:text-[#9A7B37]"
                >
                  {city.name}
                </Link>
              ))}
              <Link
                href="/cars-for-sale"
                className="font-bold text-[#9A7B37] transition hover:underline"
              >
                View All Cities →
              </Link>
            </div>
          </div>

          {/* MARKETPLACE */}
          <div>
            <h3 className="font-bold text-[#34414A]">Marketplace</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link
                href="/marketplace?category=Cars+%26+SUVs"
                className="text-[#68757D] transition hover:text-[#9A7B37]"
              >
                Cars & SUVs
              </Link>
              <Link
                href="/marketplace?category=Bakkies+%26+4x4s"
                className="text-[#68757D] transition hover:text-[#9A7B37]"
              >
                Bakkies & 4x4s
              </Link>
              <Link
                href="/marketplace?category=Motorcycles"
                className="text-[#68757D] transition hover:text-[#9A7B37]"
              >
                Motorcycles
              </Link>
              <Link
                href="/marketplace?category=Trucks+%26+Commercial"
                className="text-[#68757D] transition hover:text-[#9A7B37]"
              >
                Trucks & Commercial
              </Link>
              <Link
                href="/marketplace?category=Machinery+%26+Equipment"
                className="text-[#68757D] transition hover:text-[#9A7B37]"
              >
                Machinery & Equipment
              </Link>
              <Link
                href="/marketplace?category=Parts+%26+Accessories"
                className="text-[#68757D] transition hover:text-[#9A7B37]"
              >
                Parts & Accessories
              </Link>
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="font-bold text-[#34414A]">Company</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/about" className="text-[#68757D] transition hover:text-[#9A7B37]">
                About
              </Link>
              <Link href="/blog" className="text-[#68757D] transition hover:text-[#9A7B37]">
                Blog
              </Link>
              <Link href="/start-selling" className="text-[#68757D] transition hover:text-[#9A7B37]">
                Sell Your Vehicle
              </Link>
              <Link href="/contact" className="text-[#68757D] transition hover:text-[#9A7B37]">
                Contact
              </Link>
              <Link href="/terms" className="text-[#68757D] transition hover:text-[#9A7B37]">
                Terms
              </Link>
              <Link href="/privacy" className="text-[#68757D] transition hover:text-[#9A7B37]">
                Privacy
              </Link>
            </div>
          </div>
        </div>

        {/* CONTACT BAR */}
        <div className="mt-10 rounded-2xl border border-[#D5DBDF] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-[#34414A]">
              <a href="mailto:balrayautos@gmail.com" className="flex items-center gap-2 hover:text-[#9A7B37]">
                ✉️ balrayautos@gmail.com
              </a>
              <a href="tel:+27815973009" className="flex items-center gap-2 hover:text-[#9A7B37]">
                📞 +27 81 597 3009
              </a>
              <a
                href="https://wa.me/27815973009"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#25D366] hover:underline"
              >
                💬 WhatsApp Us
              </a>
            </div>
            <div className="text-xs font-bold text-[#89939A]">
              @balrayautos on Instagram • Facebook • X
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#D3D9DD] pt-6 text-center text-sm text-[#7A858C]">
          © {new Date().getFullYear()} Balray Autos (Pty) Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}