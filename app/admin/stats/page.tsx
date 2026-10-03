"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    expiredListings: 0,
    featuredListings: 0,
    totalViews: 0,
    totalUsers: 0,
    totalFavorites: 0,
  });
  const [topListings, setTopListings] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      // 1. Fetch all listings
      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .order("views", { ascending: false });

      const now = new Date();

      const allListings = listings || [];
      const activeCount = allListings.filter((l) => l.status === "active" && (!l.expires_at || new Date(l.expires_at) > now)).length;
      const pendingCount = allListings.filter((l) => l.status === "pending").length;
      const expiredCount = allListings.filter((l) => l.status === "active" && l.expires_at && new Date(l.expires_at) <= now).length;
      const featuredCount = allListings.filter((l) => l.featured === true).length;
      const totalViews = allListings.reduce((sum, l) => sum + (l.views || 0), 0);

      // 2. Fetch total users from profiles
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 3. Fetch total favorites
      const { count: favCount } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true });

      // 4. Top 5 listings by views
      const top5 = allListings
        .filter((l) => l.status === "active")
        .slice(0, 5)
        .map((l) => ({
          id: l.id,
          title: `${l.year ? l.year + " " : ""}${l.make} ${l.model}`,
          views: l.views || 0,
          price: `R${Number(l.price).toLocaleString()}`,
          image: l.images?.[0] || "/placeholder.png",
        }));

      // 5. Recent users (last 5)
      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, role, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);

      setStats({
        totalListings: allListings.length,
        activeListings: activeCount,
        pendingListings: pendingCount,
        expiredListings: expiredCount,
        featuredListings: featuredCount,
        totalViews: totalViews,
        totalUsers: userCount || 0,
        totalFavorites: favCount || 0,
      });

      setTopListings(top5);
      setRecentUsers(users || []);
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading stats...
        </div>
      </main>
    );
  }

  const statCards = [
    { label: "Total Listings", value: stats.totalListings, icon: "🚗", color: "from-[#34414A] to-[#4A5962]" },
    { label: "Active", value: stats.activeListings, icon: "✓", color: "from-green-600 to-green-700" },
    { label: "Pending", value: stats.pendingListings, icon: "⏳", color: "from-yellow-500 to-yellow-600" },
    { label: "Expired", value: stats.expiredListings, icon: "⌛", color: "from-gray-500 to-gray-600" },
    { label: "Featured", value: stats.featuredListings, icon: "⭐", color: "from-[#8F7130] to-[#B08D3C]" },
    { label: "Total Views", value: stats.totalViews, icon: "👁️", color: "from-blue-600 to-blue-700" },
    { label: "Total Users", value: stats.totalUsers, icon: "👤", color: "from-purple-600 to-purple-700" },
    { label: "Favorites", value: stats.totalFavorites, icon: "❤️", color: "from-red-500 to-red-600" },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Marketplace Analytics
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#34414A]">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              Real-time stats about your Balray Autos marketplace.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
          >
            ← Back to Admin Panel
          </Link>
        </div>

        {/* STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="overflow-hidden rounded-2xl border border-[#D5DBDF] bg-white shadow-sm"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${card.color}`} />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#89939A]">
                    {card.label}
                  </div>
                  <div className="text-2xl">{card.icon}</div>
                </div>
                <div className="mt-3 text-3xl font-black text-[#34414A]">
                  {card.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TOP LISTINGS + RECENT USERS */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* TOP LISTINGS */}
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#34414A] mb-1">
              🔥 Top 5 Listings
            </h2>
            <p className="text-xs text-[#66737C] mb-5">Most viewed listings on your marketplace.</p>

            {topListings.length === 0 ? (
              <p className="text-sm text-[#89939A]">No active listings yet.</p>
            ) : (
              <div className="space-y-3">
                {topListings.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/listing/${item.id}`}
                    className="flex items-center gap-4 rounded-xl border border-[#E1E5E8] p-3 transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FBF7EC] text-sm font-black text-[#8F7130]">
                      {index + 1}
                    </div>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-[#34414A]">
                        {item.title}
                      </div>
                      <div className="mt-0.5 text-xs font-bold text-[#9A7B37]">
                        {item.price}
                      </div>
                    </div>
                    <div className="flex-shrink-0 rounded-full bg-[#F7F8F9] px-3 py-1 text-xs font-bold text-[#34414A]">
                      👁️ {item.views}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* RECENT USERS */}
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#34414A] mb-1">
              👥 Recent Users
            </h2>
            <p className="text-xs text-[#66737C] mb-5">Latest registered accounts.</p>

            {recentUsers.length === 0 ? (
              <p className="text-sm text-[#89939A]">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 rounded-xl border border-[#E1E5E8] p-3"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-sm font-black text-white">
                      {user.full_name
                        ? user.full_name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-[#34414A]">
                        {user.full_name || "Unnamed User"}
                      </div>
                      <div className="truncate text-xs text-[#89939A]">
                        {user.id.substring(0, 8)}...
                      </div>
                    </div>
                    {user.role === "admin" ? (
                      <span className="rounded-full bg-[#FBF7EC] px-3 py-1 text-xs font-bold text-[#8F7130]">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F7F8F9] px-3 py-1 text-xs font-bold text-[#34414A]">
                        User
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-[#D4DADF] bg-[#EEF1F3]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <img src="/balray-autos-logo.png" alt="Balray Autos" className="h-11 w-auto max-w-[180px] object-contain" />
              <p className="mt-3 text-sm text-[#68757D]">South African automotive marketplace.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <Link href="/" className="text-[#68757D] hover:text-[#9A7B37]">Home</Link>
              <Link href="/marketplace" className="text-[#68757D] hover:text-[#9A7B37]">Marketplace</Link>
              <Link href="/admin" className="text-[#68757D] hover:text-[#9A7B37]">Admin</Link>
              <Link href="/contact" className="text-[#68757D] hover:text-[#9A7B37]">Contact</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[#D3D9DD] pt-5 text-center text-sm text-[#7A858C]">
            © {new Date().getFullYear()} Balray Autos (Pty) Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}