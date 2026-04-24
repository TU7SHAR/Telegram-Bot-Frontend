"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Sliders,
  MessageSquare,
  ShieldAlert,
  Save,
  Loader2,
  Database,
  ScrollText,
} from "lucide-react";

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);

  // Future-proofing for a 'bot_settings' Supabase table
  const [settings, setSettings] = useState({
    welcomeMessage:
      "Welcome to the Drish Infotech Knowledge Assistant. Send me a question to get started!",
    temperature: 0.2,
    verbosity: "Standard",
    strictKnowledge: true,
    logHistory: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate database save
    setTimeout(() => {
      setIsSaving(false);
      alert("Preferences saved successfully!");
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-2 mb-10 border-b border-zinc-200 pb-6">
        <h1 className="text-4xl font-bold text-black tracking-tight flex items-center gap-3">
          <SettingsIcon size={36} />
          Bot Preferences
        </h1>
        <p className="text-zinc-500 mt-2">
          Customize the chat experience, RAG boundaries, and global toggles.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* AI & RAG Behavior */}
        <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <Database className="text-zinc-400" size={24} />
            <h2 className="text-xl font-semibold text-black">
              AI & Retrieval Behavior
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Creativity (Temperature)
                </label>
                <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-600">
                  {settings.temperature}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                Lower values (0.1 - 0.3) make the bot strict and factual. Higher
                values (0.7+) make it more creative.
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>

            {/* Strict Knowledge Toggle */}
            <div className="flex items-center justify-between p-4 border border-zinc-100 rounded-xl bg-zinc-50">
              <div className="flex items-start gap-4">
                <ScrollText className="text-blue-500 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-black">
                    Strict Knowledge Base Mode
                  </h3>
                  <p className="text-sm text-zinc-500">
                    If enabled, the bot will refuse to answer questions that are
                    not found within your uploaded files.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.strictKnowledge}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      strictKnowledge: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Global Controls */}
        <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <Sliders className="text-zinc-400" size={24} />
            <h2 className="text-xl font-semibold text-black">
              Global Controls
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Toggle: Chat Logging */}
            <div className="flex items-center justify-between p-4 border border-zinc-100 rounded-xl bg-zinc-50 hover:bg-zinc-100/50 transition-colors">
              <div>
                <h3 className="font-medium text-black">Log Chat Analytics</h3>
                <p className="text-sm text-zinc-500">
                  Save user queries to the database to analyze what people are
                  asking the bot.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.logHistory}
                  onChange={(e) =>
                    setSettings({ ...settings, logHistory: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {/* Toggle: Maintenance Mode */}
            <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50/50">
              <div className="flex items-start gap-4">
                <ShieldAlert className="text-red-500 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-red-900">Maintenance Mode</h3>
                  <p className="text-sm text-red-700/80">
                    Temporarily block all non-admin users from talking to the
                    bot.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
