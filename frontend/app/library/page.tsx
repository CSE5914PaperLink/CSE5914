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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    try {
      await deletePaper({ paperId: dataconnectId });
      setItems(items.filter((p) => p.dataconnect_id !== dataconnectId));
      setDeleteConfirmId(null);
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
      window.dispatchEvent(new Event("libraryUpdated"));
      localStorage.setItem("library_updated", Date.now().toString());
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
      if (
        filterStatus !== "all" &&
        item.metadata.ingestion_status !== filterStatus
      ) {
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
    <main className="relative min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-blue-100/70 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-blue-500">
              Research Library
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-950">
              My Papers
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Browse ingested papers, track processing state, and curate your
              favorites.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                showFilters
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
              }`}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              onClick={fetchItems}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:translate-y-0.5"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-100">
          <div className="space-y-4">
            {/* Search Bar with Filter Button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or arXiv ID..."
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`relative inline-flex items-center justify-center rounded-2xl border px-4 py-2 font-semibold transition ${
                  showFilters
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
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
                    {(filterStatus !== "all" ? 1 : 0) +
                      (filterFavorites ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                      Sort By:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "title" | "year" | "added")
                      }
                      className="rounded-2xl border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="added">Recently Added</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="year">Year (Newest)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                      Status:
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="rounded-2xl border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">
                      ⭐ Favorites Only
                    </span>
                  </label>

                  {/* Clear Filters Button */}
                  {(filterStatus !== "all" ||
                    filterFavorites ||
                    sortBy !== "added") && (
                    <button
                      onClick={() => {
                        setFilterStatus("all");
                        setFilterFavorites(false);
                        setSortBy("added");
                      }}
                      className="ml-auto text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-slate-500">
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
        {items.length > 0 &&
          filteredAndSortedItems.length === 0 &&
          !loading && (
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
          <div className="space-y-5">
            {filteredAndSortedItems.map((item) => {
              const docId = item.id;
              const isExpanded = expandedPaperId === docId;
              const images = paperImages[docId] || [];
              const isLoadingImages = loadingImages[docId] || false;

              // Format authors with character limit
              const authorsString = Array.isArray(item.metadata.authors)
                ? item.metadata.authors.join(", ")
                : item.metadata.authors;
              const maxAuthorsLength = 150;
              const truncatedAuthors =
                authorsString.length > maxAuthorsLength
                  ? authorsString.slice(0, maxAuthorsLength) + "..."
                  : authorsString;

              return (
                <div
                  key={item.dataconnect_id}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-blue-500">
                        Paper
                        {item.metadata.year && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                            {item.metadata.year}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        {item.metadata.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {truncatedAuthors}
                      </p>
                      {item.metadata.abstract && (
                        <p className="mt-3 text-sm leading-relaxed text-slate-700 line-clamp-3">
                          {item.metadata.abstract}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {item.metadata.doc_id && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px]">
                            ID: {item.metadata.doc_id}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                            item.metadata.ingestion_status === "completed"
                              ? "bg-green-100 text-green-700"
                              : item.metadata.ingestion_status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : item.metadata.ingestion_status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.metadata.ingestion_status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.metadata.ingestion_status === "processing"
                            ? "⏳ Processing"
                            : item.metadata.ingestion_status}
                        </span>
                        {item.in_chromadb && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                            ✓ In Vector DB
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() =>
                          toggleFavorite(
                            item.dataconnect_id,
                            item.metadata.is_favorite || false
                          )
                        }
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                          item.metadata.is_favorite
                            ? "border border-yellow-200 bg-yellow-50 text-yellow-700"
                            : "border border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                        title={
                          item.metadata.is_favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {item.metadata.is_favorite ? "⭐" : "☆"}
                      </button>
                      <button
                        onClick={() => {
                          if (deleteConfirmId === item.dataconnect_id) {
                            handleDelete(item.dataconnect_id);
                          } else {
                            setDeleteConfirmId(item.dataconnect_id);
                          }
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                          deleteConfirmId === item.dataconnect_id
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        title="Delete paper"
                      >
                        {deleteConfirmId === item.dataconnect_id
                          ? "Click to confirm"
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* Image viewer dropdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
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
    </main>
  );
}
