"use client";

import { CreditCard, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-2 mb-10 border-b border-zinc-200 pb-6">
        <h1 className="text-4xl font-bold text-black tracking-tight flex items-center gap-3">
          <CreditCard size={36} />
          Billing & Usage
        </h1>
        <p className="text-zinc-500 mt-2">
          Monitor your RAG query usage and manage your subscription plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Plan Card */}
        <div className="md:col-span-2 bg-black text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>

          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            Current Plan
          </span>
          <h2 className="text-4xl font-bold mb-2">Enterprise Pro</h2>
          <p className="text-zinc-400 mb-8">Next billing date: May 24, 2026</p>

          <button className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors">
            Manage Subscription
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 text-zinc-500">
            <Zap size={20} className="text-amber-500" />
            <span className="font-medium text-sm">LLM Queries (Groq)</span>
          </div>
          <h3 className="text-3xl font-bold text-black mb-1">4,281</h3>
          <p className="text-xs text-zinc-400">/ 10,000 monthly limit</p>

          <div className="w-full bg-zinc-100 rounded-full h-2 mt-4">
            <div
              className="bg-amber-500 h-2 rounded-full"
              style={{ width: "42%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <h2 className="text-xl font-semibold text-black mb-6">Plan Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-500 shrink-0" />
            <p className="text-sm text-zinc-600">
              <span className="font-bold text-black">
                Unlimited Knowledge Base
              </span>{" "}
              storage (Vector DB)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-500 shrink-0" />
            <p className="text-sm text-zinc-600">
              <span className="font-bold text-black">
                10,000 High-speed Queries
              </span>{" "}
              per month via Groq API
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-500 shrink-0" />
            <p className="text-sm text-zinc-600">
              <span className="font-bold text-black">Web Crawling</span> enabled
              via FireCrawl Integration
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 shrink-0" />
            <p className="text-sm text-zinc-600">
              Rate limits (429 errors) apply after 30 concurrent users.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
