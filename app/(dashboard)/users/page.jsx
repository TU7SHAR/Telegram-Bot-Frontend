"use client";

import { useState, useEffect, useMemo } from "react";
import { ShieldBan, ShieldCheck, Loader2, Users, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { applyFiltersAndSort } from "../../utils/sortUtils";
import { DB } from "@/app/lib/schema_map";

export default function ManageUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: DB.TOKENS.CREATED_AT,
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

    const { data, error } = await supabase
      .from(DB.TOKENS.TABLE)
      .select("*")
      .eq(DB.TOKENS.CREATED_BY, user.id)
      .eq(DB.TOKENS.IS_USED, true)
      .order(DB.TOKENS.CREATED_AT, { ascending: false });

    if (!error) setActiveUsers(data);
    setLoading(false);
  };

  const revokeAccess = async (telegramId, tokenId, tokenType) => {
    // Backend Guard: Prevent admin banning
    if (tokenType === "admin") {
      alert("Action Denied: System Admins cannot be banned.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to revoke this user's access and ban them?",
      )
    )
      return;

    await supabase
      .from(DB.USERS.TABLE)
      .update({ [DB.USERS.IS_BANNED]: true })
      .eq(DB.USERS.ID, telegramId);

    const { error } = await supabase
      .from(DB.TOKENS.TABLE)
      .update({ [DB.TOKENS.IS_REVOKED]: true })
      .eq(DB.TOKENS.ID, tokenId);

    if (!error) {
      fetchActiveUsers();
    } else {
      alert("Failed to revoke access.");
    }
  };

  const unbanUser = async (telegramId, tokenId) => {
    if (
      !confirm(
        "Unban this user? Their old key will remain permanently burned, and they will need a new invite link to rejoin.",
      )
    )
      return;

    // 1. Lift the ban on the user and wipe their active session
    await supabase
      .from(DB.USERS.TABLE)
      .update({
        [DB.USERS.IS_BANNED]: false,
        [DB.USERS.TOKEN_USED]: null, // Force them to start fresh
      })
      .eq(DB.USERS.ID, telegramId);

    // 2. Deliberately LEAVE the token as is_revoked = true.
    // We just detach the user from it so they drop off the "Active Users" view.
    const { error } = await supabase
      .from(DB.TOKENS.TABLE)
      .update({
        [DB.TOKENS.IS_USED]: false,
        [DB.TOKENS.USED_BY_ID]: null,
        [DB.TOKENS.USED_BY_USER]: null,
      })
      .eq(DB.TOKENS.ID, tokenId);

    if (!error) {
      fetchActiveUsers();
    } else {
      alert("Failed to remove ban.");
    }
  };

  const displayedUsers = useMemo(() => {
    let filtered = activeUsers;
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          (u[DB.TOKENS.USED_BY_USER] &&
            u[DB.TOKENS.USED_BY_USER]
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (u[DB.TOKENS.CAPTION] &&
            u[DB.TOKENS.CAPTION]
              .toLowerCase()
              .includes(searchQuery.toLowerCase())),
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
                key: DB.TOKENS.CREATED_AT,
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
            {displayedUsers.map((user) => {
              const isAdmin = user[DB.TOKENS.TOKEN_TYPE] === "admin";

              return (
                <div
                  key={user[DB.TOKENS.ID]}
                  className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-zinc-100 p-3 rounded-xl text-zinc-400">
                      <Users size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-black">
                          @{user[DB.TOKENS.USED_BY_USER] || "Unknown"}
                        </h3>
                        {user[DB.TOKENS.IS_REVOKED] ? (
                          <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                            Banned
                          </span>
                        ) : isAdmin ? (
                          <span className="bg-black text-white px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <span>Telegram ID: {user[DB.TOKENS.USED_BY_ID]}</span>
                        <span>•</span>
                        <span>
                          Access via: {user[DB.TOKENS.CAPTION] || "Admin Token"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* UI Guard: Prevent interaction on Admin Token */}
                  {isAdmin ? (
                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-100 rounded-lg cursor-not-allowed">
                      <ShieldCheck size={16} />
                      Admin Protected
                    </div>
                  ) : user[DB.TOKENS.IS_REVOKED] ? (
                    <button
                      onClick={() =>
                        unbanUser(
                          user[DB.TOKENS.USED_BY_ID],
                          user[DB.TOKENS.ID],
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-all"
                      title="Remove Ban"
                    >
                      <ShieldCheck size={16} />
                      Remove Ban
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        revokeAccess(
                          user[DB.TOKENS.USED_BY_ID],
                          user[DB.TOKENS.ID],
                          user[DB.TOKENS.TOKEN_TYPE],
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                      title="Revoke & Ban"
                    >
                      <ShieldBan size={16} />
                      Revoke & Ban
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
