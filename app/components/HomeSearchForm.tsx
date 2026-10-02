"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchForm() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <section className="w-full bg-[#34414A]">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D2B66A]">
          Marketplace Search
        </div>

        <form
          onSubmit={handleSearch}
          className="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_240px_170px]"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles, makes, models..."
            aria-label="Search vehicles"
            className="min-w-0 w-full rounded-xl border border-white/10 bg-[#FAFBFC] px-4 py-4 text-sm text-[#34414A] outline-none placeholder:text-[#879198] focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select category"
            className="min-w-0 w-full rounded-xl border border-white/10 bg-[#FAFBFC] px-4 py-4 text-sm font-medium text-[#34414A] outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
          >
            <option value="">All Categories</option>
            <option value="Cars & SUVs">Cars & SUVs</option>
            <option value="Bakkies & 4x4s">Bakkies & 4x4s</option>
            <option value="Motorcycles">Motorcycles</option>
            <option value="Trucks & Commercial">Trucks & Commercial</option>
            <option value="Machinery & Equipment">Machinery & Equipment</option>
            <option value="Parts & Accessories">Parts & Accessories</option>
          </select>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-center text-sm font-bold text-white transition hover:brightness-105"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}