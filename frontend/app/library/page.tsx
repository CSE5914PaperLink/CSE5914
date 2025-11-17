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

interface ImageAsset {
  filename: string;
  url: string;
  media_type?: string;
  page?: number;
  doc_id?: string;
}

export default function LibraryPage() {
  const { dataConnectUserId, loading: userLoading } = useUser();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [paperImages, setPaperImages] = useState<Record<string, ImageAsset[]>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const fetchItems = async () => {
    if (!dataConnectUserId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load library");
      setItems(data.results || []);
      
      // Check status of any processing papers
      await checkProcessingPapers(data.results || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const checkProcessingPapers = async (papers: LibraryItem[]) => {
    const processingPapers = papers.filter(p => p.metadata.ingestion_status === 'processing');
    
    for (const paper of processingPapers) {
      if (!paper.metadata.arxiv_id) continue;
      
      try {
        const res = await fetch('/api/library/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paperId: paper.dataconnect_id,
            arxivId: paper.metadata.arxiv_id
          })
        });
        
        if (res.ok) {
          const statusData = await res.json();
          if (statusData.updated) {
            // Refresh the list to show updated status
            fetchItems();
            break; // Only refresh once
          }
        }
      } catch (e) {
        console.error(`Failed to check status for ${paper.metadata.arxiv_id}:`, e);
      }
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

  const fetchImages = async (docId: string) => {
    if (paperImages[docId]) {
      // Already fetched, just toggle
      setExpandedPaperId(expandedPaperId === docId ? null : docId);
      return;
    }

    setLoadingImages(prev => ({ ...prev, [docId]: true }));
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/library/images/${docId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // No images for this paper
          setPaperImages(prev => ({ ...prev, [docId]: [] }));
        } else {
          throw new Error("Failed to fetch images");
        }
      } else {
        const data = await res.json();
        // Backend returns {doc_id, images}, extract images array
        const images = data.images || [];
        setPaperImages(prev => ({ ...prev, [docId]: images }));
      }
      setExpandedPaperId(docId);
    } catch (e) {
      console.error("Error fetching images:", e);
      alert("Failed to load images: " + (e as Error).message);
    } finally {
      setLoadingImages(prev => ({ ...prev, [docId]: false }));
    }
  };

  const toggleImages = (docId: string) => {
    if (expandedPaperId === docId) {
      setExpandedPaperId(null);
    } else {
      fetchImages(docId);
    }
  };

  useEffect(() => {
    if (dataConnectUserId && items.length === 0) {
      fetchItems();
    }
  }, [dataConnectUserId]);

  // Auto-refresh when there are processing papers
  useEffect(() => {
    const hasProcessing = items.some(item => item.metadata.ingestion_status === 'processing');
    
    if (!hasProcessing) return;
    
    const interval = setInterval(() => {
      console.log("Auto-checking processing papers...");
      fetchItems();
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [items, dataConnectUserId]);

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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg
              className="w-12 h-12 animate-spin text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {items.length === 0 && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            No papers added yet. Go to Discovery to add papers.
          </div>
        )}
        {!loading && (
          <div className="space-y-4">
          {items.map((item) => {
            const docId = item.id;
            const isExpanded = expandedPaperId === docId;
            const images = paperImages[docId] || [];
            const isLoadingImages = loadingImages[docId] || false;
            
            return (
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
                          : item.metadata.ingestion_status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : item.metadata.ingestion_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : item.metadata.ingestion_status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.metadata.ingestion_status === 'processing' ? '⏳ Processing...' : item.metadata.ingestion_status}
                      </span>
                      {item.in_chromadb && (
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                          ✓ In Vector DB
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    {/* <button
                      onClick={() => toggleImages(docId)}
                      className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                      title="View images"
                      disabled={isLoadingImages}
                    >
                      {isLoadingImages ? "Loading..." : isExpanded ? "Hide Images" : "View Images"}
                    </button> */}
                    <button
                      onClick={() => handleDelete(item.dataconnect_id)}
                      className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                      title="Delete paper"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Image viewer dropdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {images.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No images extracted from this paper.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-gray-700">
                          Extracted Images ({images.length})
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {images.map((img, idx) => (
                            <div key={idx} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                              <img
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${img.url}`}
                                alt={img.filename}
                                className="w-full h-48 object-contain bg-white p-2"
                                loading="lazy"
                              />
                              <div className="px-2 py-2 bg-gray-100">
                                <div className="text-xs font-medium text-gray-700 truncate">
                                  {img.filename}
                                </div>
                                {img.page !== undefined && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Page {img.page}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
