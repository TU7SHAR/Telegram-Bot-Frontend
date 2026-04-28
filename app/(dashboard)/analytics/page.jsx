"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AnalyticsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);

    // Fetch all test results, ordered by newest first
    const { data, error } = await supabase
      .from("test_results")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setResults(data);
    } else {
      console.error("Error fetching test results:", error);
    }

    setLoading(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-black tracking-tight">
            Sales Team Analytics
          </h1>
          <p className="text-zinc-500 mt-2">
            Review test scores, specific user answers, and AI evaluations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
          </div>
        ) : results.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-zinc-400 font-medium">
              No test results found yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {results.map((result) => (
              <div key={result.id} className="flex flex-col">
                {/* --- HEADER ROW (Always Visible) --- */}
                <div
                  onClick={() => toggleExpand(result.id)}
                  className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      <BrainCircuit size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/users/${result.telegram_id}`}
                          onClick={(e) => e.stopPropagation()} // Prevents the accordion from expanding when clicking the link
                          className="font-semibold text-black flex items-center gap-2 hover:text-blue-600 hover:underline transition-colors"
                        >
                          <User size={16} className="text-zinc-400" />
                          ID: {result.telegram_id}
                        </Link>
                        <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                          {result.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <span>
                          {new Date(result.created_at).toLocaleDateString()} at{" "}
                          {new Date(result.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
                        Score
                      </span>
                      <span
                        className={`text-lg font-black ${
                          result.score >= 2 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {result.score} / {result.total_questions}
                      </span>
                    </div>
                    <button className="text-zinc-400 group-hover:text-black transition-colors">
                      {expandedId === result.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* --- EXPANDED DETAILS SECTION --- */}
                {expandedId === result.id && (
                  <div className="p-6 bg-zinc-50 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Q&A Column */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-black uppercase tracking-wider border-b border-zinc-200 pb-2">
                        Questions & User Answers
                      </h4>
                      {result.qa_data?.questions?.map((q, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-black mb-2">
                            Q{idx + 1}: {q}
                          </p>
                          <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                            <p className="text-sm text-zinc-700">
                              <span className="font-bold text-blue-600 mr-2">
                                Answer:
                              </span>
                              {result.qa_data.user_answers[idx] ||
                                "No answer provided."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Remarks Column */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-black uppercase tracking-wider border-b border-zinc-200 pb-2">
                        AI Evaluator Remarks
                      </h4>
                      <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm h-full">
                        <div className="prose prose-sm text-zinc-700 whitespace-pre-wrap">
                          {result.remarks.replace(/SCORE:.*$/m, "").trim()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
