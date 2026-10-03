"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // 1. Listen for auth events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Has session:", !!session);
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (mounted) {
          setReady(true);
          setChecking(false);
        }
      }
    });

    // 2. Immediately check if a session already exists
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session on load:", !!session);
        if (session && mounted) {
          setReady(true);
          setChecking(false);
          return;
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    checkSession();

    // 3. Retry a few times over 3 seconds (Supabase processes URL tokens async)
    const intervals = [300, 800, 1500, 2500, 3500];
    const timers = intervals.map((ms) =>
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setReady(true);
          setChecking(false);
        }
      }, ms)
    );

    const stopChecking = setTimeout(() => {
      if (mounted) setChecking(false);
    }, 4000);

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      timers.forEach(clearTimeout);
      clearTimeout(stopChecking);
    };
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login");
      }, 2000);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] text-[#34414A] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D9DEE2] bg-white p-8 shadow-sm">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/balray-autos-logo.png"
            alt="Balray Autos"
            className="h-16 w-auto max-w-[220px] object-contain mb-5"
          />
          <h1 className="text-3xl font-black tracking-tight text-[#34414A]">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-[#7A858D]">
            Choose a strong password you&apos;ll remember.
          </p>
        </div>

        {/* LOADING */}
        {checking && !ready && (
          <div className="rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-5 text-center text-sm font-semibold text-[#8F7130]">
            <div className="animate-pulse">Verifying your reset link...</div>
          </div>
        )}

        {/* EXPIRED */}
        {!checking && !ready && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
              This reset link may have expired.
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="w-full rounded-xl border border-[#B08D3C] bg-white px-5 py-3.5 text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
            >
              🔄 Try Again
            </button>
            <Link
              href="/forgot-password"
              className="block w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-center text-sm font-bold text-white shadow-md hover:opacity-95"
            >
              Request a New Reset Link
            </Link>
          </div>
        )}

        {/* FORM */}
        {ready && (
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#34414A] mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#34414A] mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {/* MESSAGES */}
        {message && (
          <div
            className={`mt-5 rounded-xl border p-4 text-center text-sm font-semibold ${
              message.includes("success")
                ? "border-[#D3B86A]/50 bg-[#FBF7EC] text-[#8F7130]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* FOOTER LINK */}
        <p className="mt-8 text-center text-sm text-[#66737C]">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-[#9A7B37] hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}