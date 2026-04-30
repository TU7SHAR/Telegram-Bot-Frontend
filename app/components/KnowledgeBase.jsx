"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, Loader2, FileText, CheckSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import { applyFiltersAndSort } from "../utils/sortUtils";
import { DB } from "@/app/lib/schema_map";

export default function KnowledgeBaseTable() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Selection State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false); // Tracks if checkboxes should be visible

  // Sorting & Filtering State using DB Schema Map
  const [sortConfig, setSortConfig] = useState({
    key: DB.FILES.CREATED_AT,
    direction: "desc",
    filterKey: DB.FILES.CATEGORY,
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
      .from(DB.FILES.TABLE)
      .select("*")
      .eq(DB.FILES.CREATED_BY, user.id)
      .order(DB.FILES.CREATED_AT, { ascending: false });

    if (!error) setFiles(data);
    setLoading(false);
  };

  // --- SELECTION LOGIC ---
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedFiles([]); // Clear selections when turning off select mode
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFiles(displayedFiles.map((file) => file[DB.FILES.ID]));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedFiles((prev) =>
      prev.includes(id)
        ? prev.filter((fileId) => fileId !== id)
        : [...prev, id],
    );
  };

  // --- DELETE LOGIC ---
  const deleteFile = async (id, filename) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${filename}" from the Knowledge Base?`,
    );
    if (!confirmDelete) return;

    setDeletingId(id);

    try {
      const { error } = await supabase
        .from(DB.FILES.TABLE)
        .delete()
        .eq(DB.FILES.ID, id);

      if (error) throw error;
      setFiles((prevFiles) => prevFiles.filter((f) => f[DB.FILES.ID] !== id));
      setSelectedFiles((prev) => prev.filter((fileId) => fileId !== id));
    } catch (err) {
      console.error("Error deleting file:", err);
      alert(`Failed to delete file: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedFiles.length} selected files?`,
    );
    if (!confirmDelete) return;

    setIsDeletingBulk(true);

    try {
      const { error } = await supabase
        .from(DB.FILES.TABLE)
        .delete()
        .in(DB.FILES.ID, selectedFiles);

      if (error) throw error;

      setFiles((prevFiles) =>
        prevFiles.filter((f) => !selectedFiles.includes(f[DB.FILES.ID])),
      );
      setSelectedFiles([]);
      setIsSelectMode(false); // Turn off select mode after successful bulk delete
    } catch (err) {
      console.error("Error with bulk delete:", err);
      alert(`Failed to delete multiple files: ${err.message}`);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  // Get unique categories for the dropdown filter using DB Schema Map
  const uniqueCategories = [
    "All",
    ...new Set(files.map((file) => file[DB.FILES.CATEGORY] || "General")),
  ];

  const displayedFiles = useMemo(() => {
    return applyFiltersAndSort(files, sortConfig);
  }, [files, sortConfig]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 mb-10 border-b border-zinc-200 pb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-zinc-500 mt-2">
              Manage the documents currently stored in the RAG bot's memory.
            </p>
          </div>
        </div>

        {/* Filters, Sorting UI, and Select Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <select
              className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer"
              onChange={(e) =>
                setSortConfig({
                  ...sortConfig,
                  filterKey: DB.FILES.CATEGORY,
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
              className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer"
              onChange={(e) =>
                setSortConfig({
                  ...sortConfig,
                  key: DB.FILES.CREATED_AT,
                  direction: e.target.value,
                })
              }
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            <select
              className="border border-zinc-200 bg-white px-4 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer"
              onChange={(e) =>
                setSortConfig({
                  ...sortConfig,
                  key: DB.FILES.FILENAME,
                  direction: e.target.value,
                })
              }
            >
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
          </div>

          {/* --- Select Mode Button --- */}
          {!loading && displayedFiles.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all border ${
                isSelectMode
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <CheckSquare size={16} />
              {isSelectMode ? "Cancel Selection" : "Select Files"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        {/* --- BULK ACTION HEADER (Only visible in Select Mode) --- */}
        {isSelectMode && !loading && displayedFiles.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50/50 border-b border-zinc-100">
            <div className="flex items-center gap-3 ml-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-300 text-black cursor-pointer"
                checked={
                  displayedFiles.length > 0 &&
                  selectedFiles.length === displayedFiles.length
                }
                onChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-zinc-700">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} selected`
                  : "Select All"}
              </span>
            </div>

            {selectedFiles.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isDeletingBulk ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete Selected
              </button>
            )}
          </div>
        )}

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
                key={file[DB.FILES.ID]}
                className={`p-5 flex items-center justify-between transition-colors group ${
                  selectedFiles.includes(file[DB.FILES.ID])
                    ? "bg-blue-50/30"
                    : "hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* --- INDIVIDUAL CHECKBOX (Only visible in Select Mode) --- */}
                  {isSelectMode && (
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-zinc-300 text-black cursor-pointer ml-1 transition-all"
                      checked={selectedFiles.includes(file[DB.FILES.ID])}
                      onChange={() => handleSelect(file[DB.FILES.ID])}
                    />
                  )}

                  <div
                    className={`p-3 rounded-xl transition-colors ${selectedFiles.includes(file[DB.FILES.ID]) ? "bg-blue-100 text-blue-500" : "bg-zinc-100 text-zinc-400"}`}
                  >
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-black">
                        {file[DB.FILES.FILENAME]}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                        {file[DB.FILES.CATEGORY] || "General"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <span>
                        Uploaded by @
                        {file[DB.FILES.UPLOADED_BY_USER] || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(
                          file[DB.FILES.CREATED_AT],
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Delete Button - Disabled during bulk delete */}
                <button
                  onClick={() =>
                    deleteFile(file[DB.FILES.ID], file[DB.FILES.FILENAME])
                  }
                  disabled={deletingId === file[DB.FILES.ID] || isDeletingBulk}
                  className={`p-2.5 rounded-xl transition-all ${
                    deletingId === file[DB.FILES.ID]
                      ? "text-red-500 bg-red-50 cursor-not-allowed"
                      : "text-zinc-300 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title="Delete File"
                >
                  {deletingId === file[DB.FILES.ID] ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
