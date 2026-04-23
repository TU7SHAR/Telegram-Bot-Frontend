"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Check, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function DashboardHome() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setTokens(data);
    setLoading(false);
  };

  const generateToken = async () => {
    console.log("1. Generate button clicked"); // Check if this shows up

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("2. Auth check complete", { user, userError });

      if (userError || !user) {
        alert("No user found. Try logging out and in again.");
        return;
      }

      const newTokenString = `token_${Math.random().toString(36).substr(2, 9)}`;
      const link = `https://t.me/DrishRag_Bot?start=${newTokenString}`;

      console.log("3. Attempting DB Insert for:", link);

      const { data, error } = await supabase
        .from("invite_tokens")
        .insert([
          {
            token_string: link,
            created_by: user.id,
          },
        ])
        .select();

      if (error) {
        console.error("4. Database Error:", error);
        alert("DB Error: " + error.message);
      } else {
        console.log("5. Success! Data returned:", data);
        setTokens([data[0], ...tokens]);
      }
    } catch (err) {
      console.error("Critical Catch:", err);
    }
  };

  const deleteToken = async (id) => {
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-black tracking-tight">
            Invite Tokens
          </h1>
          <p className="text-zinc-500 mt-2">
            Manage access keys for the Telegram RAG Bot.
          </p>
        </div>
        <button
          onClick={generateToken}
          className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
        >
          <Plus size={20} />
          Generate New Link
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-zinc-400 font-medium">No active tokens found.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-black bg-zinc-100 px-3 py-1 rounded-md">
                      {token.token_string}
                    </span>
                    {token.is_used && (
                      <span className="text-[10px] uppercase tracking-widest bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
                        Used
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Created {new Date(token.created_at).toLocaleDateString()}
                  </p>
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
                  <button
                    onClick={() => deleteToken(token.id)}
                    className="p-2.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Token"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
