"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  onVerified: (nonce: string) => void;
  onClose: () => void;
  actionLabel?: string;
  userEmail: string;
};

export default function PhoneVerifyModal({
  onVerified,
  onClose,
  actionLabel = "continue",
  userEmail,
}: Props) {
  const [nonce, setNonce] = useState("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const sendCode = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email: userEmail,
      options: { shouldCreateUser: false },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStep("verify");
    setLoading(false);
  };

  const verify = () => {
    if (nonce.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    onVerified(nonce);
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
            {step === "send" ? "Verify Your Identity" : "Enter Email Code"}
          </h2>
          <p className="mt-1 text-sm text-white/90">
            {step === "send"
              ? `We'll send a code to your email to confirm it's you before you ${actionLabel}.`
              : `Enter the 6-digit code we sent to ${userEmail}.`}
          </p>
        </div>

        <div className="p-6">
          {step === "send" ? (
            <>
              <div className="rounded-xl bg-[#FBF7EC] p-4 text-sm text-[#8F7130]">
                A verification code will be sent to <strong>{userEmail}</strong>. Enter it in the next step.
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={sendCode}
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending Code..." : "Send Email Code"}
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
                value={nonce}
                onChange={(e) => setNonce(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={verify}
                disabled={nonce.length !== 6}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Verify & Continue
              </button>

              <button
                onClick={() => {
                  setStep("send");
                  setNonce("");
                  setError("");
                }}
                className="mt-3 w-full text-center text-xs font-bold text-[#9A7B37] hover:underline"
              >
                ← Send a new code
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}