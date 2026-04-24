"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, Loader2, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
import { applyFiltersAndSort } from "../utils/sortUtils";

export default function KnowledgeBaseTable() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Filtering State
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
    filterKey: "category",
    filterValue: "All",
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("ingested_files")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (!error) setFiles(data);
    setLoading(false);
  };

  const deleteFile = async (id) => {
    const { error } = await supabase
      .from("ingested_files")
      .delete()
      .eq("id", id);
    if (!error) {
      setFiles(files.filter((f) => f.id !== id));
    }
  };

  // Get unique categories for the dropdown filter
  const uniqueCategories = [
    "All",
    ...new Set(files.map((file) => file.category || "General")),
  ];

  const displayedFiles = useMemo(() => {
    return applyFiltersAndSort(files, sortConfig);
  }, [files, sortConfig]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-black tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-zinc-500 mt-2">
            Manage the documents currently stored in the RAG bot's memory.
          </p>
        </div>

        {/* Filters and Sorting UI */}
        <div className="flex gap-3">
          <select
            className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none"
            onChange={(e) =>
              setSortConfig({
                ...sortConfig,
                filterKey: "category",
                filterValue: e.target.value,
              })
            }
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <select
            className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none"
            onChange={(e) =>
              setSortConfig({
                ...sortConfig,
                key: "created_at",
                direction: e.target.value,
              })
            }
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <select
            className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none"
            onChange={(e) =>
              setSortConfig({
                ...sortConfig,
                key: "filename",
                direction: e.target.value,
              })
            }
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
          </div>
        ) : displayedFiles.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-zinc-400 font-medium">
              No files found matching your filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {displayedFiles.map((file) => (
              <div
                key={file.id}
                className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-100 p-3 rounded-xl text-zinc-400">
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-black">
                        {file.filename}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                        {file.category || "General"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <span>
                        Uploaded by @{file.uploaded_by_username || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-2.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete File"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
