"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };
    getUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (!session?.user) setIsAdmin(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    setIsAdmin(false);
    router.push("/login");
    router.refresh();
  };

  const navLinkClass = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? "text-sm font-bold text-[#9A7B37]"
      : "text-sm font-semibold text-[#34414A] hover:text-[#9A7B37]";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D9DEE2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex min-w-0 items-center gap-3"
        >
          <img
            src="/balray-autos-logo.png"
            alt="Balray Autos"
            className="h-11 w-auto max-w-[170px] object-contain sm:h-12"
          />
          <div className="hidden min-w-0 sm:block">
            <div className="truncate text-lg font-extrabold tracking-tight text-[#34414A]">
              Balray{" "}
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                Autos
              </span>
            </div>
            <div className="text-xs text-[#7A858D]">
              Automotive Marketplace
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className={navLinkClass("/")}>Home</Link>
          <Link href="/marketplace" className={navLinkClass("/marketplace")}>Buy</Link>
          <Link href="/sell" className={navLinkClass("/sell")}>Sell</Link>

          {user && (
            <>
              <Link href="/my-listings" className={navLinkClass("/my-listings")}>
                My Listings
              </Link>
              <Link href="/analytics" className={navLinkClass("/analytics")}>
                Analytics
              </Link>
              <Link href="/favorites" className={navLinkClass("/favorites")}>
                Favorites
              </Link>
              <Link href="/account/settings" className={navLinkClass("/account/settings")}>
                Settings
              </Link>
            </>
          )}

          {isAdmin && (
            <Link href="/admin" className={navLinkClass("/admin")}>
              Admin Panel
            </Link>
          )}

          <Link href="/blog" className={navLinkClass("/blog")}>Blog</Link>
          <Link href="/about" className={navLinkClass("/about")}>About</Link>
          <Link href="/contact" className={navLinkClass("/contact")}>Contact</Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              LOG OUT
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-[#34414A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A5962]"
            >
              LOG IN
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D9DEE2] bg-white text-[#34414A] md:hidden"
          aria-label="Open navigation menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#D9DEE2] bg-white md:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6">
            <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]">
              Home
            </Link>
            <Link href="/marketplace" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]">
              Buy
            </Link>
            <Link href="/sell" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]">
              Sell
            </Link>

            {user && (
              <>
                <Link
                  href="/my-listings"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-[#FBF7EC] px-4 py-3 font-bold text-[#9A7B37]"
                >
                  My Listings
                </Link>
                <Link
                  href="/analytics"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]"
                >
                  Analytics
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]"
                >
                  Favorites
                </Link>
                <Link
                  href="/account/settings"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]"
                >
                  Settings
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]"
              >
                Admin Panel
              </Link>
            )}

            <Link href="/blog" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]">
              Blog
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]">
              About
            </Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold hover:bg-[#F7F8F9]">
              Contact
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="mt-3 rounded-xl bg-red-50 px-5 py-3 text-center font-bold text-red-600"
              >
                LOG OUT
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-3 rounded-xl bg-[#34414A] px-5 py-3 text-center font-bold text-white"
              >
                LOG IN
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}