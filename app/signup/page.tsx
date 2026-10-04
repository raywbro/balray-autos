"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordsDontMatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please check and try again.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setMessage(
        "Please enter a valid South African phone number (e.g. 0821234567)."
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+27" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("27")) {
      formattedPhone = "+27" + formattedPhone;
    } else {
      formattedPhone = "+" + formattedPhone;
    }

    // ⚠️ CHECK 1: Is this email banned?
    const { data: emailBanned } = await supabase.rpc("check_email_banned", {
      email_input: email.toLowerCase(),
    });

    if (emailBanned) {
      setMessage(
        "🚫 This email address is permanently blocked due to a previous ban. You cannot sign up with this email."
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    // ⚠️ CHECK 2: Is this phone already registered (including banned users)?
    const { data: phoneExists } = await supabase.rpc("check_phone_exists", {
      phone_input: formattedPhone,
    });

    if (phoneExists) {
      setMessage(
        "🚫 This phone number is already registered or permanently blocked. Please use a different number."
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: formattedPhone,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoading(false);
    } else {
      setMessage(
        "Success! Check your email for the confirmation link to activate your account."
      );
      setMessageType("success");
      setLoading(false);
      setTimeout(() => router.push("/login"), 3500);
    }
  };

  const handleGoogleSignup = async () => {
    setSocialLoading("google");
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/marketplace`,
      },
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setSocialLoading(null);
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
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-[#7A858D]">
            Join Balray Autos to start buying and selling.
          </p>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#D9DEE2] bg-white px-5 py-3.5 text-sm font-bold text-[#34414A] transition hover:bg-[#F7F8F9] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {socialLoading === "google"
              ? "Connecting..."
              : "Sign up with Google"}
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E1E5E8]"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
            <span className="bg-white px-3 text-[#89939A]">
              Or sign up with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-bold text-[#34414A] mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="John Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />
          </div>

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

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-bold text-[#34414A] mb-2"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="e.g. 082 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />
            <p className="mt-2 text-xs text-[#89939A]">
              Used by buyers to reach you. One account per phone number.
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-[#34414A] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-[#D9DEE2] bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold text-[#34414A] mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full rounded-xl border bg-[#FAFBFC] px-4 py-3 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:ring-2 ${
                passwordsMatch
                  ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
                  : passwordsDontMatch
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-[#D9DEE2] focus:border-[#B08D3C] focus:ring-[#B08D3C]/20"
              }`}
            />
            {passwordsMatch && (
              <p className="mt-2 text-xs font-bold text-green-600">
                ✓ Passwords match
              </p>
            )}
            {passwordsDontMatch && (
              <p className="mt-2 text-xs font-bold text-red-600">
                ✕ Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 rounded-xl border p-4 text-center text-sm font-semibold ${
              messageType === "success"
                ? "border-[#D3B86A]/50 bg-[#FBF7EC] text-[#8F7130]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[#66737C]">
          Already have an account?{" "}
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