// Full corrected app/(dashboard)/account/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Smartphone,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  const email = user?.email || "No email available";
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    email.split("@")[0];

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4">
      <div className="flex flex-col gap-2 mb-10 border-b pb-6">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <User size={36} /> Your Account
        </h1>
      </div>

      <div className="flex flex-col gap-8">
        <section className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center font-bold text-3xl">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{displayName}</h3>
              <p className="text-zinc-500 flex items-center gap-2">
                <Mail size={16} /> {email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-xl bg-zinc-50">
              <label className="text-xs font-bold text-zinc-400 uppercase">
                Role
              </label>
              <p className="font-medium mt-1 flex items-center gap-2">
                <Shield size={16} className="text-blue-600" /> Administrator
              </p>
            </div>
            <div className="p-4 border rounded-xl bg-zinc-50">
              <label className="text-xs font-bold text-zinc-400 uppercase">
                Bot Status
              </label>
              <div className="font-medium mt-1 flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>{" "}
                Online
              </div>
            </div>
            <div className="p-4 border rounded-xl bg-zinc-50">
              <label className="text-xs font-bold text-zinc-400 uppercase">
                Auth Method
              </label>
              <p className="font-medium mt-1 flex items-center gap-2">
                <LinkIcon size={16} /> Google OAuth
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
