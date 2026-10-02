"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.balrayautos.co.za";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Check your email! We sent you a password reset link. It may take a minute to arrive — check your spam folder too."
      );
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] text-[#34414A] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D9DEE2] bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/balray-autos-logo.png"
            alt="Balray Autos"
            className="h-16 w-auto max-w-[220px] object-contain mb-5"
          />
          <h1 className="text-3xl font-black tracking-tight text-[#34414A]">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-[#7A858D]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-[#34414A] mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 rounded-xl border p-4 text-center text-sm font-semibold ${
              message.includes("Check your email")
                ? "border-[#D3B86A]/50 bg-[#FBF7EC] text-[#8F7130]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[#66737C]">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#9A7B37] hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}