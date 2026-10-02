"use client";

import Link from "next/link";

type Props = {
  compareList: string[];
  onClear: () => void;
};

export default function CompareBar({ compareList, onClear }: Props) {
  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2 rounded-2xl border-2 border-[#B08D3C] bg-white p-4 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg text-white">
            ⚖️
          </div>
          <div>
            <div className="text-sm font-black text-[#34414A]">
              {compareList.length} vehicle{compareList.length === 1 ? "" : "s"} to compare
            </div>
            <div className="text-xs text-[#66737C]">Compare up to 4 side-by-side</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-[#D5DBDF] bg-white px-4 py-2.5 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105"
          >
            Compare Now →
          </Link>
        </div>
      </div>
    </div>
  );
}