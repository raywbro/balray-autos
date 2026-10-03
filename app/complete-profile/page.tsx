"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // If they already have a phone, skip this page
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.phone) {
        router.push("/marketplace");
        return;
      }

      setUser(user);
      setFullName(
        profile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ""
      );
      setLoading(false);
    };
    loadUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Clean and format phone
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid South African phone number.");
      setSaving(false);
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

    // Check if phone is already in use
    const { data: phoneExists } = await supabase.rpc("check_phone_exists", {
      phone_input: formattedPhone,
    });

    if (phoneExists) {
      setError("This phone number is already registered. Please use a different one.");
      setSaving(false);
      return;
    }

    // Update the profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone: formattedPhone,
        full_name: fullName || user.user_metadata?.name || "User",
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // Also save to user_metadata so it's available everywhere
    await supabase.auth.updateUser({
      data: {
        full_name: fullName || user.user_metadata?.name || "User",
        phone: formattedPhone,
      },
    });

    router.push("/marketplace");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] text-[#34414A] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D9DEE2] bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/balray-autos-logo.png"
            alt="Balray Autos"
            className="h-16 w-auto max-w-[220px] object-contain mb-5"
          />
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
            <span>1</span>
            <span>Final Step</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#34414A]">
            Almost There!
          </h1>
          <p className="mt-2 text-sm text-[#7A858D]">
            We just need your phone number so buyers can reach you.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">📱</span>
            <p className="text-xs leading-5 text-[#8F7130]">
              Your phone number is <strong>locked</strong> to your account. It
              will appear on every advert you post so buyers can contact you
              directly via WhatsApp or phone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            <label htmlFor="phone" className="block text-sm font-bold text-[#34414A] mb-2">
              Phone Number *
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
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Complete Signup"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#89939A]">
          Your details are protected and never shared with third parties.
        </p>
      </div>
    </main>
  );
}