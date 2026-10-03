"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profile);
      setLoading(false);
    };
    loadAccount();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading your account...
        </div>
      </main>
    );
  }

  if (!user) return null;

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || "Not set";

  const phone =
    profile?.phone || user.user_metadata?.phone || "Not set";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Your Account
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              Account Details
            </h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              These details are locked to your account and are used automatically on every advert you post. They cannot be changed.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* INFO BANNER */}
          <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <div className="text-sm font-black text-[#8F7130]">
                  Locked for Your Security
                </div>
                <p className="mt-1 text-xs leading-5 text-[#8F7130]">
                  Your name, email, and phone number are permanently linked to your account.
                  This prevents account hijacking and lets buyers always reach the real owner of every advert.
                </p>
              </div>
            </div>
          </div>

          {/* DISPLAY NAME */}
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#34414A]">
                Full Name
              </label>
              <span className="rounded-full bg-[#F7F8F9] px-3 py-1 text-xs font-bold text-[#89939A]">
                🔒 Locked
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] px-4 py-3.5">
              <span className="text-lg">👤</span>
              <span className="truncate text-sm font-bold text-[#34414A]">
                {displayName}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#89939A]">
              Shown publicly on every advert you post.
            </p>
          </div>

          {/* EMAIL */}
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#34414A]">
                Email Address
              </label>
              <span className="rounded-full bg-[#F7F8F9] px-3 py-1 text-xs font-bold text-[#89939A]">
                🔒 Locked
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] px-4 py-3.5">
              <span className="text-lg">✉️</span>
              <span className="truncate text-sm font-bold text-[#34414A]">
                {user.email}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#89939A]">
              Used for login and shown on every advert you post.
            </p>
          </div>

          {/* PHONE */}
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#34414A]">
                Phone Number
              </label>
              <span className="rounded-full bg-[#F7F8F9] px-3 py-1 text-xs font-bold text-[#89939A]">
                🔒 Locked
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] px-4 py-3.5">
              <span className="text-lg">📱</span>
              <span className="truncate text-sm font-bold text-[#34414A]">
                {phone}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#89939A]">
              Used by buyers to reach you on every advert you post.
            </p>
          </div>

          {/* WHY THIS IS LOCKED */}
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#34414A] mb-4">
              🛡️ Why Can&apos;t I Change These?
            </h2>
            <ul className="space-y-3 text-sm text-[#4A5962]">
              <li className="flex items-start gap-3">
                <span className="text-green-600">✓</span>
                <span>
                  <strong>Prevents account hijacking</strong> — a hacker who steals one credential can&apos;t lock you out by swapping your details.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600">✓</span>
                <span>
                  <strong>Blocks scam listings</strong> — thieves can&apos;t post cars and then redirect buyers to a fake phone number.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600">✓</span>
                <span>
                  <strong>Builds buyer trust</strong> — buyers know the contact details on every advert belong to the real account owner.
                </span>
              </li>
            </ul>
          </div>

          {/* NEED HELP */}
          <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6 text-center">
            <p className="text-sm text-[#8F7130]">
              Need to update your details?
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block rounded-xl bg-[#34414A] px-6 py-3 text-sm font-bold text-white hover:bg-[#4A5962]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}