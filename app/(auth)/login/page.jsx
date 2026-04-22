"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { supabase } from "../../lib/supabase";
import { ensureAdminToken } from "../../lib/db";
import Link from "next/link";

export default function Login() {
  const container = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setLoading(true);

        // 1. Ensure Admin Token exists in the DB
        await ensureAdminToken(session.user.id);

        // 2. Set the cookie for the Middleware
        document.cookie =
          "sb-access-auth-token=true; path=/; max-age=604800; SameSite=Lax";

        // 3. Redirect
        window.location.href = "/";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      // NOTE: onAuthStateChange above will handle the redirect and token generation
      // This ensures we don't have duplicate redirect logic
      console.log("Email login successful, waiting for auth state change...");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) setMessage({ type: "error", text: error.message });
  };

  return (
    <div
      ref={container}
      className="min-h-screen bg-zinc-50 flex items-center justify-center p-4"
    >
      <div className="auth-box max-w-md w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black tracking-tight">
            Welcome Back
          </h1>
          <p className="text-zinc-500 mt-2">Log in to your account</p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg mb-6 text-sm border ${message.type === "error" ? "bg-zinc-50 border-zinc-300 text-black" : "bg-black text-white"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition-all"
              placeholder="admin@company.com"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center"
          >
            {loading ? "Processing..." : "Sign In"}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-zinc-200 w-full"></div>
          <span className="bg-white px-3 text-sm text-zinc-400 absolute">
            OR
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-black font-medium py-2.5 rounded-lg transition-colors"
        >
          {/* Google Icon SVG */}
          Continue with Google
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-zinc-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-black hover:underline font-semibold"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
