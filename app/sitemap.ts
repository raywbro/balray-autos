import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const BASE_URL = "https://balrayautos.co.za";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/marketplace`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/sell`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/cars-for-sale`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/brands`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return staticRoutes;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("listings")
      .select("id, created_at")
      .eq("status", "active")
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("Sitemap error:", error.message);
      return staticRoutes;
    }

    const listingRoutes = (data || []).map((item) => ({
      url: `${BASE_URL}/listing/${item.id}`,
      lastModified: new Date(item.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}