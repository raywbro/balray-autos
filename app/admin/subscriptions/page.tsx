"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const BANK_DETAILS = {
  bankName: "FNB (First National Bank)",
  accountHolder: "Balray Autos Pty Ltd",
  accountNumber: "63148029978",
  branchCode: "250655",
  accountType: "Business",
  whatsappNumber: "27815973009",
};

type Plan = {
  id: "weekly" | "monthly" | "yearly";
  name: string;
  price: number;
  days: number;
  pricePerDay: string;
  badge?: string;
  highlight?: boolean;
  benefits: string[];
};

const PLANS: Plan[] = [
  {
    id: "weekly",
    name: "Weekly Boost",
    price: 39,
    days: 7,
    pricePerDay: "R5.57/day",
    benefits: [
      "All your adverts go to the TOP of the marketplace",
      "Priority over free listings",
      "Instantly activated after admin approves",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Boost",
    price: 99,
    days: 30,
    pricePerDay: "R3.30/day",
    badge: "MOST POPULAR",
    highlight: true,
    benefits: [
      "All your adverts go to the TOP of the marketplace",
      "Better value than weekly",
      "Priority over free listings",
      "Instantly activated after admin approves",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Boost",
    price: 799,
    days: 365,
    pricePerDay: "R2.19/day",
    badge: "BEST VALUE",
    benefits: [
      "All your adverts go to the TOP for a full year",
      "Biggest savings — save R448 vs monthly",
      "Priority over free listings",
      "Instantly activated after admin approves",
    ],
  },
];

export default function SubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profile);
      setLoading(false);
    };
    load();
  }, [router, supabase]);

  const isActive =
    profile?.subscription_tier &&
    profile.subscription_tier !== "none" &&
    profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const isPending = profile?.subscription_pending === true;

  const daysLeft = isActive
    ? Math.ceil(
        (new Date(profile.subscription_expires_at).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const paymentReference =
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Balray User";

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePlanSelect = async (plan: Plan) => {
    if (!user) return;

    // ⚠️ MANDATORY: user must have ticked the acknowledgment
    if (!agreed) {
      setAgreeError(true);
      // Scroll to the acknowledgment
      document.getElementById("acknowledge")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setAgreeError(false);
    setSelectedPlan(plan);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_pending: true,
        subscription_requested_at: new Date().toISOString(),
        subscription_tier: plan.id,
        subscription_amount: plan.price,
      })
      .eq("id", user.id);

    if (error) {
      setMessage("Error: " + error.message);
      setMessageType("error");
      return;
    }

    setProfile({
      ...profile,
      subscription_pending: true,
      subscription_tier: plan.id,
      subscription_amount: plan.price,
    });

    setMessage(
      "✓ Plan selected. Follow the bank details below to complete payment."
    );
    setMessageType("success");

    setTimeout(() => {
      document.getElementById("bank-details")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  const handleSendProof = () => {
    if (!selectedPlan && !isPending) return;

    const planToSend = selectedPlan || {
      name: profile?.subscription_tier
        ? `${profile.subscription_tier} plan`
        : "subscription",
      price: profile?.subscription_amount || 0,
      days: 30,
    };

    const message = encodeURIComponent(
      `Hi Balray Autos Support! 👋\n\n` +
        `I have paid for my subscription. Here are my details:\n\n` +
        `👤 Profile Name: ${paymentReference}\n` +
        `📧 Email: ${user.email}\n` +
        `🆔 User ID: ${user.id}\n` +
        `💳 Plan: ${planToSend.name}\n` +
        `💰 Amount: R${planToSend.price}\n` +
        `🔖 Reference Used: ${paymentReference}\n\n` +
        `📎 Payment proof attached below ⬇️\n\n` +
        `Please activate my subscription. Thank you!`
    );

    window.open(
      `https://wa.me/${BANK_DETAILS.whatsappNumber}?text=${message}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading subscription plans...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Seller Subscription
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              Boost{" "}
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                ALL Your Listings
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#66737C]">
              Subscribe once and every advert you post goes to the TOP of the
              marketplace for the entire subscription period.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {isActive && (
            <div className="mb-8 overflow-hidden rounded-3xl border-2 border-green-300 bg-gradient-to-br from-green-50 via-white to-green-50 p-6 shadow-md sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-3xl text-white shadow-md">
                    🚀
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-green-700">
                      Active Subscription
                    </div>
                    <div className="mt-1 text-2xl font-black text-[#34414A] capitalize">
                      {profile.subscription_tier} Plan
                    </div>
                    <div className="mt-1 text-sm text-[#66737C]">
                      Expires:{" "}
                      {new Date(profile.subscription_expires_at).toLocaleDateString(
                        "en-ZA",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white px-6 py-4 text-center shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    Days Remaining
                  </div>
                  <div className="mt-1 text-4xl font-black text-green-600">
                    {daysLeft}
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`mb-6 rounded-xl border p-4 text-center text-sm font-bold ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          {/* ⚠️ ACKNOWLEDGMENT BOX */}
          {!isActive && (
            <div
              id="acknowledge"
              className={`mb-8 overflow-hidden rounded-3xl border-4 shadow-lg ${
                agreeError
                  ? "border-red-500 bg-red-50 animate-pulse"
                  : agreed
                  ? "border-green-500 bg-green-50"
                  : "border-red-400 bg-red-50"
              }`}
            >
              <div className="bg-red-600 px-6 py-5 text-white sm:px-8">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-white/90">
                      Read Carefully Before Continuing
                    </div>
                    <h2 className="mt-1 text-2xl font-black">
                      Fraud Warning — Zero Tolerance
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 sm:p-8">
                <div className="rounded-2xl border-2 border-red-300 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⛔</span>
                    <div>
                      <div className="text-base font-black text-red-700">
                        If you send a fake or edited payment receipt:
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-red-700">
                        <li>
                          • Your account will be{" "}
                          <strong>permanently BANNED</strong> — immediately and
                          forever
                        </li>
                        <li>
                          • Your <strong>email address</strong> will be{" "}
                          <strong>blocked from signup</strong> — you cannot
                          create a new account with it
                        </li>
                        <li>
                          • Your <strong>cellphone number</strong> will be{" "}
                          <strong>blocked from signup</strong> — you cannot
                          create a new account with it
                        </li>
                        <li>
                          • No refund, no appeal, no second chance
                        </li>
                        <li>
                          • Your listings will be removed and any existing
                          subscription cancelled without refund
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-[#8F7130]/30 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="text-base font-black text-[#8F7130]">
                        What is required from you:
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4A5962]">
                        <li>
                          • Send the <strong>ORIGINAL, unedited receipt</strong>{" "}
                          from your banking app
                        </li>
                        <li>
                          • Use your <strong>exact profile name</strong> as the
                          payment reference
                        </li>
                        <li>
                          • Send proof to our WhatsApp immediately after payment
                        </li>
                        <li>
                          • Wait for admin verification (usually within 1 hour)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-5 transition ${
                    agreed
                      ? "border-green-500 bg-white"
                      : agreeError
                      ? "border-red-500 bg-white"
                      : "border-[#D5DBDF] bg-white hover:border-[#8F7130]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (e.target.checked) setAgreeError(false);
                    }}
                    className="mt-0.5 h-5 w-5 flex-shrink-0 accent-[#8F7130]"
                  />
                  <span className="text-sm font-bold leading-6 text-[#34414A]">
                    I have read and understood the fraud warning. I confirm that
                    I will only send an original, unedited payment receipt. I
                    understand that sending a fake or edited receipt will result
                    in my account being{" "}
                    <span className="text-red-600">
                      permanently banned
                    </span>{" "}
                    and my{" "}
                    <span className="text-red-600">
                      email address and cellphone number being blocked from
                      future signups
                    </span>
                    .
                  </span>
                </label>

                {agreeError && (
                  <div className="rounded-xl border-2 border-red-500 bg-red-100 p-4 text-center text-sm font-black text-red-700">
                    ⚠️ You must tick the box above before you can choose a plan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PLANS */}
          <div
            className={`grid gap-6 lg:grid-cols-3 ${
              !agreed && !isActive ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  plan.highlight
                    ? "border-[#B08D3C] shadow-[0_15px_40px_rgba(176,141,60,0.20)]"
                    : "border-[#D5DBDF]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="border-b border-[#E1E5E8] p-6">
                  <h3 className="text-xl font-black text-[#34414A]">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#9A7B37]">
                      R{plan.price}
                    </span>
                    <span className="text-sm font-bold text-[#89939A]">
                      / {plan.days} days
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-[#66737C]">
                    {plan.pricePerDay}
                  </div>
                </div>

                <div className="space-y-3 p-6">
                  {plan.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm leading-6 text-[#4A5962]">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E1E5E8] p-6">
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isActive || !agreed}
                    className={`w-full rounded-xl px-6 py-4 text-sm font-bold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed ${
                      plan.highlight
                        ? "bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] text-white hover:brightness-110"
                        : "bg-[#34414A] text-white hover:bg-[#4A5962]"
                    }`}
                  >
                    {isActive
                      ? "Already Subscribed"
                      : !agreed
                      ? "Tick the box above first"
                      : "Choose This Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* BANK DETAILS */}
          {(selectedPlan || isPending) && !isActive && (
            <div
              id="bank-details"
              className="mt-12 overflow-hidden rounded-3xl border-2 border-[#B08D3C] bg-white shadow-[0_15px_40px_rgba(176,141,60,0.15)]"
            >
              <div className="bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-6 sm:px-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
                    💳
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-white/80">
                      Step 2 — Complete Payment
                    </div>
                    <h2 className="mt-1 text-2xl font-black">
                      Bank Transfer Details
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-6 rounded-2xl border-2 border-dashed border-[#8F7130] bg-[#FBF7EC] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-[#8F7130]">
                        ⚠️ Mandatory Payment Reference
                      </div>
                      <p className="mt-2 text-xs text-[#8F7130]/80">
                        Use this exact reference — otherwise your payment
                        cannot be matched and your account will be locked.
                      </p>
                      <div className="mt-3 text-2xl font-black text-[#34414A] break-all">
                        {paymentReference}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(paymentReference, "reference")
                      }
                      className="flex-shrink-0 rounded-xl border border-[#8F7130] bg-white px-4 py-2.5 text-xs font-bold text-[#8F7130] hover:bg-white/90"
                    >
                      {copied === "reference" ? "✓ Copied" : "📋 Copy"}
                    </button>
                  </div>
                </div>

                {selectedPlan && (
                  <div className="mb-6 rounded-2xl bg-[#F7F8F9] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.16em] text-[#89939A]">
                          Amount to Pay
                        </div>
                        <div className="mt-1 text-3xl font-black text-[#8F7130]">
                          R{selectedPlan.price}
                        </div>
                        <div className="mt-1 text-xs text-[#66737C] capitalize">
                          {selectedPlan.name}
                        </div>
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    { label: "Bank", value: BANK_DETAILS.bankName, key: "bank" },
                    {
                      label: "Account Holder",
                      value: BANK_DETAILS.accountHolder,
                      key: "holder",
                    },
                    {
                      label: "Account Number",
                      value: BANK_DETAILS.accountNumber,
                      key: "account",
                    },
                    {
                      label: "Branch Code",
                      value: BANK_DETAILS.branchCode,
                      key: "branch",
                    },
                    {
                      label: "Account Type",
                      value: BANK_DETAILS.accountType,
                      key: "type",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E1E5E8] bg-white px-4 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                          {item.label}
                        </div>
                        <div className="mt-0.5 break-all text-sm font-black text-[#34414A]">
                          {item.value}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.value, item.key)}
                        className="flex-shrink-0 rounded-lg border border-[#D5DBDF] bg-[#F7F8F9] px-3 py-2 text-xs font-bold text-[#34414A] hover:bg-[#EEF1F3]"
                      >
                        {copied === item.key ? "✓" : "📋"}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border-2 border-red-300 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <div className="text-sm font-black text-red-700">
                        Final Warning — Permanent Ban Policy
                      </div>
                      <ul className="mt-2 space-y-1.5 text-xs leading-5 text-red-700/90">
                        <li>
                          • <strong>Do NOT edit, fake, or forge</strong> the
                          payment receipt.
                        </li>
                        <li>
                          • Every receipt is <strong>manually verified</strong>{" "}
                          against our FNB business bank statement.
                        </li>
                        <li>
                          • If fraud is detected, your account will be{" "}
                          <strong>permanently banned</strong> — your{" "}
                          <strong>email and cellphone number will never be
                          allowed to sign up again</strong>.
                        </li>
                        <li>
                          • You will lose access to all your listings with no
                          refund and no appeal.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSendProof}
                    className="w-full rounded-2xl bg-[#25D366] px-6 py-5 text-base font-black text-white shadow-lg transition hover:bg-[#20BD5A]"
                  >
                    💬 Send Payment Proof on WhatsApp
                  </button>
                  <p className="mt-3 text-center text-xs text-[#66737C]">
                    After payment, tap the button above — WhatsApp will open
                    with your details pre-filled. Attach your receipt and send.
                  </p>
                </div>

                {isPending && (
                  <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-5 text-center">
                    <div className="text-3xl">⏳</div>
                    <div className="mt-2 text-lg font-black text-yellow-800">
                      Awaiting Admin Approval
                    </div>
                    <p className="mt-2 text-xs text-yellow-800/80">
                      Our team reviews payments within 1 hour during business
                      hours. You&apos;ll be notified once your subscription is
                      activated.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="mt-12 rounded-3xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6 sm:p-10">
            <h3 className="text-xl font-black text-[#8F7130] text-center">
              How It Works
            </h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-white/70 p-5">
                <div className="text-2xl">1️⃣</div>
                <div className="mt-3 font-bold text-[#34414A]">
                  Choose a Plan
                </div>
                <p className="mt-2 text-xs leading-5 text-[#66737C]">
                  Pick weekly, monthly or yearly.
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-5">
                <div className="text-2xl">2️⃣</div>
                <div className="mt-3 font-bold text-[#34414A]">
                  Pay via FNB
                </div>
                <p className="mt-2 text-xs leading-5 text-[#66737C]">
                  Use your profile name as the payment reference.
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-5">
                <div className="text-2xl">3️⃣</div>
                <div className="mt-3 font-bold text-[#34414A]">
                  Send Proof on WhatsApp
                </div>
                <p className="mt-2 text-xs leading-5 text-[#66737C]">
                  Admin verifies and activates your subscription within 1 hour.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}