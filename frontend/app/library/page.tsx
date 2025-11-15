"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { deletePaper } from "@/src/dataconnect-generated";

interface LibraryItem {
  id: string;
  dataconnect_id: string;
  metadata: {
    title: string;
    authors: string[];
    arxiv_id: string | null;
    year: number | null;
    abstract: string | null;
    ingestion_status: string;
    pdf_url: string | null;
  };
  document?: string | null;
  in_chromadb: boolean;
}

export default function LibraryPage() {
  const { dataConnectUserId, loading: userLoading } = useUser();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!dataConnectUserId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load library");
      setItems(data.results || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dataconnectId: string) => {
    if (!confirm("Are you sure you want to delete this paper from your library?")) return;
    
    try {
      await deletePaper({ paperId: dataconnectId });
      setItems(items.filter(p => p.dataconnect_id !== dataconnectId));
    } catch (e) {
      alert("Failed to delete paper: " + (e as Error).message);
    }
  };

  useEffect(() => {
    if (dataConnectUserId) {
      fetchItems();
    }
  }, [dataConnectUserId]);

  if (userLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!dataConnectUserId) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your library</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Library</h1>
            <p className="text-gray-600">Your ingested arXiv papers</p>
          </div>
          <button
            onClick={fetchItems}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {items.length === 0 && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            No papers added yet. Go to Discovery to add papers.
          </div>
        )}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.dataconnect_id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.metadata.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {Array.isArray(item.metadata.authors) 
                      ? item.metadata.authors.join(", ")
                      : item.metadata.authors}
                  </p>
                  {item.metadata.abstract && (
                    <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                      {item.metadata.abstract}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3 items-center">
                    {item.metadata.arxiv_id && (
                      <span>🆔 {item.metadata.arxiv_id}</span>
                    )}
                    {item.metadata.year && (
                      <span>📅 {item.metadata.year}</span>
                    )}
                    <span className={`px-2 py-1 rounded ${
                      item.metadata.ingestion_status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : item.metadata.ingestion_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.metadata.ingestion_status}
                    </span>
                    {item.in_chromadb && (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                        ✓ In Vector DB
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.dataconnect_id)}
                  className="shrink-0 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  title="Delete paper"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
