"use client";

import { useEffect, useState } from "react";
import { getAllTokens, ensureAdminToken } from "../lib/db";
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
        const result = await getAllTokens(user.id);
        setTokens(result || []);
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
            const username = t.usedByUsername || t.used_by_username;
            const note = t.note || "—";

            return (
              <tr
                key={t.id}
                className="text-sm hover:bg-zinc-50 transition-colors"
              >
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      type === "admin"
                        ? "bg-black text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {type}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-zinc-500">{link}</td>
                <td className="p-4">
                  {isUsed ? (
                    <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>{" "}
                      Used
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1.5 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>{" "}
                      Ready
                    </span>
                  )}
                </td>
                <td className="p-4 text-zinc-400 italic text-xs">
                  {isUsed && username ? (
                    <span className="text-black font-medium not-italic">
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
