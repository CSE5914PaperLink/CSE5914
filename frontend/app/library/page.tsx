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
    doc_id: string | null;
    year: number | null;
    abstract: string | null;
    ingestion_status: string;
    pdf_url: string | null;
    is_favorite?: boolean;
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
  const [paperImages, setPaperImages] = useState<Record<string, ImageAsset[]>>(
    {}
  );
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"title" | "year" | "added">("added");
  const [showFilters, setShowFilters] = useState(false);

  const fetchItems = async () => {
    if (!dataConnectUserId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`
      );
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
    const processingPapers = papers.filter(
      (p) => p.metadata.ingestion_status === "processing"
    );

    for (const paper of processingPapers) {
      if (!paper.metadata.doc_id) continue;

      try {
        const res = await fetch("/api/library/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paperId: paper.dataconnect_id,
            arxivId: paper.metadata.doc_id,
          }),
        });

        if (res.ok) {
          const statusData = await res.json();
          if (statusData.updated) {
            fetchItems();
            break;
          }
        }
      } catch (e) {
        console.error(
          `Failed to check status for ${paper.metadata.doc_id}:`,
          e
        );
      }
    }
  };

  const handleDelete = async (dataconnectId: string) => {
    if (
      !confirm("Are you sure you want to delete this paper from your library?")
    )
      return;

    try {
      await deletePaper({ paperId: dataconnectId });
      setItems(items.filter((p) => p.dataconnect_id !== dataconnectId));
    } catch (e) {
      alert("Failed to delete paper: " + (e as Error).message);
    }
  };

  const toggleFavorite = async (
    dataconnectId: string,
    currentFavorite: boolean
  ) => {
    try {
      const res = await fetch("/api/library/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: dataconnectId,
          isFavorite: !currentFavorite,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle favorite");

      // Update local state
      setItems(
        items.map((item) =>
          item.dataconnect_id === dataconnectId
            ? {
                ...item,
                metadata: {
                  ...item.metadata,
                  is_favorite: !currentFavorite,
                },
              }
            : item
        )
      );

      // Trigger profile page refresh
      window.dispatchEvent(new Event('libraryUpdated'));
      localStorage.setItem('library_updated', Date.now().toString());
    } catch (e) {
      alert("Failed to update favorite: " + (e as Error).message);
    }
  };

  const fetchImages = async (docId: string) => {
    if (paperImages[docId]) {
      // Already fetched, just toggle
      setExpandedPaperId(expandedPaperId === docId ? null : docId);
      return;
    }

    setLoadingImages((prev) => ({ ...prev, [docId]: true }));
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/library/images/${docId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // No images for this paper
          setPaperImages((prev) => ({ ...prev, [docId]: [] }));
        } else {
          throw new Error("Failed to fetch images");
        }
      } else {
        const data = await res.json();
        // Backend returns {doc_id, images}, extract images array
        const images = data.images || [];
        setPaperImages((prev) => ({ ...prev, [docId]: images }));
      }
      setExpandedPaperId(docId);
    } catch (e) {
      console.error("Error fetching images:", e);
      alert("Failed to load images: " + (e as Error).message);
    } finally {
      setLoadingImages((prev) => ({ ...prev, [docId]: false }));
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
    const hasProcessing = items.some(
      (item) => item.metadata.ingestion_status === "processing"
    );

    if (!hasProcessing) return;

    const interval = setInterval(() => {
      console.log("Auto-checking processing papers...");
      fetchItems();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [items, dataConnectUserId]);

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.metadata.title.toLowerCase().includes(query);
        const authors = item.metadata.authors;
        const authorsMatch = Array.isArray(authors)
          ? authors.some((author) => author.toLowerCase().includes(query))
          : (authors as string)?.toLowerCase().includes(query) || false;
        const docIdMatch = item.metadata.doc_id?.toLowerCase().includes(query);
        
        if (!titleMatch && !authorsMatch && !docIdMatch) {
          return false;
        }
      }
      
      // Status filter
      if (filterStatus !== "all" && item.metadata.ingestion_status !== filterStatus) {
        return false;
      }
      
      // Favorites filter
      if (filterFavorites && !item.metadata.is_favorite) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.metadata.title.localeCompare(b.metadata.title);
        case "year":
          return (b.metadata.year || 0) - (a.metadata.year || 0);
        case "added":
        default:
          return 0; // Keep original order (most recent first from API)
      }
    });

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
          <p className="text-gray-600 mb-4">
            Please sign in to view your library
          </p>
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="space-y-4">
            {/* Search Bar with Filter Button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or arXiv ID..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`relative px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  showFilters
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title="Toggle filters"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  ></path>
                </svg>
                {(filterStatus !== "all" || filterFavorites) && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
                    {(filterStatus !== "all" ? 1 : 0) + (filterFavorites ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Sort By:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "title" | "year" | "added")}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                    >
                      <option value="added">Recently Added</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="year">Year (Newest)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Status:
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Favorites Checkbox */}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterFavorites}
                      onChange={(e) => setFilterFavorites(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">⭐ Favorites Only</span>
                  </label>

                  {/* Clear Filters Button */}
                  {(filterStatus !== "all" || filterFavorites || sortBy !== "added") && (
                    <button
                      onClick={() => {
                        setFilterStatus("all");
                        setFilterFavorites(false);
                        setSortBy("added");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 underline font-medium ml-auto"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedItems.length} of {items.length} papers
            </div>
          </div>
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
        {items.length > 0 && filteredAndSortedItems.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-lg">No papers match your filters</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterFavorites(false);
                setSortBy("added");
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
        {!loading && filteredAndSortedItems.length > 0 && (
          <div className="space-y-4">
            {filteredAndSortedItems.map((item) => {
              const docId = item.id;
              const isExpanded = expandedPaperId === docId;
              const images = paperImages[docId] || [];
              const isLoadingImages = loadingImages[docId] || false;

              return (
                <div
                  key={item.dataconnect_id}
                  className="bg-white rounded-lg shadow p-6"
                >
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
                        {item.metadata.doc_id && (
                          <span>🆔 {item.metadata.doc_id}</span>
                        )}
                        {item.metadata.year && (
                          <span>📅 {item.metadata.year}</span>
                        )}
                        <span
                          className={`px-2 py-1 rounded ${
                            item.metadata.ingestion_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : item.metadata.ingestion_status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : item.metadata.ingestion_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.metadata.ingestion_status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.metadata.ingestion_status === "processing"
                            ? "⏳ Processing..."
                            : item.metadata.ingestion_status}
                        </span>
                        {item.in_chromadb && (
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                            ✓ In Vector DB
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-2">
                      <button
                        onClick={() =>
                          toggleFavorite(
                            item.dataconnect_id,
                            item.metadata.is_favorite || false
                          )
                        }
                        className={`px-3 py-2 text-sm rounded transition-colors ${
                          item.metadata.is_favorite
                            ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                        title={
                          item.metadata.is_favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {item.metadata.is_favorite ? "⭐" : "☆"}
                      </button>
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
                        <p className="text-sm text-gray-500 italic">
                          No images extracted from this paper.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-gray-700">
                            Extracted Images ({images.length})
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                              <div
                                key={idx}
                                className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                              >
                                <img
                                  src={`${
                                    process.env.NEXT_PUBLIC_BACKEND_URL ||
                                    "http://localhost:8000"
                                  }${img.url}`}
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
