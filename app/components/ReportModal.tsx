"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
};

export default function ReportModal({ isOpen, onClose, listingId, listingTitle }: Props) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setMessage("Please select a reason.");
      return;
    }
    setSubmitting(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("reports").insert([
      {
        listing_id: listingId,
        reporter_id: user?.id || null,
        reason,
        details: details || null,
      },
    ]);

    if (error) {
      setMessage("Error: " + error.message);
      setSubmitting(false);
    } else {
      setDone(true);
      setSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setReason("");
    setDetails("");
    setMessage("");
    setDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {done ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#34414A]">Report Submitted</h2>
            <p className="mt-3 text-sm leading-6 text-[#66737C]">
              Thank you. Our team will review this listing shortly.
            </p>
            <button
              onClick={closeAndReset}
              className="mt-8 w-full rounded-xl bg-[#34414A] px-6 py-3.5 font-bold text-white hover:bg-[#4A5962]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#34414A]">Report Listing</h2>
                <p className="mt-1 text-xs text-[#89939A]">{listingTitle}</p>
              </div>
              <button
                onClick={closeAndReset}
                className="text-2xl leading-none text-[#89939A] hover:text-[#34414A]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#34414A]">
                  Why are you reporting this? *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                >
                  <option value="" disabled>Select a reason</option>
                  <option value="Suspected scam or fraud">Suspected scam or fraud</option>
                  <option value="Fake or misleading listing">Fake or misleading listing</option>
                  <option value="Stolen vehicle">Stolen vehicle</option>
                  <option value="Wrong category">Wrong category</option>
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Offensive content">Offensive content</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#34414A]">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="Tell us more about the issue..."
                  className="w-full resize-y rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm leading-6 outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
                />
              </div>

              {message && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>

              <p className="text-center text-xs text-[#89939A]">
                Your report is anonymous. The seller will not be notified.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}