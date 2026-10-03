"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";



export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

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
      setLoading(false);
    };
    loadUser();
  }, [router, supabase]);

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 6000);
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail) {
      showMessage("Please enter a new email address.", "error");
      return;
    }
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      showMessage("That's your current email. Please use a different one.", "error");
      return;
    }

    setEmailSaving(true);

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      showMessage("Error updating email: " + error.message, "error");
      setEmailSaving(false);
      return;
    }

    showMessage(
      "A confirmation link has been sent to both your old and new email. Click it to complete the change.",
      "success"
    );
    setEmailSaving(false);
    setNewEmail("");
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
      

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Account Security
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              Account Settings
            </h1>
            <p className="mt-4 text-base leading-7 text-[#66737C]">
              Manage your email address. Any change must be confirmed via both your old and new email for security.
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

          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#34414A] mb-4">Current Account</h2>
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
          </div>

          <form
            onSubmit={handleEmailChange}
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
                Both your old and new email will receive a confirmation link.
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
                  <strong>Security:</strong> We&apos;ll send a confirmation link to both
                  your old and new email. The change only takes effect after you click
                  the link — this prevents anyone from hijacking your account.
                </p>
              </div>

              <button
                type="submit"
                disabled={emailSaving || !newEmail}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {emailSaving ? "Processing..." : "🔐 Change Email"}
              </button>
            </div>
          </form>
        </div>
      </section>

      
    </main>
  );
}