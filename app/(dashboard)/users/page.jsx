"use client";

import { useState, useEffect, useMemo } from "react";
import { ShieldBan, Loader2, Users, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { applyFiltersAndSort } from "../../utils/sortUtils";

export default function ManageUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
    filterKey: null,
    filterValue: "All",
  });

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch tokens that are currently in use
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("*")
      .eq("created_by", user.id)
      .eq("is_used", true)
      .order("created_at", { ascending: false });

    if (!error) setActiveUsers(data);
    setLoading(false);
  };

  const revokeAccess = async (telegramId, tokenId) => {
    if (
      !confirm(
        "Are you sure you want to revoke this user's access? The token will become reusable.",
      )
    )
      return;

    // 1. Delete from authorized_users table
    await supabase
      .from("authorized_users")
      .delete()
      .eq("telegram_id", telegramId);

    // 2. Reset the token in invite_tokens
    const { error } = await supabase
      .from("invite_tokens")
      .update({
        is_used: false,
        used_by_telegram_id: null,
        used_by_username: null,
      })
      .eq("id", tokenId);

    if (!error) {
      // Remove the user from the UI
      setActiveUsers(activeUsers.filter((u) => u.id !== tokenId));
    } else {
      alert("Failed to revoke access.");
    }
  };

  // Apply search query first, then sorting logic
  const displayedUsers = useMemo(() => {
    let filtered = activeUsers;
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          (u.used_by_username &&
            u.used_by_username
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (u.caption &&
            u.caption.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }
    return applyFiltersAndSort(filtered, sortConfig);
  }, [activeUsers, sortConfig, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-black tracking-tight">
            User Management
          </h1>
          <p className="text-zinc-500 mt-2">
            Monitor and control who has access to your Telegram bot.
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by username or caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <select
            className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none"
            onChange={(e) =>
              setSortConfig({
                ...sortConfig,
                key: "created_at",
                direction: e.target.value,
              })
            }
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-zinc-400 font-medium">No active users found.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {displayedUsers.map((user) => (
              <div
                key={user.id}
                className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-100 p-3 rounded-xl text-zinc-400">
                    <Users size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-black">
                        @{user.used_by_username || "Unknown"}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <span>Telegram ID: {user.used_by_telegram_id}</span>
                      <span>•</span>
                      <span>Access via: {user.caption}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    revokeAccess(user.used_by_telegram_id, user.id)
                  }
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                  title="Revoke Access"
                >
                  <ShieldBan size={16} />
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
