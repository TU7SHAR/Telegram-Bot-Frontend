"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Copy, Check, Trash2, Loader2, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { applyFiltersAndSort } from "../utils/sortUtils";

export default function DashboardHome() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const [captionInput, setCaptionInput] = useState("");
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

    if (!error && data) {
      setTokens(data);
    }
    setLoading(false);
  };

  const generateToken = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("No user found. Try logging out and in again.");
        return;
      }

      const newTokenString = `token_${Math.random().toString(36).substr(2, 9)}`;
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const botUsername = isLocalhost ? "devRagbot" : "DrishRag_Bot";
      const link = `https://t.me/${botUsername}?start=${newTokenString}`;

      const { data, error } = await supabase
        .from("invite_tokens")
        .insert([
          {
            token_string: link,
            created_by: user.id,
            caption: captionInput || "No caption",
          },
        ])
        .select();

      if (error) {
        alert("DB Error: " + error.message);
      } else if (data && data.length > 0) {
        setTokens((prevTokens) => [data[0], ...prevTokens]);
        setCaptionInput("");
      }
    } catch (err) {
      console.error("Critical Catch:", err);
    }
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
      setTokens((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const copyToClipboard = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayedTokens = useMemo(() => {
    const flatTokens = Array.isArray(tokens) ? tokens.flat() : [];
    return applyFiltersAndSort(flatTokens, sortConfig);
  }, [tokens, sortConfig]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-black tracking-tight">
            Quick Generation
          </h1>
          <p className="text-zinc-500 mt-2">
            Instantly create new access keys for the Telegram RAG Bot.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Add a caption (e.g., 'Marketing Team', 'Karan Sir')"
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>
          <button
            onClick={generateToken}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            Generate Link
          </button>
        </div>

        <div className="flex gap-3">
          <select
            className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none"
            onChange={(e) =>
              setSortConfig({
                ...sortConfig,
                filterKey: "is_used",
                filterValue: e.target.value,
              })
            }
          >
            <option value="All">All Tokens</option>
            <option value="Used">Used Tokens</option>
            <option value="Unused">Unused Tokens</option>
          </select>

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
            <option value="desc">Latest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
          </div>
        ) : displayedTokens.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-zinc-400 font-medium">
              No tokens match your filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {displayedTokens.map((token) => {
              if (!token || typeof token !== "object") return null;

              // Identify if this is the core Admin token
              const isAdmin =
                token.token_type === "admin" || token.tokenType === "admin";

              return (
                <div
                  key={token.id}
                  className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-black flex items-center gap-2">
                        {token.caption || "No caption"}
                        {isAdmin && (
                          <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                            Admin
                          </span>
                        )}
                      </h3>

                      {/* Clean Status Badges */}
                      {token.is_revoked ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          Revoked
                        </span>
                      ) : token.is_used ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          Used by @{token.used_by_username || "Unknown"}
                        </span>
                      ) : (
                        <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></span>
                          Unused
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-md">
                        {token.token_string.replace("https://t.me/", "")}
                      </span>
                      <p className="text-xs text-zinc-400 font-medium">
                        Created:{" "}
                        {new Date(token.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(token.token_string, token.id)
                      }
                      className="p-2.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-xl transition-all"
                      title="Copy Link"
                    >
                      {copied === token.id ? (
                        <Check size={18} className="text-black" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>

                    {/* Hide delete button for Admin token */}
                    {!isAdmin && (
                      <button
                        onClick={() => deleteToken(token.id, token.token_type)}
                        className="p-2.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Token"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
