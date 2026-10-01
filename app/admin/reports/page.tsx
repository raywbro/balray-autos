"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"new" | "resolved" | "all">("new");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
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

      await fetchReports();
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [router, supabase]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    // For each report, fetch the listing details
    const enrichedReports = await Promise.all(
      (data || []).map(async (report) => {
        const { data: listing } = await supabase
          .from("listings")
          .select("id, make, model, year, price, images, seller_name, status")
          .eq("id", report.listing_id)
          .single();
        return { ...report, listing };
      })
    );

    setReports(enrichedReports);
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    if (error) {
      alert("Error updating report: " + error.message);
    } else {
      setReports(reports.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)));
      setMessage(`Report marked as ${newStatus}.`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteListingFromReport = async (report: any) => {
    if (!report.listing) {
      alert("The listing this report refers to no longer exists.");
      return;
    }

    const confirmed = confirm(
      `Delete the listing "${report.listing.year} ${report.listing.make} ${report.listing.model}" permanently?`
    );
    if (!confirmed) return;

    // Delete listing images from storage first
    if (report.listing.images && report.listing.images.length > 0) {
      const fileNames = report.listing.images
        .map((url: string) => {
          const parts = url.split("/car-images/");
          return parts.length > 1 ? parts[1] : null;
        })
        .filter(Boolean) as string[];

      if (fileNames.length > 0) {
        await supabase.storage.from("car-images").remove(fileNames);
      }
    }

    const { error } = await supabase.from("listings").delete().eq("id", report.listing.id);

    if (error) {
      alert("Error deleting listing: " + error.message);
    } else {
      // Mark the report as resolved
      await supabase.from("reports").update({ status: "resolved" }).eq("id", report.id);
      setReports(reports.map((r) => (r.id === report.id ? { ...r, status: "resolved" } : r)));
      setMessage("Listing deleted and report marked as resolved.");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const newCount = reports.filter((r) => r.status === "new").length;

  const reasonLabel = (reason: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      "Suspected scam or fraud": { label: "🚨 Scam / Fraud", color: "bg-red-100 text-red-700" },
      "Fake or misleading listing": { label: "🎭 Fake / Misleading", color: "bg-orange-100 text-orange-700" },
      "Stolen vehicle": { label: "🚗 Stolen Vehicle", color: "bg-red-200 text-red-800" },
      "Wrong category": { label: "📁 Wrong Category", color: "bg-blue-100 text-blue-700" },
      "Duplicate listing": { label: "📋 Duplicate", color: "bg-yellow-100 text-yellow-700" },
      "Offensive content": { label: "⚠️ Offensive", color: "bg-purple-100 text-purple-700" },
      "Other": { label: "❓ Other", color: "bg-gray-100 text-gray-700" },
    };
    return labels[reason] || { label: reason, color: "bg-gray-100 text-gray-700" };
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading reports...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-600">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Reported Listings
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#34414A]">
              Reports Center
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              Review reports submitted by users and take action.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
          >
            ← Back to Admin Panel
          </Link>
        </div>

        {/* FILTER TABS */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("new")}
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              filter === "new"
                ? "border-red-500 bg-red-500 text-white"
                : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-red-500 hover:text-red-600"
            }`}
          >
            🚨 New {newCount > 0 && `(${newCount})`}
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              filter === "resolved"
                ? "border-green-500 bg-green-500 text-white"
                : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-green-500 hover:text-green-600"
            }`}
          >
            ✓ Resolved
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              filter === "all"
                ? "border-[#34414A] bg-[#34414A] text-white"
                : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#34414A]"
            }`}
          >
            All Reports
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-4 text-center text-sm font-bold text-[#8F7130]">
            {message}
          </div>
        )}

        {filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-12 text-center">
            <div className="text-5xl">{filter === "new" ? "🎉" : "📭"}</div>
            <h2 className="mt-6 text-2xl font-black text-[#34414A]">
              {filter === "new" ? "No new reports" : "No reports found"}
            </h2>
            <p className="mt-3 text-sm text-[#66737C]">
              {filter === "new"
                ? "Your marketplace is clean. Great job!"
                : "Nothing to show here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const reason = reasonLabel(report.reason);
              const isResolved = report.status === "resolved";

              return (
                <div
                  key={report.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    isResolved ? "border-[#D5DBDF] opacity-70" : "border-red-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    {/* REPORT INFO */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${reason.color}`}>
                          {reason.label}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isResolved
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700 animate-pulse"
                          }`}
                        >
                          {isResolved ? "✓ Resolved" : "• New"}
                        </span>
                        <span className="text-xs text-[#89939A]">
                          {new Date(report.created_at).toLocaleDateString("en-ZA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {report.details && (
                        <div className="mb-3 rounded-xl bg-[#F7F8F9] p-3 text-sm text-[#4A5962]">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A] mb-1">
                            Details from reporter
                          </div>
                          {report.details}
                        </div>
                      )}

                      {/* REPORTED LISTING */}
                      {report.listing ? (
                        <div className="flex items-center gap-3 rounded-xl border border-[#E1E5E8] p-3">
                          <img
                            src={report.listing.images?.[0] || "/placeholder.png"}
                            alt="listing"
                            className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                              Reported Listing
                            </div>
                            <div className="truncate text-sm font-black text-[#34414A]">
                              {report.listing.year} {report.listing.make} {report.listing.model}
                            </div>
                            <div className="text-xs text-[#66737C]">
                              R{Number(report.listing.price).toLocaleString()} • Seller: {report.listing.seller_name}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[#E1E5E8] bg-[#F7F8F9] p-3 text-sm text-[#89939A]">
                          ⚠️ The reported listing has already been deleted.
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch lg:w-44">
                      {report.listing && (
                        <Link
                          href={`/listing/${report.listing.id}`}
                          className="rounded-xl border border-[#B08D3C] bg-white px-5 py-2.5 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                        >
                          View Listing
                        </Link>
                      )}

                      {!isResolved && (
                        <>
                          <button
                            onClick={() => handleDeleteListingFromReport(report)}
                            className="rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
                          >
                            Delete Listing
                          </button>
                          <button
                            onClick={() => handleStatusChange(report.id, "resolved")}
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}

                      {isResolved && (
                        <button
                          onClick={() => handleStatusChange(report.id, "new")}
                          className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-2.5 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
                        >
                          Re-open
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}