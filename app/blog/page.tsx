"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  author_role: string;
  cover_image: string;
  read_time: number;
  published_at: string;
};

const CATEGORIES = [
  "All",
  "News",
  "Buying Tips",
  "Selling Tips",
  "Advice",
  "Finance",
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Blog fetch error:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = posts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const text = search.toLowerCase().trim();
    const matchesSearch =
      !text ||
      post.title.toLowerCase().includes(text) ||
      post.excerpt.toLowerCase().includes(text) ||
      post.author_name.toLowerCase().includes(text);
    return matchesCategory && matchesSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#34414A] via-[#2A343C] to-[#1F262C]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D2B66A]/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full border-[20px] border-[#D2B66A]/5" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#D2B66A] backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Balray Autos Blog
            </div>
            <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black leading-tight tracking-tight text-white">
              Automotive News,{" "}
              <span className="bg-gradient-to-r from-[#D2B66A] via-[#F4E0A1] to-[#B08D3C] bg-clip-text text-transparent">
                Tips & Advice
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Expert advice on buying, selling, and owning vehicles in South
              Africa. Written by industry professionals, trusted by thousands of
              drivers.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E1E5E8] bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                    activeCategory === cat
                      ? "border-[#B08D3C] bg-[#B08D3C] text-white"
                      : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#B08D3C] hover:text-[#9A7B37]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-xl border border-[#D5DBDF] bg-[#FAFBFC] px-5 py-3 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20 lg:w-80"
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F7F8F9] py-12 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-[#D5DBDF] bg-white p-5"
                >
                  <div className="aspect-[16/10] rounded-xl bg-[#E9EDF0]" />
                  <div className="mt-4 h-4 w-1/3 rounded bg-[#E9EDF0]" />
                  <div className="mt-3 h-6 rounded bg-[#E9EDF0]" />
                  <div className="mt-2 h-4 rounded bg-[#E9EDF0]" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#D5DBDF] bg-white p-12 text-center">
              <div className="text-5xl">📝</div>
              <h2 className="mt-4 text-2xl font-black">
                No articles match your filter
              </h2>
              <p className="mt-2 text-sm text-[#66737C]">
                Try a different category or search term.
              </p>
            </div>
          ) : (
            <>
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group mb-12 grid overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C] hover:shadow-lg lg:grid-cols-2"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#E9EDF0] lg:aspect-auto">
                    <img
                      src={featured.cover_image}
                      alt={featured.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-5 top-5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md">
                      ⭐ Featured
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#FBF7EC] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#8F7130]">
                        {featured.category}
                      </span>
                      <span className="text-xs font-bold text-[#89939A]">
                        {featured.read_time} min read
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-black leading-tight text-[#34414A] transition group-hover:text-[#8F7130] sm:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[#66737C] sm:text-base">
                      {featured.excerpt}
                    </p>
                    <div className="mt-6 flex items-center gap-3 border-t border-[#E1E5E8] pt-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-sm font-black text-white">
                        {featured.author_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#34414A]">
                          {featured.author_name}
                        </div>
                        <div className="text-xs text-[#89939A]">
                          {featured.author_role}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C] hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#8F7130] backdrop-blur">
                        {post.category}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 text-xs font-bold text-[#89939A]">
                        {post.read_time} min read
                      </div>
                      <h3 className="text-lg font-black leading-tight text-[#34414A] transition group-hover:text-[#8F7130]">
                        {post.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[#66737C]">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-2 border-t border-[#E1E5E8] pt-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-xs font-black text-white">
                          {post.author_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-black text-[#34414A]">
                            {post.author_name}
                          </div>
                          <div className="truncate text-[10px] text-[#89939A]">
                            {post.author_role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-16">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Ready to Sell?
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              List your vehicle in front of thousands of buyers.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">
              Free for your first 3 listings. Reach buyers across all 9 South
              African provinces.
            </p>
          </div>
          <Link
            href="/sell"
            className="w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-7 py-4 text-center font-bold text-white shadow-md sm:w-auto"
          >
            Sell Your Vehicle
          </Link>
        </div>
      </section>
    </main>
  );
}