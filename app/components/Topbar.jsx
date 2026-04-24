"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import gsap from "gsap";
import Link from "next/link";

export default function ProfileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie =
      "sb-access-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/login";
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" },
      );
    }
  };

  // Safely extract the user's actual name from Google Auth metadata
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative flex items-center justify-end w-full py-4 px-8 border-b border-zinc-100 bg-white">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 p-1 pr-3 rounded-full border border-zinc-200 hover:border-black transition-all bg-zinc-50"
          >
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
              {initial}
            </div>

            {/* Added Display Name Here */}
            <span className="text-sm font-semibold text-black truncate max-w-[120px]">
              {displayName}
            </span>

            <ChevronDown
              size={14}
              className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-3 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-bold shrink-0">
                    {initial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-black truncate">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <ShieldCheck size={12} />
                        <span className="text-[10px] font-medium uppercase tracking-tighter">
                          Verified
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        Pro Plan
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                >
                  <User size={16} />
                  Account Settings
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                >
                  <CreditCard size={16} />
                  Billing & Usage
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                >
                  <Settings size={16} />
                  Bot Preferences
                </Link>
              </div>

              <div className="p-2 border-t border-zinc-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
