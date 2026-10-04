"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [fraudModal, setFraudModal] = useState<any>(null);
  const [fraudReason, setFraudReason] = useState("");
  const [fraudConfirmed, setFraudConfirmed] = useState(false);
  const [accessError, setAccessError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setAccessError(
            "Could not load your profile. Please run the SQL migration and set your role to 'admin'."
          );
          setLoading(false);
          return;
        }

        if (!profile || profile.role !== "admin") {
          setAccessError(
            "You are not an admin. Run this in Supabase: UPDATE profiles SET role='admin' WHERE id=(SELECT id FROM auth.users WHERE email='YOUR_EMAIL');"
          );
          setLoading(false);
          return;
        }

        try {
          await supabase.rpc("reset_expired_subscriptions");
        } catch (err) {
          console.warn("Reset subscriptions RPC failed (may not exist yet):", err);
        }

        await fetchUsers();
      } catch (err: any) {
        console.error("Load failed:", err);
        setAccessError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    const { data: pending, error: pendingErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("subscription_pending", true)
      .order("subscription_requested_at", { ascending: false });

    if (pendingErr) console.error("Pending fetch error:", pendingErr);

    const now = new Date().toISOString();
    const { data: active, error: activeErr } = await supabase
      .from("profiles")
      .select("*")
      .neq("subscription_tier", "none")
      .gt("subscription_expires_at", now)
      .order("subscription_expires_at", { ascending: false });

    if (activeErr) console.error("Active fetch error:", activeErr);

    setPendingUsers(pending || []);
    setActiveUsers(active || []);
  };

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const getPlanDays = (tier: string) => {
    if (tier === "weekly") return 7;
    if (tier === "monthly") return 30;
    if (tier === "yearly") return 365;
    return 30;
  };

  const handleApprove = async (user: any) => {
    const days = getPlanDays(user.subscription_tier);
    const confirmed = confirm(
      `Approve ${user.subscription_tier} subscription for ${
        user.full_name || user.email
      }?\n\nThis will activate for ${days} days.`
    );
    if (!confirmed) return;

    setProcessingId(user.id);

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_pending: false,
        subscription_started_at: startDate.toISOString(),
        subscription_expires_at: expiryDate.toISOString(),
        subscription_notes: notes[user.id] || `Approved by admin`,
      })
      .eq("id", user.id);

    if (error) {
      showMessage("Error approving: " + error.message, "error");
    } else {
      showMessage(
        `✓ Subscription approved for ${days} days (until ${expiryDate.toLocaleDateString(
          "en-ZA"
        )})`
      );
      await fetchUsers();
    }
    setProcessingId(null);
  };

  const handleReject = async (userId: string) => {
    const confirmed = confirm(
      "Reject this subscription request? The user will be notified."
    );
    if (!confirmed) return;

    setProcessingId(userId);

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_pending: false,
        subscription_tier: "none",
        subscription_amount: null,
        subscription_notes: notes[userId] || "Payment not received",
      })
      .eq("id", userId);

    if (error) {
      showMessage("Error rejecting: " + error.message, "error");
    } else {
      showMessage("Subscription request rejected.");
      await fetchUsers();
    }
    setProcessingId(null);
  };

  const handleFraudBan = async () => {
    if (!fraudModal) return;
    if (!fraudReason.trim()) {
      alert("Please enter a reason for the ban.");
      return;
    }
    if (!fraudConfirmed) {
      alert("Please tick the confirmation checkbox.");
      return;
    }

    setProcessingId(fraudModal.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: `FRAUD: ${fraudReason}`,
        subscription_pending: false,
        subscription_tier: "none",
        subscription_amount: null,
        subscription_notes: `BANNED for fraud: ${fraudReason}`,
      })
      .eq("id", fraudModal.id);

    if (error) {
      showMessage("Error banning user: " + error.message, "error");
    } else {
      showMessage(
        `🚫 User ${fraudModal.full_name || fraudModal.email} has been BANNED.`
      );
      setFraudModal(null);
      setFraudReason("");
      setFraudConfirmed(false);
      await fetchUsers();
    }
    setProcessingId(null);
  };

  const handleCancelActive = async (userId: string) => {
    const confirmed = confirm(
      "Cancel this user's active subscription immediately?"
    );
    if (!confirmed) return;

    setProcessingId(userId);

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_tier: "none",
        subscription_expires_at: null,
        subscription_pending: false,
      })
      .eq("id", userId);

    if (error) {
      showMessage("Error cancelling: " + error.message, "error");
    } else {
      showMessage("Subscription cancelled.");
      await fetchUsers();
    }
    setProcessingId(null);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading subscriptions...
        </div>
      </main>
    );
  }

  if (accessError) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="max-w-lg rounded-2xl border-2 border-red-300 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">⚠️</div>
          <h1 className="mt-4 text-2xl font-black text-red-700">
            Admin Access Required
          </h1>
          <p className="mt-3 text-sm text-[#66737C]">{accessError}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-xl bg-[#34414A] px-6 py-3 text-sm font-bold text-white"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-[#D5DBDF] bg-white px-6 py-3 text-sm font-bold text-[#34414A]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Admin · Subscriptions
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#34414A]">
              Seller Subscriptions
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              Verify payments in your FNB app. Ban fraudsters permanently.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
          >
            ← Admin Panel
          </Link>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl border p-4 text-center text-sm font-bold ${
              messageType === "success"
                ? "border-[#D3B86A]/50 bg-[#FBF7EC] text-[#8F7130]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-lg">
              ⏳
            </div>
            <div>
              <h2 className="text-xl font-black text-[#34414A]">
                Pending Requests ({pendingUsers.length})
              </h2>
              <p className="text-xs text-[#66737C]">
                Verify payment in your FNB app before approving.
              </p>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-8 text-center text-sm text-[#66737C]">
              No pending subscription requests.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="overflow-hidden rounded-2xl border-2 border-yellow-300 bg-white shadow-sm"
                >
                  <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-xl font-black text-white shadow-md">
                        {user.full_name
                          ? user.full_name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-black text-[#34414A]">
                          {user.full_name || "Unnamed User"}
                        </h3>
                        <div className="mt-1 text-xs text-[#66737C]">
                          📱 {user.phone || "No phone"}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#FBF7EC] px-3 py-1 text-xs font-black uppercase text-[#8F7130]">
                            {user.subscription_tier} plan
                          </span>
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                            R{Number(user.subscription_amount || 0).toFixed(0)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-[#89939A]">
                          ⏰ Requested:{" "}
                          {formatDate(user.subscription_requested_at)}
                        </div>
                        <div className="mt-1 text-xs font-bold text-[#8F7130]">
                          📎 Check WhatsApp for receipt from{" "}
                          {user.full_name || user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-72">
                      <input
                        type="text"
                        placeholder="Note (FNB ref, amount, etc.)"
                        value={notes[user.id] || ""}
                        onChange={(e) =>
                          setNotes({ ...notes, [user.id]: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#D5DBDF] px-4 py-2.5 text-xs outline-none focus:border-[#B08D3C]"
                      />
                      <button
                        onClick={() => handleApprove(user)}
                        disabled={processingId === user.id}
                        className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {processingId === user.id ? "..." : "✓ Approve Payment"}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={processingId === user.id}
                          className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-4 py-2.5 text-xs font-bold text-[#34414A] hover:bg-[#F7F8F9] disabled:opacity-60"
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => {
                            setFraudModal(user);
                            setFraudReason("");
                            setFraudConfirmed(false);
                          }}
                          disabled={processingId === user.id}
                          className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          🚫 Ban Fraud
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-lg">
              🚀
            </div>
            <div>
              <h2 className="text-xl font-black text-[#34414A]">
                Active Subscriptions ({activeUsers.length})
              </h2>
              <p className="text-xs text-[#66737C]">
                Currently boosted sellers.
              </p>
            </div>
          </div>

          {activeUsers.length === 0 ? (
            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-8 text-center text-sm text-[#66737C]">
              No active subscriptions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activeUsers.map((user) => {
                const daysLeft = Math.max(
                  0,
                  Math.ceil(
                    (new Date(user.subscription_expires_at).getTime() -
                      Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                );
                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 rounded-2xl border border-green-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg font-black text-white">
                        {user.full_name
                          ? user.full_name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-[#34414A]">
                          {user.full_name || "Unnamed User"}
                        </h3>
                        <div className="text-xs text-[#66737C]">
                          📱 {user.phone || "No phone"}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#FBF7EC] px-2 py-0.5 text-xs font-black uppercase text-[#8F7130]">
                            {user.subscription_tier}
                          </span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                            {daysLeft} days left
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-[#89939A]">
                          Expires: {formatDate(user.subscription_expires_at)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelActive(user.id)}
                      disabled={processingId === user.id}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {fraudModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-red-600 p-6 text-white">
              <div className="text-4xl">🚫</div>
              <h2 className="mt-3 text-2xl font-black">
                Permanently Ban User for Fraud
              </h2>
              <p className="mt-1 text-sm text-white/90">
                This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">
                  User
                </div>
                <div className="mt-1 text-sm font-black text-[#34414A]">
                  {fraudModal.full_name || fraudModal.email}
                </div>
                <div className="mt-1 text-xs text-[#66737C]">
                  📱 {fraudModal.phone || "No phone"}
                </div>
                <div className="mt-1 text-xs text-[#66737C]">
                  📧 {fraudModal.email}
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-[#34414A]">
                  Reason for ban *
                </label>
                <textarea
                  value={fraudReason}
                  onChange={(e) => setFraudReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Edited payment receipt, fake POP..."
                  className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm leading-6 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="text-sm font-black text-red-700">
                      This will permanently:
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs leading-5 text-red-700/90">
                      <li>• <strong>Ban the user</strong> — they cannot log in anymore</li>
                      <li>• <strong>Block their email</strong> from ever signing up again</li>
                      <li>• <strong>Block their phone</strong> from ever signing up again</li>
                      <li>• <strong>Cancel any active subscription</strong> without refund</li>
                    </ul>
                  </div>
                </div>
              </div>

              <label
                className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                  fraudConfirmed
                    ? "border-red-500 bg-red-50"
                    : "border-[#D5DBDF] bg-white hover:border-red-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={fraudConfirmed}
                  onChange={(e) => setFraudConfirmed(e.target.checked)}
                  className="mt-0.5 h-5 w-5 flex-shrink-0 accent-red-600"
                />
                <span className="text-sm font-bold leading-6 text-[#34414A]">
                  I confirm this user committed fraud. I understand this is a{" "}
                  <span className="text-red-600">permanent ban</span>.
                </span>
              </label>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setFraudModal(null);
                    setFraudReason("");
                    setFraudConfirmed(false);
                  }}
                  className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFraudBan}
                  disabled={
                    processingId === fraudModal.id ||
                    !fraudConfirmed ||
                    !fraudReason.trim()
                  }
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === fraudModal.id
                    ? "Banning..."
                    : "🚫 Ban Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}