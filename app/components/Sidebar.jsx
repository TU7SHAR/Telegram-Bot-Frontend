"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Key,
  Shield,
  Loader2,
  LineChart,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { DB } from "@/app/lib/schema_map";

export default function Sidebar() {
  const pathname = usePathname();
  const [botStatus, setBotStatus] = useState({
    color: "bg-green-500",
    pulse: "bg-green-400",
    text: "Bot Online",
  });
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Fetch the live bot status from Supabase using Schema Map
  useEffect(() => {
    async function getLiveStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from(DB.SETTINGS.TABLE)
            .select(DB.SETTINGS.MAINTENANCE_MODE)
            .eq(DB.SETTINGS.CREATED_BY, user.id)
            .maybeSingle();

          if (error) throw error;

          if (data?.[DB.SETTINGS.MAINTENANCE_MODE]) {
            setBotStatus({
              color: "bg-amber-500",
              pulse: "bg-amber-400",
              text: "Maintenance",
            });
          } else {
            setBotStatus({
              color: "bg-green-500",
              pulse: "bg-green-400",
              text: "Bot Online",
            });
          }
        }
      } catch (err) {
        console.error("Sidebar status check failed:", err);
        setBotStatus({
          color: "bg-red-600",
          pulse: "bg-red-400",
          text: "Bot Halted",
        });
      } finally {
        setLoadingStatus(false);
      }
    }

    getLiveStatus();

    // Optional: Refresh status every 2 minutes
    const interval = setInterval(getLiveStatus, 120000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Token Management", href: "/invites", icon: Key },
    { name: "Knowledge Base", href: "/knowledge", icon: FileText },
    { name: "Users Management", href: "/users", icon: Users },
    { name: "Test Analytics", href: "/analytics", icon: LineChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-zinc-600 border-r border-zinc-200">
      {/* Brand / Logo Area */}
      <div className="p-8">
        <h1 className="text-xl font-bold text-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <Shield size={18} fill="currentColor" />
          </div>
          TELEGRAM<span className="font-light text-zinc-400">.BOT</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "hover:bg-zinc-100 hover:text-black"
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Dynamic System Status Area */}
      <div className="p-6 border-t border-zinc-100">
        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
            System Status
          </p>
          <div className="flex items-center gap-2">
            {loadingStatus ? (
              <Loader2 size={12} className="animate-spin text-zinc-400" />
            ) : (
              <div className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${botStatus.pulse} opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${botStatus.color}`}
                ></span>
              </div>
            )}
            <span className="text-xs font-medium text-black">
              {loadingStatus ? "Syncing..." : botStatus.text}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-300 mt-4 text-center font-mono">
          v1.2.4-stable
        </p>
      </div>
    </div>
  );
}
