"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [sortBy, setSortBy] = useState<"newest" | "listings" | "views" | "name">("newest");

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

      await fetchUsers();
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [router, supabase]);

  const fetchUsers = async () => {
    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    // Fetch all listings (to count per user)
    const { data: listings } = await supabase
      .from("listings")
      .select("id, user_id, status, views, price");

    // Combine
    const enriched = (profiles || []).map((profile) => {
      const userListings = (listings || []).filter((l) => l.user_id === profile.id);
      const active = userListings.filter((l) => l.status === "active").length;
      const pending = userListings.filter((l) => l.status === "pending").length;
      const sold = userListings.filter((l) => l.status === "sold").length;
      const totalViews = userListings.reduce((sum, l) => sum + (l.views || 0), 0);

      return {
        ...profile,
        totalListings: userListings.length,
        activeListings: active,
        pendingListings: pending,
        soldListings: sold,
        totalViews: totalViews,
      };
    });

    setUsers(enriched);
  };

  const filteredUsers = users.filter((u) => {
    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      searchText === "" ||
      (u.full_name || "").toLowerCase().includes(searchText) ||
      (u.phone || "").toLowerCase().includes(searchText) ||
      u.id.toLowerCase().includes(searchText);

    const matchesRole =
      roleFilter === "all" || u.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && u.banned) ||
      (statusFilter === "active" && !u.banned);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "listings":
        return b.totalListings - a.totalListings;
      case "views":
        return b.totalViews - a.totalViews;
      case "name":
        return (a.full_name || "").localeCompare(b.full_name || "");
      case "newest":
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading users...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Admin · User Management
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#34414A]">
              All Users
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              {users.length} registered user{users.length === 1 ? "" : "s"} • Click any user to view their profile and listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
            >
              ← Admin Panel
            </Link>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
            {message}
          </div>
        )}

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-[#D5DBDF] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or user ID..."
              className="w-full rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#B08D3C]"
            >
              <option value="all">All Roles</option>
              <option value="user">Users Only</option>
              <option value="admin">Admins Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#B08D3C]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#B08D3C]"
            >
              <option value="newest">Newest First</option>
              <option value="listings">Most Listings</option>
              <option value="views">Most Views</option>
              <option value="name">A → Z Name</option>
            </select>
          </div>
        </div>

        {/* USERS LIST */}
        {sortedUsers.length === 0 ? (
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center">
            <div className="text-4xl">👥</div>
            <h3 className="mt-4 text-xl font-black text-[#34414A]">
              No users match your filters
            </h3>
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="mt-5 rounded-xl bg-[#34414A] px-5 py-3 text-sm font-bold text-white hover:bg-[#4A5962]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedUsers.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className={`group flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#B08D3C] hover:shadow-md lg:flex-row lg:items-center lg:justify-between ${
                  user.banned ? "border-red-200 bg-red-50/30" : "border-[#D5DBDF]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] via-[#D2B66A] to-[#A47F32] text-xl font-black text-white shadow-md">
                    {user.full_name
                      ? user.full_name.charAt(0).toUpperCase()
                      : "?"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-[#34414A]">
                        {user.full_name || "Unnamed User"}
                      </h3>
                      {user.role === "admin" && (
                        <span className="rounded-full bg-[#FBF7EC] px-2 py-0.5 text-xs font-bold text-[#8F7130]">
                          Admin
                        </span>
                      )}
                      {user.banned && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          🚫 Banned
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#66737C]">
                      <span>📱 {user.phone || "No phone"}</span>
                      <span>📅 Joined {formatDate(user.created_at)}</span>
                    </div>
                    <div className="mt-1 truncate text-xs text-[#89939A]">
                      ID: {user.id}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-lg bg-[#F7F8F9] px-3 py-2 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                      Listings
                    </div>
                    <div className="mt-0.5 text-base font-black text-[#34414A]">
                      {user.totalListings}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 px-3 py-2 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                      Active
                    </div>
                    <div className="mt-0.5 text-base font-black text-green-700">
                      {user.activeListings}
                    </div>
                  </div>
                  {user.pendingListings > 0 && (
                    <div className="rounded-lg bg-yellow-50 px-3 py-2 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                        Pending
                      </div>
                      <div className="mt-0.5 text-base font-black text-yellow-700">
                        {user.pendingListings}
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                      Sold
                    </div>
                    <div className="mt-0.5 text-base font-black text-blue-700">
                      {user.soldListings}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#F7F8F9] px-3 py-2 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89939A]">
                      Views
                    </div>
                    <div className="mt-0.5 text-base font-black text-[#34414A]">
                      {user.totalViews}
                    </div>
                  </div>

                  <div className="ml-2 hidden text-2xl text-[#B08D3C] transition group-hover:translate-x-1 lg:block">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}