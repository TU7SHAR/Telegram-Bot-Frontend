"use client";

import { useEffect, useState } from "react";
import { getAllTokens } from "../lib/db";
import { supabase } from "../lib/supabase";

export default function InviteTracking() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // 1. Get the current logged-in user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("No user logged in");
          setLoading(false);
          return;
        }

        // 2. Pass the user.id to the server action to only fetch THEIR tokens
        const result = await getAllTokens(user.id);
        setTokens(result || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-zinc-400 font-mono text-xs">Loading logs...</div>
    );

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-50 text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
            <th className="p-4 border-b border-zinc-100">Type</th>
            <th className="p-4 border-b border-zinc-100">Token Link</th>
            <th className="p-4 border-b border-zinc-100">Status</th>
            <th className="p-4 border-b border-zinc-100">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {tokens.map((t) => (
            <tr
              key={t.id}
              className="text-sm hover:bg-zinc-50 transition-colors"
            >
              <td className="p-4 text-black font-bold uppercase text-[10px]">
                {t.tokenType}
              </td>
              <td className="p-4 font-mono text-xs text-zinc-500">
                {t.tokenString}
              </td>
              <td className="p-4">{t.isUsed ? "✅ Used" : "🟢 Ready"}</td>
              <td className="p-4 text-zinc-400 italic text-xs">
                {t.note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
