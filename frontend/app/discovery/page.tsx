"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

interface ArxivResult {
  doc_id: string;
  title: string;
  summary: string;
  published?: string;
  authors: string[];
  pdf_url?: string | null;
}

interface SearchFilters {
  from_date?: string;
  to_date?: string;
  min_citations?: number;
  is_oa?: boolean;
  has_fulltext?: boolean;
}

export default function DiscoveryPage() {
  const { dataConnectUserId, firebaseUser } = useUser();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [papers, setPapers] = useState<ArxivResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPapers, setProcessingPapers] = useState<Set<string>>(
    new Set()
  );
  const [recommendedSearches, setRecommendedSearches] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Fetch search history and top topics to generate recommendations
  useEffect(() => {
    if (!dataConnectUserId) return;

    const fetchRecommendations = async () => {
      try {
        // Fetch search history
        const historyRes = await fetch(
          `/api/discovery/search-history?userId=${encodeURIComponent(dataConnectUserId)}`
        );
        const historyData = await historyRes.ok ? await historyRes.json() : { history: [] };
        const searchHistory = historyData.history || [];

        // Fetch library papers to compute top topics
        const libraryRes = await fetch(
          `/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`
        );
        const libraryData = await libraryRes.ok ? await libraryRes.json() : { results: [] };
        const items = libraryData.results || [];

        // Extract search terms from history
        const historyTerms = searchHistory
          .map((entry: any) => entry.query)
          .filter((q: string) => q && q.trim().length > 0);

        // Compute top topics from library paper titles
        const tagCounts: Record<string, number> = {};
        items.forEach((item: any) => {
          const titleWords = (item?.metadata?.title || "")
            .toLowerCase()
            .split(/[\s:,-]+/);
          titleWords.forEach((word: string) => {
            // Filter out short words and common stop words
            if (word.length > 4 && !["using", "based", "paper", "study", "analysis"].includes(word)) {
              tagCounts[word] = (tagCounts[word] || 0) + 1;
            }
          });
        });

        // Get top topics
        const topTopics = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name]) => name);

        // Combine and deduplicate recommendations
        const combined = [...new Set([...historyTerms, ...topTopics])];
        
        // Take top 6 recommendations
        setRecommendedSearches(combined.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    };

    fetchRecommendations();
  }, [dataConnectUserId]);

  const truncate = (text: string, n = 300) =>
    text.length > n ? text.slice(0, n) + "..." : text;

  const handleRecommendedSearch = async (searchTerm: string) => {
    setQuery(searchTerm);
    setShowRecommendations(false);
    
    // Perform the search with the recommended term
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: searchTerm, max_results: "10" });
      const res = await fetch(`/api/discovery/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }
      const data = await res.json();
      const results = data.results || [];
      setPapers(results);

      // Save search to history if user is logged in
      if (dataConnectUserId) {
        fetch("/api/discovery/save-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: dataConnectUserId,
            query: searchTerm.trim(),
            resultsCount: results.length,
          }),
        }).catch((err) => console.error("Failed to save search history:", err));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search papers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query, max_results: "10" });
      const res = await fetch(`/api/discovery/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }
      const data = await res.json();
      const results = data.results || [];
      setPapers(results);

      // Save search to history if user is logged in
      if (dataConnectUserId) {
        fetch("/api/discovery/save-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: dataConnectUserId,
            query: query.trim(),
            resultsCount: results.length,
          }),
        }).catch((err) => console.error("Failed to save search history:", err));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search papers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaper = async (arxivId: string) => {
    if (!dataConnectUserId) {
      alert("Please sign in to add papers to your library");
      return;
    }

    // Add to processing set
    setProcessingPapers((prev) => new Set(prev).add(arxivId));

    try {
      const res = await fetch(
        `/api/library/add?doc_id=${encodeURIComponent(
          arxivId
        )}&user_id=${encodeURIComponent(dataConnectUserId)}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add paper");
      }
      alert("Paper added to library successfully!");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setProcessingPapers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(arxivId);
        return newSet;
      });
    }
  };

  const handleUpload = () => {
    // Placeholder for file upload
    alert("Upload functionality coming soon");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Papers
          </h1>
          <p className="text-gray-600">
            Search arXiv papers and build your collection
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              {/* Light Bulb Icon for Recommendations */}
              {dataConnectUserId && recommendedSearches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className={`p-3 rounded-lg transition-colors ${
                    showRecommendations
                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Show recommended searches"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"
                    />
                  </svg>
                </button>
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for papers by keyword, author, or topic..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="button"
                onClick={handleUpload}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-black"
                title="Upload PDF"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                Upload
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {/* Recommended Searches */}
            {showRecommendations && dataConnectUserId && recommendedSearches.length > 0 && (
              <div className="mb-3 pb-3 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  💡 Recommended searches based on your history and topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendedSearches.map((term, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => handleRecommendedSearch(term)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-medium transition-colors border border-blue-200 hover:border-blue-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
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
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.from_date || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, from_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.to_date || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, to_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Citations
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.min_citations || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        min_citations: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={filters.is_oa || false}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          is_oa: e.target.checked ? true : undefined,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    Open Access Only
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={filters.has_fulltext || false}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          has_fulltext: e.target.checked ? true : undefined,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    Has Full Text
                  </label>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {papers.length === 0 && !loading && !error && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <p className="text-lg">Start by searching for papers above</p>
            </div>
          )}

          {papers.map((paper) => (
            <div
              key={paper.doc_id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {paper.authors.slice(0, 5).join(", ")}
                    {paper.authors.length > 5 &&
                      ` +${paper.authors.length - 5} more`}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    {truncate(paper.summary || "No abstract available")}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {paper.published && (
                      <span>📅 {paper.published.split("T")[0]}</span>
                    )}
                    {paper.pdf_url && (
                      <a
                        href={paper.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddPaper(paper.doc_id)}
                  disabled={processingPapers.has(paper.doc_id)}
                  className="shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Add to collection"
                >
                  {processingPapers.has(paper.doc_id) ? (
                    <svg
                      className="w-5 h-5 animate-spin"
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
                  ) : (
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
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
