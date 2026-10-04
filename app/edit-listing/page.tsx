"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EditListingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">✏️</div>
          <h1 className="mt-4 text-2xl font-black text-[#34414A]">
            Edit Listing
          </h1>
          <p className="mt-3 text-sm text-[#66737C]">
            To edit a listing, please open it from your listings page and use
            the edit option there.
          </p>
          <Link
            href="/my-listings"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-sm font-bold text-white"
          >
            Go to My Listings
          </Link>
        </div>
      </section>
    </main>
  );
}