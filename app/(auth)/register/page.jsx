"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function Register() {
  const container = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".auth-box",
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    },
    { scope: container },
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      // 1. Manually set the cookie
      document.cookie =
        "sb-access-auth-token=true; path=/; max-age=604800; SameSite=Lax";

      setMessage({ type: "success", text: "Success! Redirecting..." });

      // 2. Give the browser a moment to store the cookie before redirecting
      setTimeout(() => {
        window.location.replace("/"); // replace is better than href for auth
      }, 800);
    }
  };

  return (
    <div
      ref={container}
      className="min-h-screen bg-zinc-50 flex items-center justify-center p-4"
    >
      <div className="auth-box max-w-md w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black tracking-tight">
            Create Account
          </h1>
          <p className="text-zinc-500 mt-2">Sign up to get your bot access</p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg mb-6 text-sm border ${message.type === "error" ? "bg-zinc-50 border-zinc-300 text-black" : "bg-black text-white"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition-all"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-black hover:underline font-semibold"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
