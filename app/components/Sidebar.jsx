"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Key,
  Shield,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Token Management", href: "/invites", icon: Key },
    { name: "Knowledge Base", href: "/knowledge", icon: FileText },
    { name: "Users Management", href: "/users", icon: Users },
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
                    ? "bg-black text-white"
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

      {/* Bottom Profile Area */}
      <div className="p-6 border-t border-zinc-100">
        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
            System Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-black">Bot Online</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-300 mt-4 text-center font-mono">
          v1.2.4-stable
        </p>
      </div>
    </div>
  );
}
