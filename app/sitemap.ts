import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const SITE_URL = "https://www.balrayautos.co.za";

// Keep this list in sync with the CITIES list in app/cars-for-sale/page.tsx
const CITIES = [
  "johannesburg",
  "cape-town",
  "durban",
  "pretoria",
  "gqeberha",
  "bloemfontein",
  "east-london",
  "polokwane",
  "nelspruit",
  "kimberley",
  "soweto",
  "sandton",
  "centurion",
  "port-elizabeth",
  "pietermaritzburg",
  "rustenburg",
  "potchefstroom",
  "stellenbosch",
  "paarl",
  "george",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cars-for-sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sell`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/start-selling`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // City pages
  const cityPages: MetadataRoute.Sitemap = CITIES.map((slug) => ({
    url: `${SITE_URL}/cars-for-sale/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Fetch all active listings
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const now = new Date().toISOString();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, created_at, updated_at")
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  const listingPages: MetadataRoute.Sitemap = (listings || []).map((listing) => ({
    url: `${SITE_URL}/listing/${listing.id}`,
    lastModified: new Date(listing.updated_at || listing.created_at),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Fetch published blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, created_at")
    .eq("published", true);

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...listingPages, ...blogPages];
}