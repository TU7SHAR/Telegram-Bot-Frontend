"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Smartphone,
  Loader2,
  Link as LinkIcon,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { DB } from "@/app/lib/schema_map";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [botSettings, setBotSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch User Profile
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // 2. Fetch Live Bot Settings using Schema Map
          const { data, error } = await supabase
            .from(DB.SETTINGS.TABLE)
            .select(DB.SETTINGS.MAINTENANCE_MODE)
            .eq(DB.SETTINGS.CREATED_BY, user.id)
            .maybeSingle();

          if (error) throw error;
          setBotSettings(data);
        }
      } catch (err) {
        console.error("Status fetch failed:", err);
        setStatusError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-20 flex justify-center">
        <Loader2 className="animate-spin text-zinc-300" size={40} />
      </div>
    );
  }

  const email = user?.email || "No email available";
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  // --- Bot Status Logic ---
  let statusColor = "bg-green-500";
  let statusText = "Online & Active";
  let pulseColor = "bg-green-400";

  if (statusError) {
    statusColor = "bg-red-600";
    statusText = "Bot Halted";
    pulseColor = "bg-red-400";
  } else if (botSettings?.[DB.SETTINGS.MAINTENANCE_MODE]) {
    statusColor = "bg-amber-500";
    statusText = "Maintenance";
    pulseColor = "bg-amber-400";
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4">
      <div className="flex flex-col gap-2 mb-10 border-b border-zinc-200 pb-6">
        <h1 className="text-4xl font-bold text-black tracking-tight flex items-center gap-3">
          <User size={36} /> Your Account
        </h1>
        <p className="text-zinc-500 mt-2">
          Manage profile and security settings.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-semibold text-black mb-6">
            Profile Details
          </h2>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center font-bold text-3xl shadow-inner shrink-0">
              {initial}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-2xl font-bold text-black truncate">
                {displayName}
              </h3>
              <p className="text-zinc-500 flex items-center gap-2 mt-1 truncate">
                <Mail size={16} className="shrink-0" /> {email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Role
              </label>
              <p className="font-medium text-black mt-1 flex items-center gap-2">
                <Shield size={16} className="text-blue-600" /> Administrator
              </p>
            </div>

            <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Linked Auth
              </label>
              <p className="font-medium text-black mt-1 flex items-center gap-2">
                <LinkIcon size={16} className="text-zinc-500" /> Google OAuth
              </p>
            </div>

            {/* Dynamic Bot Status Bubble */}
            <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Bot Status
              </label>
              <div className="font-medium text-black mt-1 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColor}`}
                  ></span>
                </span>
                {statusText}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-semibold text-black mb-6">
            Connected Devices
          </h2>
          <div className="flex items-center justify-between p-4 border border-zinc-100 rounded-xl bg-zinc-50">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-medium text-black">Telegram Bot</h3>
                <p className="text-sm text-zinc-500">
                  Live webhook integration active.
                </p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Connected
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
