"use client";

import { useState, useEffect, useMemo } from "react";
import { Copy, Check, Trash2, Loader2, Search, Filter } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { applyFiltersAndSort } from "../../utils/sortUtils";

export default function InvitesTablePage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
    filterKey: "is_used",
    filterValue: "All",
  });

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invite_tokens")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (!error) setTokens(data);
    setLoading(false);
  };

  const deleteToken = async (id, tokenType) => {
    // Backend Guard: Stop admin deletion
    if (tokenType === "admin") {
      alert("Action Denied: Admin tokens cannot be deleted.");
      return;
    }

    if (!confirm("Are you sure you want to delete this token?")) return;
    const { error } = await supabase
      .from("invite_tokens")
      .delete()
      .eq("id", id);
    if (!error) {
      setTokens(tokens.filter((t) => t.id !== id));
    }
  };

  const copyToClipboard = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayedTokens = useMemo(() => {
    let filtered = tokens;
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          (t.caption &&
            t.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.token_string &&
            t.token_string.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.used_by_username &&
            t.used_by_username
              .toLowerCase()
              .includes(searchQuery.toLowerCase())),
      );
    }
    return applyFiltersAndSort(filtered, sortConfig);
  }, [tokens, sortConfig, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-6 mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-black tracking-tight">
            Token Management
          </h1>
          <p className="text-zinc-500 mt-2">
            Detailed view of all generated access keys and their usage data.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by caption, token, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-black text-sm transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 shadow-sm">
            <Filter size={16} className="text-zinc-400 ml-2" />
            <select
              className="bg-transparent px-2 py-2 text-sm font-medium outline-none cursor-pointer"
              onChange={(e) =>
                setSortConfig({
                  ...sortConfig,
                  filterKey: "is_used",
                  filterValue: e.target.value,
                })
              }
            >
              <option value="All">All Statuses</option>
              <option value="Used">Used Only</option>
              <option value="Unused">Unused Only</option>
            </select>
          </div>

          <select
            className="bg-white border border-zinc-200 px-4 py-2 rounded-lg text-sm font-medium outline-none shadow-sm cursor-pointer"
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

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
          </div>
        ) : displayedTokens.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-zinc-400 font-medium">
              No tokens found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                  <th className="p-4 px-6">Caption</th>
                  <th className="p-4">Token String</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Claimed By</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {displayedTokens.map((token) => {
                  const isAdmin =
                    token.token_type === "admin" || token.tokenType === "admin";

                  return (
                    <tr
                      key={token.id}
                      className="hover:bg-zinc-50 transition-colors"
                    >
                      <td className="p-4 px-6 font-medium text-black">
                        <div className="flex items-center gap-2">
                          {token.caption || "—"}
                          {isAdmin && (
                            <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded border border-zinc-200">
                          {token.token_string.replace("https://t.me/", "")}
                        </span>
                      </td>

                      <td className="p-4">
                        {token.is_revoked ? (
                          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            Revoked
                          </span>
                        ) : token.is_used ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            Used
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></span>
                            Unused
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-zinc-600">
                        {token.is_used ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-black">
                              @{token.used_by_username || "Unknown"}
                            </span>
                            <span className="text-xs text-zinc-400">
                              ID: {token.used_by_telegram_id}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">
                            Pending...
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-zinc-500 whitespace-nowrap">
                        {new Date(token.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td className="p-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              copyToClipboard(token.token_string, token.id)
                            }
                            className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                            title="Copy Full Link"
                          >
                            {copied === token.id ? (
                              <Check size={16} className="text-black" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>

                          {/* ONLY show delete button if it is NOT an admin token */}
                          {!isAdmin && (
                            <button
                              onClick={() =>
                                deleteToken(token.id, token.token_type)
                              }
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Token"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
