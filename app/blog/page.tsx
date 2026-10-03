"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";



export default function BlogListPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image, views, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [supabase]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[20px] border-[#C5CDD2]/50" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Balray Autos Blog
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl lg:text-6xl">
              News, Tips &
              <br />
              <span className="bg-gradient-to-r from-[#8F7130] via-[#D2B66A] to-[#A47F32] bg-clip-text text-transparent">
                Automotive Advice
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#66737C] sm:text-lg">
              Expert advice on buying, selling, and owning vehicles in South
              Africa.
            </p>
          </div>
        </div>
      </section>

      {/* POSTS GRID */}
      <section className="w-full bg-[#F7F8F9] py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl border border-[#D5DBDF] bg-white"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-3xl border border-[#D5DBDF] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">📝</div>
              <h2 className="mt-6 text-2xl font-black text-[#34414A]">
                No blog posts yet
              </h2>
              <p className="mt-3 text-sm text-[#66737C]">
                Check back soon — we&apos;re writing great content for you.
              </p>
              <Link
                href="/marketplace"
                className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md hover:brightness-105"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C]/60 hover:shadow-[0_20px_50px_rgba(52,65,74,0.12)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#34414A] to-[#4A5962]">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-6xl text-white/80">
                        📰
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-[#89939A]">
                      {new Date(post.created_at).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      • 👁️ {post.views || 0}
                    </div>
                    <h2 className="mt-2 line-clamp-2 text-xl font-black leading-7 text-[#34414A] group-hover:text-[#9A7B37]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#66737C]">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#9A7B37]">
                      Read More
                      <span className="transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-gradient-to-r from-[#E6EAED] via-[#F7F8F9] to-[#DCE2E6]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-16">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Ready to Buy or Sell?
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#34414A] sm:text-4xl">
              Explore the Balray Autos marketplace.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#68757D]">
              Browse thousands of vehicles or list yours for free.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/marketplace"
              className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-7 py-4 text-center font-bold text-white shadow-md hover:brightness-105"
            >
              Browse Vehicles
            </Link>
            <Link
              href="/sell"
              className="rounded-xl bg-[#34414A] px-7 py-4 text-center font-bold text-white shadow-md hover:bg-[#4A5962]"
            >
              List Your Vehicle
            </Link>
          </div>
        </div>
      </section>

      
    </main>
  );
}