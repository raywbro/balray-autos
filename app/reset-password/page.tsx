"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted && !user) {
        router.push("/login");
        return;
      }
      if (mounted) setChecking(false);
    };
    checkSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");
    setMessageType("success");
    setTimeout(() => router.push("/login"), 2500);
  };

  if (checking) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Verifying...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D9DEE2] bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/balray-autos-logo.png"
            alt="Balray Autos"
            className="h-16 w-auto max-w-[220px] object-contain mb-5"
          />
          <h1 className="text-3xl font-black text-[#34414A]">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-[#7A858D]">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-[#34414A] mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#34414A] mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Re-enter your password"
              className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 rounded-xl border p-4 text-center text-sm font-semibold ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[#66737C]">
          <Link
            href="/login"
            className="font-bold text-[#9A7B37] hover:underline"
          >
            ← Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}