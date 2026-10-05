"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data);

      const { data: relatedData } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(3);

      setRelated(relatedData || []);
      setLoading(false);
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading article...
        </div>
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="max-w-md rounded-2xl border border-[#D5DBDF] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">📰</div>
          <h1 className="mt-4 text-2xl font-black text-[#34414A]">
            Article not found
          </h1>
          <p className="mt-3 text-sm text-[#66737C]">
            This article doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-sm font-bold text-white"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  const publishedDate = new Date(post.published_at).toLocaleDateString(
    "en-ZA",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="relative h-[40vh] min-h-[280px] w-full overflow-hidden bg-[#34414A] sm:h-[50vh]">
        <img
          src={post.cover_image}
          alt={post.title}
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#34414A] via-[#34414A]/40 to-transparent" />
      </section>

      <article className="relative mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-24 rounded-3xl border border-[#D5DBDF] bg-white p-6 shadow-lg sm:-mt-32 sm:p-10">
          <Link
            href="/blog"
            className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A7B37] hover:underline"
          >
            ← Back to Blog
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#FBF7EC] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#8F7130]">
              {post.category}
            </span>
            <span className="text-xs font-bold text-[#89939A]">
              {post.read_time} min read
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#34414A] sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg leading-8 text-[#66737C]">
            {post.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-4 border-y border-[#E1E5E8] py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg font-black text-white">
              {post.author_name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-black text-[#34414A]">
                {post.author_name}
              </div>
              <div className="text-xs text-[#89939A]">
                {post.author_role} • {publishedDate}
              </div>
            </div>
          </div>

          <div className="mt-8">
            {post.content.split("\n\n").map((paragraph: string, i: number) => (
              <p
                key={i}
                className="mb-5 text-base leading-8 text-[#4A5962] sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-xl text-white">
                ✓
              </div>
              <div>
                <div className="text-sm font-black text-[#34414A]">
                  Expert-Verified Content
                </div>
                <p className="mt-1 text-xs leading-5 text-[#8F7130]">
                  This article was written by {post.author_name},{" "}
                  {post.author_role}, and reviewed by the Balray Autos editorial
                  team. We independently verify all automotive and financial
                  advice before publishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
              Keep Reading
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#34414A]">
              Related Articles
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C] hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9EDF0]">
                  <img
                    src={r.cover_image}
                    alt={r.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 text-xs font-black uppercase tracking-wider text-[#8F7130]">
                    {r.category}
                  </div>
                  <h3 className="text-lg font-black leading-tight text-[#34414A] transition group-hover:text-[#8F7130]">
                    {r.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[#66737C]">
                    {r.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="w-full bg-gradient-to-r from-[#34414A] via-[#2A343C] to-[#1F262C]">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Ready to list your vehicle?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            Join thousands of South African buyers and sellers on Balray Autos.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sell"
              className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-8 py-4 font-bold text-white shadow-md"
            >
              Sell Your Vehicle
            </Link>
            <Link
              href="/marketplace"
              className="rounded-xl border border-white/30 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur hover:bg-white/10"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}