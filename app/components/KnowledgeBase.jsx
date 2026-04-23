"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function KnowledgeBaseTable() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      // 1. Get the current logged-in Google User
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) return; // Exit if not logged in

      // 2. Fetch only the files where created_by matches the user.id
      const { data, error } = await supabase
        .from("ingested_files")
        .select("*")
        .eq("created_by", user.id) // <--- THIS PREVENTS THE LEAK
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-4 text-gray-500">Loading Knowledge Base...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg mt-8">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold text-gray-700">
          Active Knowledge Base
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Documents and websites currently loaded into the bot's memory.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/5 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Filename / Source</th>
              <th className="px-6 py-4 font-medium">Uploaded By</th>
              <th className="px-6 py-4 font-medium">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {files.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                  No files ingested yet. Use the Telegram bot to add context.
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-blue-400">
                    {file.filename}
                  </td>
                  <td className="px-6 py-4">
                    @{file.uploaded_by_username || "Unknown Admin"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(file.created_at).toLocaleDateString()} at{" "}
                    {new Date(file.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
