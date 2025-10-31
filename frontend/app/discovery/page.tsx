"use client";

import { useState } from "react";

interface OpenAlexWork {
  id: string;
  title: string;
  authorships: Array<{
    author: {
      display_name: string;
    };
  }>;
  abstract_inverted_index?: Record<string, number[]>;
  publication_date?: string;
  cited_by_count?: number;
}

interface SearchFilters {
  from_date?: string;
  to_date?: string;
  min_citations?: number;
  is_oa?: boolean;
  has_fulltext?: boolean;
}

export default function DiscoveryPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [papers, setPapers] = useState<OpenAlexWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconstructAbstract = (
    inverted: Record<string, number[]> | undefined
  ): string => {
    if (!inverted) return "No abstract available";
    const words: [string, number][] = [];
    Object.entries(inverted).forEach(([word, positions]) => {
      positions.forEach((pos) => words.push([word, pos]));
    });
    words.sort((a, b) => a[1] - b[1]);
    const full = words.map(([w]) => w).join(" ");
    return full.length > 300 ? full.slice(0, 300) + "..." : full;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        per_page: "10",
        page: "1",
      });

      if (filters.from_date)
        params.append("from_publication_date", filters.from_date);
      if (filters.to_date)
        params.append("to_publication_date", filters.to_date);
      if (filters.min_citations !== undefined)
        params.append("min_citations", String(filters.min_citations));
      if (filters.is_oa !== undefined)
        params.append("is_oa", String(filters.is_oa));
      if (filters.has_fulltext !== undefined)
        params.append("has_fulltext", String(filters.has_fulltext));

      const res = await fetch(`/api/discovery/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }

      const data = await res.json();
      setPapers(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search papers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaper = (paperId: string) => {
    // Placeholder for adding paper to collection
    console.log("Add paper:", paperId);
    alert(`Add paper ${paperId} - implementation coming soon`);
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
            Search arXiv papers via OpenAlex and build your collection
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
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
              key={paper.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {paper.authorships
                      ?.slice(0, 5)
                      .map((a) => a.author.display_name)
                      .join(", ")}
                    {paper.authorships?.length > 5 &&
                      ` +${paper.authorships.length - 5} more`}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    {reconstructAbstract(paper.abstract_inverted_index)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {paper.publication_date && (
                      <span>📅 {paper.publication_date}</span>
                    )}
                    {paper.cited_by_count !== undefined && (
                      <span>📊 {paper.cited_by_count} citations</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddPaper(paper.id)}
                  className="shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  title="Add to collection"
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
                      d="M12 4v16m8-8H4"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
