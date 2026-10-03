"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CleanupPage() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [expiredCount, setExpiredCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      // Count listings expired 60+ days ago
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 60);

      const { count } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .lt("expires_at", cutoff.toISOString())
        .not("expires_at", "is", null);

      setExpiredCount(count || 0);
      setLoading(false);
    };

    checkAndFetch();
  }, [router, supabase]);

  const handleCleanup = async () => {
    if (expiredCount === 0) {
      setMessage("Nothing to clean up — no listings have been expired for 60+ days.");
      return;
    }

    const confirmed = confirm(
      `Delete ${expiredCount} listing${expiredCount === 1 ? "" : "s"} that expired 60+ days ago? This cannot be undone.`
    );
    if (!confirmed) return;

    setRunning(true);
    setMessage("");

    const { error } = await supabase.rpc("delete_old_expired_listings");

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage(
        `✓ Cleanup complete. Deleted ${expiredCount} old expired listing${expiredCount === 1 ? "" : "s"}.`
      );
      setExpiredCount(0);
    }
    setRunning(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading cleanup tool...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Admin Tool
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#34414A]">
              Cleanup Old Listings
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              Permanently delete listings that expired 60+ days ago. Keeps your marketplace clean.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
          >
            ← Admin Panel
          </Link>
        </div>

        <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                Listings Expired 60+ Days
              </div>
              <div className="mt-2 text-4xl font-black text-[#34414A]">
                {expiredCount}
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF7EC] text-3xl">
              🧹
            </div>
          </div>

          <div className="rounded-xl bg-[#F7F8F9] p-4 text-xs text-[#66737C]">
            These listings have been expired for 60+ days. Deleting them will remove their data permanently. Any images stored with them will need to be cleaned separately from Supabase storage.
          </div>

          <button
            onClick={handleCleanup}
            disabled={running || expiredCount === 0}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running
              ? "Deleting..."
              : expiredCount === 0
              ? "Nothing to Delete"
              : `Delete ${expiredCount} Old Listings`}
          </button>

          {message && (
            <div
              className={`mt-4 rounded-xl border p-4 text-center text-sm font-bold ${
                message.includes("✓")
                  ? "border-green-200 bg-green-50 text-green-600"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7B37]">
            💡 Recommended Schedule
          </div>
          <p className="mt-2 text-sm text-[#8F7130]">
            Run this cleanup once a month to keep your marketplace fresh without losing listings that sellers might want to renew.
          </p>
        </div>
      </section>
    </main>
  );
}