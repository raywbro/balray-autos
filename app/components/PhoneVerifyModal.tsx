"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  onVerified: () => void;
  onClose: () => void;
  actionLabel?: string;
};

export default function PhoneVerifyModal({ onVerified, onClose, actionLabel = "continue" }: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const supabase = createClient();

  const sendCode = async () => {
    setLoading(true);
    setError("");

    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) cleaned = "27" + cleaned.substring(1);
    const fullPhone = cleaned.startsWith("27") ? "+" + cleaned : "+27" + cleaned;

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const existingPhoneFactor = factors?.phone?.[0];

      if (existingPhoneFactor) {
        await supabase.auth.mfa.unenroll({ factorId: existingPhoneFactor.id });
      }

      const enrollRes = await supabase.auth.mfa.enroll({
        phone: fullPhone,
        factorType: "phone",
        friendlyName: "Security Verification",
      });

      if (enrollRes.error) {
        setError(enrollRes.error.message);
        setLoading(false);
        return;
      }

      const currentFactorId = enrollRes.data.id;
      setFactorId(currentFactorId);

      const challengeRes = await supabase.auth.mfa.challenge({
        factorId: currentFactorId,
      });

      if (challengeRes.error) {
        setError(challengeRes.error.message);
        setLoading(false);
        return;
      }

      setChallengeId(challengeRes.data.id);
      setStep("otp");
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to send code. Please try again.");
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError("");

    const verifyRes = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: otp,
    });

    if (verifyRes.error) {
      setError(verifyRes.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onVerified();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative bg-gradient-to-br from-[#8F7130] via-[#B08D3C] to-[#A47F32] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg text-white hover:bg-white/30"
            aria-label="Close"
          >
            ×
          </button>
          <div className="text-4xl">🔐</div>
          <h2 className="mt-3 text-2xl font-black">
            {step === "phone" ? "Verify Your Phone" : "Enter SMS Code"}
          </h2>
          <p className="mt-1 text-sm text-white/90">
            {step === "phone"
              ? `We'll send a code to your phone to confirm it's you before you ${actionLabel}.`
              : `Enter the 6-digit code we sent to your phone.`}
          </p>
        </div>

        <div className="p-6">
          {step === "phone" ? (
            <>
              <label className="mb-2 block text-sm font-bold text-[#34414A]">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 082 123 4567"
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />
              <p className="mt-2 text-xs text-[#89939A]">
                South African numbers only (auto-formatted to +27).
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={sendCode}
                disabled={loading || !phone}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending Code..." : "Send SMS Code"}
              </button>
            </>
          ) : (
            <>
              <label className="mb-2 block text-sm font-bold text-[#34414A]">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={verifyCode}
                disabled={loading || otp.length !== 6}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="mt-3 w-full text-center text-xs font-bold text-[#9A7B37] hover:underline"
              >
                ← Use a different number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}