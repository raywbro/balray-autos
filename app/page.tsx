import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";

const categoryMap: Record<string, string> = {
  cars: "Cars & SUVs",
  bakkies: "Bakkies & 4x4s",
  motorcycles: "Motorcycles",
  trucks: "Trucks & Commercial",
  machinery: "Machinery & Equipment",
  parts: "Parts & Accessories",
};

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: subscribedProfiles } = await supabase
    .from("profiles")
    .select("id")
    .neq("subscription_tier", "none")
    .gt("subscription_expires_at", now);

  const subscribedIds = new Set((subscribedProfiles || []).map((p) => p.id));

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("Server fetch error:", error);
    return <HomeClient initialListings={[]} />;
  }

  const formatted = (data || []).map((item) => ({
    id: item.id,
    userId: item.user_id,
    title: `${item.year ? item.year + " " : ""}${item.make} ${item.model}`,
    category: categoryMap[item.category] || item.category,
    price: `R${Number(item.price).toLocaleString()}`,
    priceValue: Number(item.price),
    year: item.year ? item.year.toString() : "N/A",
    mileage: item.mileage || "N/A",
    location: item.location,
    featured: item.featured || false,
    isSubscribedSeller: subscribedIds.has(item.user_id),
    views: item.views || 0,
    createdAt: item.created_at,
    image:
      item.images && item.images.length > 0
        ? item.images[0]
        : "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
  }));

  const sorted = [...formatted].sort((a, b) => {
    if (a.isSubscribedSeller && !b.isSubscribedSeller) return -1;
    if (!a.isSubscribedSeller && b.isSubscribedSeller) return 1;
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return <HomeClient initialListings={sorted} />;
}