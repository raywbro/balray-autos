"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PhoneVerifyModal from "@/app/components/PhoneVerifyModal";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Phone state
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [currentPhone, setCurrentPhone] = useState("");

  // Email change state
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [pendingEmailAction, setPendingEmailAction] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  // Phone change state
  const [newPhone, setNewPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailNonceSent, setEmailNonceSent] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setCurrentPhone(user.phone || "");

      // Check if phone MFA factor is enrolled and verified
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const phoneFactor = factors?.phone?.[0];
      if (phoneFactor && phoneFactor.status === "verified") {
        setPhoneVerified(true);
      }

      setLoading(false);
    };
    loadUser();
  }, [router, supabase]);

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // ----- EMAIL CHANGE -----
  const handleEmailChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      showMessage("Please enter a new email address.", "error");
      return;
    }
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      showMessage("That's your current email. Please use a different one.", "error");
      return;
    }

    // If phone is already verified, we still require OTP again for this sensitive action
    setPendingEmailAction(true);
    setShowPhoneVerify(true);
  };

  const handlePhoneVerifiedForEmail = async () => {
    setShowPhoneVerify(false);
    setEmailSaving(true);

    // Phone was just verified via SMS. Now change the email.
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      showMessage("Error updating email: " + error.message, "error");
      setEmailSaving(false);
      return;
    }

    showMessage(
      "Verification SMS confirmed. A confirmation link has been sent to both your old and new email. Click it to complete the change.",
      "success"
    );
    setEmailSaving(false);
    setPendingEmailAction(false);
    setNewEmail("");
  };

  // ----- PHONE CHANGE -----
  const handlePhoneChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone) {
      showMessage("Please enter a new phone number.", "error");
      return;
    }

    // Step 1: Send an email nonce to verify identity
    setPhoneSaving(true);

    const { error: reauthError } = await supabase.auth.reauthenticate();

    if (reauthError) {
      showMessage("Error sending verification email: " + reauthError.message, "error");
      setPhoneSaving(false);
      return;
    }

    setEmailNonceSent(true);
    setPhoneSaving(false);
    showMessage(
      "We've sent a verification code to your email. Enter it below to confirm the phone change.",
      "success"
    );
  };

  const handlePhoneChangeComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nonce = formData.get("nonce") as string;

    if (!nonce || nonce.length < 6) {
      showMessage("Please enter the 6-digit code from your email.", "error");
      return;
    }

    // Clean the new phone number
    let cleaned = newPhone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) cleaned = "27" + cleaned.substring(1);
    const fullPhone = "+" + cleaned;

    setPhoneSaving(true);

    const { error } = await supabase.auth.updateUser({
      phone: fullPhone,
      nonce,
    });

    if (error) {
      showMessage("Error updating phone: " + error.message, "error");
      setPhoneSaving(false);
      return;
    }

    showMessage(
      "Phone updated successfully! You'll receive an SMS to verify the new number.",
      "success"
    );
    setNewPhone("");
    setEmailNonceSent(false);
    setPhoneSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading account settings...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Account Security
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              Security Settings
            </h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              Manage your email and phone. Changing either requires verifying the other channel first — this stops hackers in their tracks.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">

          {message && (
            <div
              className={`rounded-xl border p-4 text-center text-sm font-bold ${
                messageType === "success"
                  ? "border-[#D3B86A]/50 bg-[#FBF7EC] text-[#8F7130]"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          {/* CURRENT STATUS */}
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#34414A] mb-4">Current Status</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F7F8F9] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  Email Address
                </div>
                <div className="mt-1 break-all text-sm font-bold text-[#34414A]">
                  {user.email}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                  ✓ Confirmed
                </div>
              </div>
              <div className="rounded-xl bg-[#F7F8F9] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                  Phone Number
                </div>
                <div className="mt-1 text-sm font-bold text-[#34414A]">
                  {currentPhone || "Not set"}
                </div>
                {phoneVerified ? (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    ✓ Verified
                  </div>
                ) : (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
                    ⚠ Not verified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHANGE EMAIL */}
          <form
            onSubmit={handleEmailChangeRequest}
            className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm"
          >
            <div className="border-b border-[#E1E5E8] bg-[#34414A] px-6 py-5">
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#D2B66A]">
                🔒 Secure Email Change
              </div>
              <h2 className="mt-1 text-xl font-black text-white">
                Change Your Email
              </h2>
              <p className="mt-1 text-xs text-[#D9DEE2]">
                You&apos;ll need to verify via SMS code before we change your email.
              </p>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-bold text-[#34414A]">
                New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newemail@example.com"
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
              />

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#FBF7EC] p-4">
                <span className="text-lg">🛡️</span>
                <p className="text-xs leading-5 text-[#8F7130]">
                  <strong>Security:</strong> To protect against email hijacking, we&apos;ll send
                  an SMS verification code to your phone. You must enter it correctly
                  before the email change is applied.
                </p>
              </div>

              <button
                type="submit"
                disabled={emailSaving || !newEmail}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {emailSaving ? "Processing..." : "🔐 Verify Phone & Change Email"}
              </button>
            </div>
          </form>

          {/* CHANGE PHONE */}
          <form
            onSubmit={emailNonceSent ? handlePhoneChangeComplete : handlePhoneChangeRequest}
            className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm"
          >
            <div className="border-b border-[#E1E5E8] bg-[#34414A] px-6 py-5">
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#D2B66A]">
                🔒 Secure Phone Change
              </div>
              <h2 className="mt-1 text-xl font-black text-white">
                Change Your Phone Number
              </h2>
              <p className="mt-1 text-xs text-[#D9DEE2]">
                We&apos;ll send a code to your current email first to confirm it&apos;s you.
              </p>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-bold text-[#34414A]">
                New Phone Number
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="e.g. 082 123 4567"
                disabled={emailNonceSent}
                className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20 disabled:bg-[#F7F8F9] disabled:opacity-60"
              />

              {emailNonceSent && (
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-bold text-[#34414A]">
                    Email Verification Code *
                  </label>
                  <input
                    type="text"
                    name="nonce"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    required
                    className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                  />
                  <p className="mt-2 text-xs text-[#89939A]">
                    Check your email at <strong>{user.email}</strong> for the code.
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#FBF7EC] p-4">
                <span className="text-lg">🛡️</span>
                <p className="text-xs leading-5 text-[#8F7130]">
                  <strong>Security:</strong> To protect against SIM-swap attacks, we require
                  email verification before allowing a phone number change.
                </p>
              </div>

              <button
                type="submit"
                disabled={phoneSaving || !newPhone}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {phoneSaving
                  ? "Processing..."
                  : emailNonceSent
                  ? "✅ Confirm Phone Change"
                  : "📧 Verify Email & Change Phone"}
              </button>

              {emailNonceSent && (
                <button
                  type="button"
                  onClick={() => {
                    setEmailNonceSent(false);
                    setNewPhone("");
                  }}
                  className="mt-3 w-full text-center text-xs font-bold text-[#9A7B37] hover:underline"
                >
                  ← Start over
                </button>
              )}
            </div>
          </form>

          {/* INFO CARD */}
          <div className="rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6">
            <h3 className="text-lg font-black text-[#8F7130]">
              🔐 Why This Matters
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#8F7130]">
              <li>• <strong>Email hijacking</strong> is stopped because changing your email requires your phone.</li>
              <li>• <strong>SIM-swap attacks</strong> are stopped because changing your phone requires your email.</li>
              <li>• Even if a hacker steals one of your accounts, they can&apos;t change either without the other.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PHONE VERIFY MODAL */}
      {showPhoneVerify && (
        <PhoneVerifyModal
          actionLabel="change your email"
          onVerified={handlePhoneVerifiedForEmail}
          onClose={() => {
            setShowPhoneVerify(false);
            setPendingEmailAction(false);
          }}
        />
      )}

      <Footer />
    </main>
  );
}