"use client";
import { LibraryItem } from "./types";
import { useMemo, useState } from "react";

export function Sidebar({
  library,
  selectedDocs,
  onToggleSelect,
  onDelete,
}: {
  library: LibraryItem[];
  selectedDocs: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const formatAuthors = (authors: unknown): string | null => {
    if (!authors) return null;
    if (Array.isArray(authors)) return authors.slice(0, 2).join(", ");
    if (typeof authors === "string") {
      try {
        const parsed = JSON.parse(authors);
        if (Array.isArray(parsed)) return parsed.slice(0, 2).join(", ");
      } catch {
        const maybeJson = authors.trim().replace(/'/g, '"');
        try {
          const parsed2 = JSON.parse(maybeJson);
          if (Array.isArray(parsed2)) return parsed2.slice(0, 2).join(", ");
        } catch {}
      }
      return authors;
    }
    return String(authors);
  };

  const selectedCount = selectedDocs.size;

  const grouped = new Map<
    string,
    {
      rootId: string;
      title: string;
      authors?: string | string[];
      reprId: string;
      chunkIds: string[];
    }
  >();
  for (const it of library) {
    const md = it.metadata as Record<string, unknown> | undefined;
    const rootId =
      (md && (md["doc_id"] as string | undefined)) ||
      (it.id.includes("::chunk::") ? it.id.split("::chunk::")[0] : it.id);
    const title =
      (md?.title as string | undefined) ||
      (md?.doc_id as string | undefined) ||
      rootId;
    if (!grouped.has(rootId)) {
      grouped.set(rootId, {
        rootId,
        title,
        authors: md?.authors as string | string[] | undefined,
        reprId: it.id,
        chunkIds: [it.id],
      });
    } else {
      grouped.get(rootId)!.chunkIds.push(it.id);
    }
  }

  const deduped = Array.from(grouped.values());

  const filtered = useMemo(() => {
    if (!search.trim()) return deduped;
    const term = search.toLowerCase();
    return deduped.filter((paper) => {
      const inTitle = paper.title.toLowerCase().includes(term);
      const authString = formatAuthors(paper.authors ?? "") || "";
      return inTitle || authString.toLowerCase().includes(term);
    });
  }, [deduped, search]);

  if (collapsed) {
    return (
      <aside className="w-16 bg-white border-r p-3 flex flex-col items-center min-h-0">
        <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2 text-center">
          Papers
        </div>
        <button
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-800 shadow-sm hover:border-blue-200"
          title="Expand My Papers"
          onClick={() => setCollapsed(false)}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="mt-3 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
          {selectedCount}
        </span>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-r p-4 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-blue-500">
            My Papers
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            Paper Context
          </h3>
        </div>
        <button
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-800 shadow-sm hover:border-blue-200"
          title="Collapse"
          onClick={() => setCollapsed(true)}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>Select papers to include in chat</span>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
          {selectedCount} selected
        </span>
      </div>
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500">Search</label>
        <div className="mt-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title or author"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3 overflow-auto min-h-0 py-1 pr-1">
        {deduped.length === 0 && (
          <div className="text-sm text-gray-500">No papers found</div>
        )}
        {deduped.length > 0 && filtered.length === 0 && (
          <div className="text-sm text-gray-500">
            No results for "{search}".
          </div>
        )}
        {filtered.map((it) => {
          const checked = selectedDocs.has(it.rootId);
          return (
            <label
              key={it.rootId}
              className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30 ${
                checked
                  ? "border-blue-300 bg-blue-50/60"
                  : "border-slate-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggleSelect(it.rootId, e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-sm flex-1">
                <div className="font-semibold leading-tight">{it.title}</div>
                {it.authors &&
                  (() => {
                    const fa = formatAuthors(it.authors as string | string[]);
                    return fa ? (
                      <div className="text-xs text-gray-500 mt-0.5">{fa}</div>
                    ) : null;
                  })()}
              </div>
              <button
                type="button"
                title="Delete paper"
                className="cursor-pointer p-1 text-slate-400 hover:text-red-500"
                onClick={(e) => {
                  e.preventDefault();
                  // Use the root document id so backend will delete all chunks
                  // associated with this paper.
                  onDelete(it.rootId);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M9 3a1 1 0 0 0-1 1v1H5.5a.75.75 0 0 0 0 1.5h13a.75.75 0 0 0 0-1.5H16V4a1 1 0 0 0-1-1H9Zm-2 6.25a.75.75 0 0 1 1.5 0v8a.75.75 0 0 1-1.5 0v-8Zm4.75-.75a.75.75 0 0 0-.75.75v8a.75.75 0 0 0 1.5 0v-8a.75.75 0 0 0-.75-.75Zm3.25.75a.75.75 0 0 1 1.5 0v8a.75.75 0 0 1-1.5 0v-8Z" />
                  <path d="M5.75 7.5a.75.75 0 0 0-.75.75v9A2.75 2.75 0 0 0 7.75 20h8.5A2.75 2.75 0 0 0 19 17.25v-9a.75.75 0 0 0-.75-.75h-12.5Z" />
                </svg>
              </button>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
