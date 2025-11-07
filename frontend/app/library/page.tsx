"use client";

import { useEffect, useState } from "react";

type Metadata = { [key: string]: string | number | boolean | null | undefined };

interface LibraryItem {
  id: string;
  metadata: Metadata;
  document?: string | null;
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/library/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load library");
      setItems(data.results || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
            No papers added yet.
          </div>
        )}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.metadata.title || item.metadata.arxiv_id || item.id}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.metadata.authors ||
                      item.metadata.author ||
                      item.metadata.arxiv_id}
                  </p>
                  {item.document && (
                    <p className="text-gray-700 text-sm whitespace-pre-line">
                      {item.document}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3">
                    {item.metadata.arxiv_id && (
                      <span>🆔 {item.metadata.arxiv_id}</span>
                    )}
                    {item.metadata.length && (
                      <span>📝 {item.metadata.length} chars</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
