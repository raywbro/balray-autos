"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase puts the session in the URL when the user clicks the reset link.
    // This listens for that event and unlocks the form.
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if there's already a session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setReady(true);
    };
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    }
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
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-[#7A858D]">
            Choose a strong password you&apos;ll remember.
          </p>
        </div>

        {!ready ? (
          <div className="rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-5 text-center text-sm font-semibold text-[#8F7130]">
            Verifying your reset link... If this takes more than 10 seconds,
            please click the link in your email again.
          </div>
        ) : (
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
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {message && (
          <div className="mt-5 rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 text-center text-sm font-semibold text-[#8F7130]">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}