"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [accessError, setAccessError] = useState("");

  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [banModal, setBanModal] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: me } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (me?.role !== "admin") {
          setAccessError("You are not an admin.");
          setLoading(false);
          return;
        }

        await fetchUsers();
      } catch (err: any) {
        setAccessError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch users error:", error);
      return;
    }

    // For each user, count their listings
    const enriched = await Promise.all(
      (data || []).map(async (profile) => {
        const { count } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id);
        return { ...profile, listingCount: count || 0 };
      })
    );

    setUsers(enriched);
  };

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 6000);
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    if (!deleteConfirmed) {
      alert("Please tick the confirmation checkbox.");
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: deleteModal.id,
          reason: deleteReason || "Removed by admin",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("Error: " + (data.error || "Could not delete user"), "error");
      } else {
        showMessage(
          `✓ User deleted permanently. Email and phone blocked from signup.`
        );
        setDeleteModal(null);
        setDeleteReason("");
        setDeleteConfirmed(false);
        await fetchUsers();
      }
    } catch (err: any) {
      showMessage("Error: " + (err.message || "Network error"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleBanUser = async () => {
    if (!banModal) return;
    if (!banReason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    setBanning(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: banReason,
      })
      .eq("id", banModal.id);

    if (error) {
      showMessage("Error: " + error.message, "error");
    } else {
      showMessage(`🚫 User banned.`);
      setBanModal(null);
      setBanReason("");
      await fetchUsers();
    }
    setBanning(false);
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm("Unban this user?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        banned: false,
        banned_at: null,
        banned_reason: null,
      })
      .eq("id", userId);

    if (error) {
      showMessage("Error: " + error.message, "error");
    } else {
      showMessage("User unbanned.");
      await fetchUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    const text = search.toLowerCase().trim();
    if (!text) return true;
    return (
      (u.full_name || "").toLowerCase().includes(text) ||
      (u.email || "").toLowerCase().includes(text) ||
      (u.phone || "").toLowerCase().includes(text)
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9]">
        <div className="text-lg font-bold animate-pulse text-[#9A7B37]">
          Loading users...
        </div>
      </main>
    );
  }

  if (accessError) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] p-4">
        <div className="max-w-md rounded-2xl border-2 border-red-300 bg-white p-8 text-center">
          <div className="text-4xl">⚠️</div>
          <h1 className="mt-4 text-2xl font-black text-red-700">
            Access Denied
          </h1>
          <p className="mt-3 text-sm text-[#66737C]">{accessError}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#34414A] px-6 py-3 text-sm font-bold text-white"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F8F9] text-[#34414A]">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Admin · Users
            </div>
            <h1 className="mt-4 text-3xl font-black text-[#34414A]">
              Manage Users
            </h1>
            <p className="mt-2 text-sm text-[#66737C]">
              {users.length} total user{users.length === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-[#B08D3C] bg-white px-5 py-3 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
          >
            ← Admin Panel
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full rounded-xl border border-[#D5DBDF] bg-white px-5 py-3.5 text-sm outline-none focus:border-[#B08D3C] focus:ring-2 focus:ring-[#B08D3C]/20"
          />
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl border p-4 text-center text-sm font-bold ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-10 text-center text-sm text-[#66737C]">
            No users found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  user.banned
                    ? "border-red-300 bg-red-50"
                    : "border-[#D5DBDF]"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg font-black text-white">
                      {user.full_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-[#34414A]">
                          {user.full_name || "Unnamed"}
                        </h3>
                        {user.role === "admin" && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                            Admin
                          </span>
                        )}
                        {user.banned && (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                            🚫 Banned
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-[#66737C]">
                        📧 {user.email || "No email"}
                      </div>
                      <div className="mt-1 text-xs text-[#66737C]">
                        📱 {user.phone || "No phone"} • 🚗{" "}
                        {user.listingCount} listing
                        {user.listingCount === 1 ? "" : "s"}
                      </div>
                      {user.banned && user.banned_reason && (
                        <div className="mt-2 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                          Reason: {user.banned_reason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="rounded-xl border border-[#B08D3C] bg-white px-4 py-2.5 text-xs font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
                    >
                      View
                    </Link>

                    {user.banned ? (
                      <button
                        onClick={() => handleUnbanUser(user.id)}
                        className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100"
                      >
                        ✅ Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBanModal(user);
                          setBanReason("");
                        }}
                        className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-xs font-bold text-yellow-800 hover:bg-yellow-100"
                      >
                        ⚠️ Ban
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDeleteModal(user);
                        setDeleteReason("");
                        setDeleteConfirmed(false);
                      }}
                      className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      🗑️ Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BAN MODAL */}
      {banModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-yellow-600 p-6 text-white">
              <div className="text-3xl">⚠️</div>
              <h2 className="mt-3 text-2xl font-black">Ban User</h2>
              <p className="mt-1 text-sm text-white/90">
                The user will be locked out but their data stays.
              </p>
            </div>
            <div className="p-6">
              <div className="rounded-xl bg-yellow-50 p-4 text-sm">
                <strong>{banModal.full_name || banModal.email}</strong>
              </div>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder="Reason for ban..."
                className="mt-4 w-full rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm outline-none focus:border-yellow-500"
              />
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setBanModal(null)}
                  className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold text-[#34414A]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  disabled={banning || !banReason.trim()}
                  className="flex-1 rounded-xl bg-yellow-600 px-4 py-3 text-sm font-bold text-white hover:bg-yellow-700 disabled:opacity-50"
                >
                  {banning ? "Banning..." : "Ban User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-red-600 p-6 text-white">
              <div className="text-4xl">🗑️</div>
              <h2 className="mt-3 text-2xl font-black">
                Delete User Permanently
              </h2>
              <p className="mt-1 text-sm text-white/90">
                This action cannot be undone.
              </p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700">
                  User
                </div>
                <div className="mt-1 text-sm font-black text-[#34414A]">
                  {deleteModal.full_name || deleteModal.email}
                </div>
                <div className="mt-1 text-xs text-[#66737C]">
                  📧 {deleteModal.email || "No email"}
                </div>
                <div className="mt-1 text-xs text-[#66737C]">
                  📱 {deleteModal.phone || "No phone"}
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-[#34414A]">
                  Reason (for your records)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Fake payment proof, repeated violations..."
                  className="w-full rounded-xl border border-[#D5DBDF] px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-5">
                <div className="text-sm font-black text-red-700">
                  This will permanently:
                </div>
                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-red-700/90">
                  <li>• Delete all their listings ({deleteModal.listingCount})</li>
                  <li>• Delete all their photos and videos from storage</li>
                  <li>• Delete their reviews and favorites</li>
                  <li>• Delete their auth account (they can't log in)</li>
                  <li>
                    • Add their <strong>email + phone</strong> to the
                    banned_users list (can't re-register)
                  </li>
                </ul>
              </div>

              <label
                className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${
                  deleteConfirmed
                    ? "border-red-500 bg-red-50"
                    : "border-[#D5DBDF] bg-white hover:border-red-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-red-600"
                />
                <span className="text-sm font-bold leading-6 text-[#34414A]">
                  I understand this is <span className="text-red-600">permanent</span>{" "}
                  and the user&apos;s email + phone will be blocked from future signups.
                </span>
              </label>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModal(null);
                    setDeleteReason("");
                    setDeleteConfirmed(false);
                  }}
                  className="flex-1 rounded-xl border border-[#D5DBDF] bg-white px-4 py-3 text-sm font-bold text-[#34414A]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting || !deleteConfirmed}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting..." : "🗑️ Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}