"use client";

import { useEffect, useState } from "react";
import { ensureAdminToken } from "../lib/db";
import { supabase } from "../lib/supabase";

export default function InviteTracking() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          setLoading(false);
          return;
        }

        await ensureAdminToken(user.id);

        // Fetch directly from Supabase to guarantee we get the new is_revoked column
        const { data: tokensData, error: tokenError } = await supabase
          .from("invite_tokens")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (tokenError) {
          console.error("Supabase Error:", tokenError);
        }

        setTokens(tokensData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-zinc-400 font-mono text-xs animate-pulse">
        Syncing database...
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-50 text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
            <th className="p-4 border-b border-zinc-100">Type</th>
            <th className="p-4 border-b border-zinc-100">Token Link</th>
            <th className="p-4 border-b border-zinc-100">Status</th>
            <th className="p-4 border-b border-zinc-100">User / Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {tokens.length === 0 && (
            <tr>
              <td
                colSpan="4"
                className="p-8 text-center text-zinc-400 text-sm italic"
              >
                No tokens found.
              </td>
            </tr>
          )}
          {tokens.map((t) => {
            const type = t.tokenType || t.token_type || "normal";
            const link = t.tokenString || t.token_string;
            const isUsed = t.isUsed !== undefined ? t.isUsed : t.is_used;
            const isRevoked =
              t.isRevoked !== undefined ? t.isRevoked : t.is_revoked;
            const username = t.usedByUsername || t.used_by_username;
            const note = t.note || "—";

            // Determine if the row should be styled as banned/strikethrough
            const isBanned = isRevoked === true;

            return (
              <tr
                key={t.id}
                title={isBanned ? "This person is banned" : ""}
                className={`text-sm transition-colors ${
                  isBanned
                    ? "bg-red-50/40 line-through decoration-red-500 decoration-2 hover:bg-red-50/80 cursor-help"
                    : "hover:bg-zinc-50"
                }`}
              >
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isBanned
                        ? "bg-red-100/50 text-red-700/60" // Muted red pill for banned
                        : type === "admin"
                          ? "bg-black text-white"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {type}
                  </span>
                </td>
                <td
                  className={`p-4 font-mono text-xs ${isBanned ? "text-red-900/40" : "text-zinc-500"}`}
                >
                  {link}
                </td>
                <td className="p-4">
                  {/* Status remains "Used" or "Ready", but changes color if banned */}
                  {isUsed ? (
                    <span
                      className={`flex items-center gap-1.5 font-medium ${isBanned ? "text-red-900/40" : "text-zinc-400"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${isBanned ? "bg-red-400/50" : "bg-zinc-300"}`}
                      ></div>{" "}
                      Used
                    </span>
                  ) : (
                    <span
                      className={`flex items-center gap-1.5 font-medium ${isBanned ? "text-red-900/40" : "text-green-600"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${isBanned ? "bg-red-400/50" : "bg-green-500 animate-pulse"}`}
                      ></div>{" "}
                      Ready
                    </span>
                  )}
                </td>
                <td
                  className={`p-4 italic text-xs ${isBanned ? "text-red-900/40" : "text-zinc-400"}`}
                >
                  {isUsed && username ? (
                    <span
                      className={`font-medium not-italic ${isBanned ? "text-red-900/40" : "text-black"}`}
                    >
                      @{username}
                    </span>
                  ) : (
                    note
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
