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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate phone number format (basic South African check)
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setMessage("Please enter a valid South African phone number (e.g. 0821234567).");
      setLoading(false);
      return;
    }

    // Format phone as +27XXXXXXXXX for storage
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+27" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("27")) {
      formattedPhone = "+27" + formattedPhone;
    } else {
      formattedPhone = "+" + formattedPhone;
    }

    // Check if phone already exists
    const { data: phoneExists, error: phoneCheckError } = await supabase.rpc(
      "check_phone_exists",
      { phone_input: formattedPhone }
    );

    if (phoneCheckError) {
      console.error("Phone check error:", phoneCheckError);
    }

    if (phoneExists) {
      setMessage(
        "This phone number is already registered on Balray Autos. Please log in or use a different number."
      );
      setLoading(false);
      return;
    }

    // Attempt signup
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
      setLoading(false);
    } else {
      setMessage(
        "Success! Check your email for the confirmation link to activate your account."
      );
      setLoading(false);
      setTimeout(() => router.push("/login"), 3500);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] text-[#34414A] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D9DEE2] bg-white p-8 shadow-sm">
        
        {/* HEADER WITH LOGO */}
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

        {/* FORM */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-bold text-[#34414A] mb-2">
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
            <label htmlFor="email" className="block text-sm font-bold text-[#34414A] mb-2">
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
            <label htmlFor="phone" className="block text-sm font-bold text-[#34414A] mb-2">
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
            <label htmlFor="password" className="block text-sm font-bold text-[#34414A] mb-2">
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* MESSAGES */}
        {message && (
          <div
            className={`mt-5 rounded-xl border p-4 text-center text-sm font-semibold ${
              message.includes("Success")
                ? "border-[#D3B86A]/50 bg-[#FBF7EC] text-[#8F7130]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* FOOTER LINK */}
        <p className="mt-8 text-center text-sm text-[#66737C]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#9A7B37] hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}