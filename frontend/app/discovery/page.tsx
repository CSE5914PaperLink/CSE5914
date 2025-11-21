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
  const [libraryPaperIds, setLibraryPaperIds] = useState<Set<string>>(
    new Set()
  );

  // Fetch library papers to check which ones user already has
  useEffect(() => {
    if (!dataConnectUserId) return;

    const fetchLibraryPapers = async () => {
      try {
        const res = await fetch(
          `/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`
        );
        if (res.ok) {
          const data = await res.json();
          const items = data.results || [];
          const paperIds = new Set(
            items
              .map((item: any) => item.metadata?.doc_id)
              .filter((id: string | null) => id != null)
          );
          setLibraryPaperIds(paperIds);
        }
      } catch (err) {
        console.error("Failed to fetch library papers:", err);
      }
    };

    fetchLibraryPapers();
  }, [dataConnectUserId]);

  // Fetch search history and top topics to generate recommendations
  useEffect(() => {
    if (!dataConnectUserId) return;

    const fetchRecommendations = async () => {
      try {
        // Fetch search history
        const historyRes = await fetch(
          `/api/discovery/search-history?userId=${encodeURIComponent(
            dataConnectUserId
          )}`
        );
        const historyData = (await historyRes.ok)
          ? await historyRes.json()
          : { history: [] };
        const searchHistory = historyData.history || [];

        // Fetch library papers to compute top topics
        const libraryRes = await fetch(
          `/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`
        );
        const libraryData = (await libraryRes.ok)
          ? await libraryRes.json()
          : { results: [] };
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
            if (
              word.length > 4 &&
              !["using", "based", "paper", "study", "analysis"].includes(word)
            ) {
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
      // Add to library set
      setLibraryPaperIds((prev) => new Set(prev).add(arxivId));
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

  const appliedFilterCount =
    (filters.from_date ? 1 : 0) +
    (filters.to_date ? 1 : 0) +
    (filters.min_citations ? 1 : 0) +
    (filters.is_oa ? 1 : 0) +
    (filters.has_fulltext ? 1 : 0);

  const filterChips = (
    [
      filters.from_date ? `From ${filters.from_date}` : null,
      filters.to_date ? `To ${filters.to_date}` : null,
      filters.min_citations ? `≥ ${filters.min_citations} citations` : null,
      filters.is_oa ? "Open Access" : null,
      filters.has_fulltext ? "Has full text" : null,
    ] as (string | null)[]
  ).filter((chip): chip is string => Boolean(chip));

  const hasRecommendations =
    Boolean(dataConnectUserId) && recommendedSearches.length > 0;

  const showEmptyState = papers.length === 0 && !loading && !error;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-50/80 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <p className="text-blue-600 uppercase text-xs tracking-[0.4em]">
            Research Explorer
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 text-slate-950">
            Discover Papers
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Search arXiv, review abstracts, and add the best papers directly to
            your library. Filters, recommendations, and PDF previews keep you in
            the flow.
          </p>
        </header>

        <section className="bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-blue-100/50 p-6 md:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                    Search library & arXiv
                  </label>
                  {hasRecommendations && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowRecommendations(!showRecommendations)
                      }
                      className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-500 hover:text-blue-600"
                    >
                      {showRecommendations ? "Hide" : "Show"} suggestions
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by keyword, author, or topic"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-base text-slate-900 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    />
                    <svg
                      className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                    >
                      <svg
                        className="h-5 w-5 text-slate-500"
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
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`relative inline-flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 font-semibold transition ${
                        showFilters
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                      title="Toggle filters"
                    >
                      <svg
                        className="h-5 w-5"
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
                      {appliedFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                          {appliedFilterCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300/50 transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showRecommendations && hasRecommendations && (
              <div className="rounded-2xl border border-yellow-100 bg-yellow-50/70 p-4 text-sm text-yellow-900">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-600">
                  <span>Suggested searches</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendedSearches.map((term, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => handleRecommendedSearch(term)}
                      className="cursor-pointer rounded-full border border-yellow-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-yellow-900 transition hover:border-yellow-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showFilters && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Advanced filters
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filters.from_date || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, from_date: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filters.to_date || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, to_date: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
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
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={filters.is_oa || false}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          is_oa: e.target.checked ? true : undefined,
                        })
                      }
                      className="rounded border-slate-300"
                    />
                    Open Access Only
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={filters.has_fulltext || false}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          has_fulltext: e.target.checked ? true : undefined,
                        })
                      }
                      className="rounded border-slate-300"
                    />
                    Has Full Text
                  </label>
                </div>
              </div>
            )}
          </form>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="mt-12 space-y-5">
          {loading && (
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-blue-700 shadow-sm">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
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
              Fetching the latest papers...
            </div>
          )}

          {filterChips.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {filterChips.map((chip, index) => (
                <span
                  key={index}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium shadow-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {showEmptyState && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center text-slate-500">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-slate-300"
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
              <p className="text-lg font-semibold text-slate-700">
                Start by searching for papers above
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Use filters or try suggested terms to narrow down to the most
                relevant work.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {papers.map((paper) => {
              const isInLibrary = libraryPaperIds.has(paper.doc_id);

              return (
                <article
                  key={paper.doc_id}
                  className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200 transition hover:-translate-y-0.5 hover:shadow-2xl ${
                    isInLibrary ? "ring-1 ring-green-400/70" : ""
                  }`}
                >
                  {isInLibrary && (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Already in your library
                    </div>
                  )}
                  <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-blue-500">
                        arXiv #{paper.doc_id}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        {paper.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-slate-600">
                        {paper.authors.slice(0, 5).join(", ")}
                        {paper.authors.length > 5 &&
                          ` +${paper.authors.length - 5} more`}
                      </p>
                      {paper.published && (
                        <p className="mt-1 text-xs text-slate-500">
                          Published {paper.published.split("T")[0]}
                        </p>
                      )}
                      <p className="mt-4 text-sm leading-relaxed text-slate-700">
                        {truncate(paper.summary || "No abstract available")}
                      </p>
                    </div>
                    <div className="flex w-full flex-col items-stretch gap-3 md:w-48">
                      <button
                        type="button"
                        onClick={() => handleAddPaper(paper.doc_id)}
                        disabled={
                          processingPapers.has(paper.doc_id) || isInLibrary
                        }
                        className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          isInLibrary
                            ? "border border-green-200 bg-green-50 text-green-700"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        }`}
                        title={
                          isInLibrary
                            ? "Already in library"
                            : "Add to collection"
                        }
                      >
                        {processingPapers.has(paper.doc_id) ? (
                          <svg
                            className="h-5 w-5 animate-spin"
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
                        ) : isInLibrary ? (
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span>Add to library</span>
                        )}
                      </button>
                      {paper.pdf_url && (
                        <a
                          href={paper.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                        >
                          Quick view PDF
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 10l4.553-1.138a1 1 0 01.962 1.68l-9 10.5a1 1 0 01-1.65-.117L7 16l-4.553 1.138a1 1 0 01-.962-1.68l9-10.5a1 1 0 011.65.117L15 10z"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
