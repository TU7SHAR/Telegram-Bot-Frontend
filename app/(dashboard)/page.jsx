"use client";
import Script from 'next/script'   
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Loader2,
  Search,
  Mail,
  X,
  RefreshCw,
} from "lucide-react";
import { DB } from "@/app/lib/schema_map";
import { applyFiltersAndSort } from "../utils/sortUtils";
import { sendInviteLink } from "../lib/email";
import { supabase } from "@/app/lib/supabase";

export default function DashboardHome() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCaption, setModalCaption] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize sort state using the DB Map[cite: 1]
  const [sortConfig, setSortConfig] = useState({
    key: DB.TOKENS.CREATED_AT,
    direction: "desc",
    filterKey: DB.TOKENS.IS_USED,
    filterValue: "All",
  });

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from(DB.TOKENS.TABLE)
      .select("*")
      .order(DB.TOKENS.CREATED_AT, { ascending: false });

    if (data) setTokens(data);
    setLoading(false);
  };

  const handleGenerateAndSend = async () => {
    setIsGenerating(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("No user found. Try logging out and in again.");
        setIsGenerating(false);
        return;
      }

      const newTokenString = `token_${Math.random().toString(36).substr(2, 9)}`;
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const botUsername = isLocalhost ? "devRagbot" : "DrishRag_Bot";
      const link = `https://t.me/${botUsername}?start=${newTokenString}`;

      const finalCaption = modalCaption.trim() || "No caption";

      // 1. Save to Supabase using Mapped Keys[cite: 1, 2]
      const { data, error } = await supabase
        .from(DB.TOKENS.TABLE)
        .insert([
          {
            [DB.TOKENS.TOKEN_STRING]: link,
            [DB.TOKENS.CREATED_BY]: user.id,
            [DB.TOKENS.CAPTION]: finalCaption,
            [DB.TOKENS.SENT_TO]: modalEmail.trim() || null, // Correctly saves email to new column[cite: 1, 2]
            [DB.TOKENS.IS_REVOKED]: false,
            [DB.TOKENS.IS_USED]: false,
          },
        ])
        .select();

      if (error) {
        alert("DB Error: " + error.message);
      } else if (data && data.length > 0) {
        setTokens((prevTokens) => [data[0], ...prevTokens]);

        // 2. Send email if provided
        if (modalEmail.trim()) {
          const emailRes = await sendInviteLink(
            modalEmail.trim(),
            link,
            finalCaption,
          );
          if (!emailRes.success) {
            alert(
              "Token generated, but failed to send email: " + emailRes.error,
            );
          }
        }

        setModalCaption("");
        setModalEmail("");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Critical Catch:", err);
      alert("Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshAdminToken = async (id) => {
    if (!confirm("Are you sure you want to refresh the Admin Key?")) return;

    const tokenToRefresh = tokens.find((t) => t[DB.TOKENS.ID] === id);

    if (tokenToRefresh?.[DB.TOKENS.TOKEN_STRING]) {
      await supabase
        .from(DB.USERS.TABLE)
        .update({ [DB.USERS.TOKEN_USED]: null })
        .eq(DB.USERS.TOKEN_USED, tokenToRefresh[DB.TOKENS.TOKEN_STRING]);
    }

    const newTokenString = `token_${Math.random().toString(36).substr(2, 9)}`;
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const botUsername = isLocalhost ? "devRagbot" : "DrishRag_Bot";
    const newLink = `https://t.me/${botUsername}?start=${newTokenString}`;

    const { data, error } = await supabase
      .from(DB.TOKENS.TABLE)
      .update({
        [DB.TOKENS.TOKEN_STRING]: newLink,
        [DB.TOKENS.IS_USED]: false,
        [DB.TOKENS.USED_BY_ID]: null,
        [DB.TOKENS.USED_BY_USER]: null,
        [DB.TOKENS.IS_REVOKED]: false,
      })
      .eq(DB.TOKENS.ID, id)
      .select();

    if (error) {
      alert("Failed to refresh token: " + error.message);
    } else if (data && data.length > 0) {
      setTokens((prev) =>
        prev.map((t) => (t[DB.TOKENS.ID] === id ? data[0] : t)),
      );
      alert("Admin Key successfully refreshed!");
    }
  };

  const deleteToken = async (id, tokenType) => {
    if (tokenType === "admin") {
      alert("Action Denied: Admin tokens cannot be deleted.");
      return;
    }
    if (!confirm("Are you sure you want to delete this token?")) return;

    const { error } = await supabase
      .from(DB.TOKENS.TABLE)
      .delete()
      .eq(DB.TOKENS.ID, id);
    if (!error) {
      setTokens((prev) => prev.filter((t) => t[DB.TOKENS.ID] !== id));
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
    <div className="max-w-5xl mx-auto relative">
      {/* Modal - Invitation Form[cite: 2] */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-black">
                  Generate Access Key
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Create a new invite link and optionally email it.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Caption (Required)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'Marketing Team'"
                  value={modalCaption}
                  onChange={(e) => setModalCaption(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5 flex items-center gap-2">
                  <Mail size={14} className="text-zinc-400" /> Send to Email
                  (Optional)
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAndSend}
                disabled={isGenerating || !modalCaption.trim()}
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {isGenerating
                  ? "Processing..."
                  : modalEmail
                    ? "Generate & Send Email"
                    : "Generate Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Area[cite: 2] */}
      <div className="flex flex-col gap-6 mb-10 border-b border-zinc-200 pb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tight">
              Quick Generation
            </h1>
            <p className="text-zinc-500 mt-2">
              Instantly create new access keys for the Telegram RAG Bot.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm whitespace-nowrap"
          >
            <Plus size={20} /> Create New Link
          </button>
        </div>
        <div className="flex gap-3">
          <select
            className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer"
            onChange={(e) =>
              setSortConfig({
                ...sortConfig,
                filterKey: DB.TOKENS.IS_USED,
                filterValue: e.target.value,
              })
            }
          >
            <option value="All">All Tokens</option>
            <option value="Used">Used Tokens</option>
            <option value="Unused">Unused Tokens</option>
          </select>
          <select
            className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer"
            onChange={(e) =>
              setSortConfig({
                ...sortConfig,
                key: DB.TOKENS.CREATED_AT,
                direction: e.target.value,
              })
            }
          >
            <option value="desc">Latest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main List Display[cite: 2] */}
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
              const isAdmin = token[DB.TOKENS.TOKEN_TYPE] === "admin";
              const sentToEmail = token[DB.TOKENS.SENT_TO]; // Retrieve from mapping[cite: 1]

              return (
                <div
                  key={token[DB.TOKENS.ID]}
                  className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-black flex items-center gap-2">
                        {token[DB.TOKENS.CAPTION] || "No caption"}

                        {/* REFINED EMAIL DISPLAY LOGIC[cite: 1, 2] */}
                        <span className="text-sm text-zinc-400 font-normal italic">
                          {sentToEmail ? `(${sentToEmail})` : "(Direct Link)"}
                        </span>

                        {isAdmin && (
                          <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                            Admin
                          </span>
                        )}
                      </h3>

                      {token[DB.TOKENS.IS_REVOKED] === true ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          Revoked
                        </span>
                      ) : token[DB.TOKENS.IS_USED] ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          Used by @{token[DB.TOKENS.USED_BY_USER] || "Unknown"}
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
                        {token[DB.TOKENS.TOKEN_STRING].replace(
                          "https://t.me/",
                          "",
                        )}
                      </span>
                      <p className="text-xs text-zinc-400 font-medium">
                        Created:{" "}
                        {new Date(
                          token[DB.TOKENS.CREATED_AT],
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          token[DB.TOKENS.TOKEN_STRING],
                          token[DB.TOKENS.ID],
                        )
                      }
                      className="p-2.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-xl transition-all"
                    >
                      {copied === token[DB.TOKENS.ID] ? (
                        <Check size={18} className="text-black" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                    {isAdmin ? (
                      <button
                        onClick={() => refreshAdminToken(token[DB.TOKENS.ID])}
                        className="p-2.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Refresh Admin Token"
                      >
                        <RefreshCw size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          deleteToken(
                            token[DB.TOKENS.ID],
                            token[DB.TOKENS.TOKEN_TYPE],
                          )
                        }
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
        {/* BotFactory Widget */}
<Script id="botfactory-init" strategy="beforeInteractive">
  {`window.BOTFACTORY_ID = "14";`}
</Script>
<Script src="https://chatbot-c53nl.ondigitalocean.app/static/js/embed.js" strategy="afterInteractive" />
    </div>
  
  );
}
