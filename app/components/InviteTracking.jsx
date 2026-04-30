"use client";

import { useEffect, useState } from "react";
import { ensureAdminToken } from "../lib/db";
import { supabase } from "../lib/supabase";
import { DB } from "@/app/lib/schema_map";

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

        const { data: tokensData, error: tokenError } = await supabase
          .from(DB.TOKENS.TABLE)
          .select("*")
          .eq(DB.TOKENS.CREATED_BY, user.id)
          .order(DB.TOKENS.CREATED_AT, { ascending: false });

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
            const type = t[DB.TOKENS.TOKEN_TYPE] || "normal";
            const link = t[DB.TOKENS.TOKEN_STRING];
            const isUsed = t[DB.TOKENS.IS_USED];
            const isRevoked = t[DB.TOKENS.IS_REVOKED];
            const username = t[DB.TOKENS.USED_BY_USER];
            const note = t[DB.TOKENS.CAPTION] || "—";

            return (
              <tr
                key={t[DB.TOKENS.ID]}
                title={isRevoked ? "This token is revoked" : ""}
                className={`text-sm transition-colors ${
                  isRevoked
                    ? "bg-red-50/40 hover:bg-red-50/80 cursor-help"
                    : "hover:bg-zinc-50"
                }`}
              >
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isRevoked
                        ? "bg-red-100 text-red-700"
                        : type === "admin"
                          ? "bg-black text-white"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isRevoked ? "Revoked" : type}
                  </span>
                </td>
                <td
                  className={`p-4 font-mono text-xs ${isRevoked ? "text-red-900/40" : "text-zinc-500"}`}
                >
                  {link}
                </td>
                <td className="p-4">
                  {isRevoked ? (
                    <span className="text-zinc-400">—</span>
                  ) : isUsed ? (
                    <span className="flex items-center gap-1.5 font-medium text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>{" "}
                      Used
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-medium text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>{" "}
                      Ready
                    </span>
                  )}
                </td>
                <td
                  className={`p-4 italic text-xs ${isRevoked ? "text-red-900/40" : "text-zinc-400"}`}
                >
                  {isUsed && username ? (
                    <span
                      className={`font-medium not-italic ${isRevoked ? "text-red-900/40" : "text-black"}`}
                    >
                      @{username}
                    </span>
                  ) : isRevoked ? (
                    <span className="not-italic">—</span>
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
