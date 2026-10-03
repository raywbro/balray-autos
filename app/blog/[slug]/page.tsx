"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";



export default function BlogPostPage() {
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const params = useParams();
  const supabase = createClient();
  const slug = params.slug as string;

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error || !data) {
        console.error("Error fetching post:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data);
      setLoading(false);

      try {
        await supabase.rpc("increment_post_view", { post_id: data.id });
      } catch (err) {
        console.error("Error incrementing views:", err);
      }

      const { data: relatedData } = await supabase
        .from("blog_posts")
        .select("id, title, slug, cover_image, excerpt, created_at, views")
        .eq("published", true)
        .neq("id", data.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setRelatedPosts(relatedData || []);
    };

    if (slug) fetchPost();
  }, [slug, supabase]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: post?.title,
      text: post?.excerpt || post?.title,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

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
      <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
        
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="text-5xl">📰</div>
          <h1 className="mt-6 text-3xl font-black text-[#34414A]">
            Article Not Found
          </h1>
          <p className="mt-3 text-[#66737C]">
            This article may have been removed or the link is broken.
          </p>
          <Link
            href="/blog"
            className="mt-8 inline-block rounded-xl bg-[#34414A] px-6 py-4 font-bold text-white"
          >
            Back to Blog
          </Link>
        </div>
        
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      

      {/* BREADCRUMB */}
      <div className="bg-white border-b border-[#E1E5E8]">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm font-bold text-[#9A7B37] hover:underline"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[24px] border-[#D9DEE2]/70" />
        <div className="relative mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Balray Autos Blog
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-[#34414A] sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-[#66737C]">
              <span>
                📅{" "}
                {new Date(post.created_at).toLocaleDateString("en-ZA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>👁️ {post.views || 0} views</span>
              <span>⏱️ ~{Math.ceil((post.content?.split(" ").length || 0) / 200)} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="w-full bg-[#F7F8F9] py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">

          {post.cover_image && (
            <div className="mb-10 overflow-hidden rounded-3xl border border-[#D5DBDF] bg-white shadow-sm">
              <img
                src={post.cover_image}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          <article className="rounded-3xl border border-[#D5DBDF] bg-white p-6 shadow-sm sm:p-10">
            {post.excerpt && (
              <div className="mb-8 border-l-4 border-[#B08D3C] bg-[#FBF7EC] p-5 italic">
                <p className="text-base leading-7 text-[#8F7130]">
                  {post.excerpt}
                </p>
              </div>
            )}

            <div className="prose-content">
              {post.content.split(/\n\n+/).map((paragraph: string, idx: number) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                const isHeader =
                  trimmed.length < 80 &&
                  trimmed === trimmed.toUpperCase() &&
                  /[A-Z]/.test(trimmed) &&
                  !trimmed.match(/^[0-9]/);

                if (isHeader) {
                  return (
                    <h2
                      key={idx}
                      className="mt-10 mb-4 text-2xl font-black leading-tight text-[#34414A]"
                    >
                      {trimmed}
                    </h2>
                  );
                }

                if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                  const items = trimmed
                    .split("\n")
                    .map((line) => line.replace(/^[-•]\s+/, "").trim())
                    .filter(Boolean);

                  return (
                    <ul key={idx} className="my-5 space-y-2 pl-6">
                      {items.map((item, i) => (
                        <li
                          key={i}
                          className="list-disc text-base leading-7 text-[#4A5962]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p
                    key={idx}
                    className="mb-5 text-base leading-8 text-[#4A5962]"
                  >
                    {trimmed}
                  </p>
                );
              })}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#E1E5E8] pt-8">
              <div className="text-sm font-bold text-[#66737C]">
                Found this helpful? Share it!
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="rounded-xl border border-[#D5DBDF] bg-white px-5 py-3 text-sm font-bold text-[#34414A] hover:bg-[#F7F8F9]"
                >
                  {copied ? "✓ Link Copied!" : "🔗 Copy Link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${post.title} - ${typeof window !== "undefined" ? window.location.href : ""}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-3 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/20"
                >
                  💬 Share on WhatsApp
                </a>
              </div>
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <div className="mt-14">
              <div className="mb-6">
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A7B37]">
                  Keep Reading
                </div>
                <h2 className="mt-2 text-2xl font-black text-[#34414A]">
                  More From the Blog
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#B08D3C]/60"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#34414A] to-[#4A5962]">
                      {rp.cover_image ? (
                        <img
                          src={rp.cover_image}
                          alt={rp.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl text-white/80">
                          📰
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-base font-black leading-6 text-[#34414A] group-hover:text-[#9A7B37]">
                        {rp.title}
                      </h3>
                      <div className="mt-2 text-xs text-[#89939A]">
                        {new Date(rp.created_at).toLocaleDateString("en-ZA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-14 rounded-3xl border-2 border-[#B08D3C] bg-gradient-to-br from-[#FBF7EC] to-[#F7F8F9] p-8 text-center sm:p-12">
            <div className="text-4xl">🚗</div>
            <h2 className="mt-4 text-2xl font-black text-[#34414A] sm:text-3xl">
              Ready to find your next vehicle?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#66737C]">
              Browse thousands of vehicles on Balray Autos — or list your own
              for free in under 5 minutes.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-4 font-bold text-white shadow-md hover:brightness-105"
              >
                Browse Marketplace
              </Link>
              <Link
                href="/sell"
                className="rounded-xl border border-[#B08D3C] bg-white px-6 py-4 font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
              >
                List Your Vehicle
              </Link>
            </div>
          </div>
        </div>
      </section>

      
    </main>
  );
}