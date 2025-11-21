"use client";
import { LibraryItem } from "./types";
import { useMemo, useState } from "react";

const ChevronUp = () => (
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
      d="M5 15l7-7 7 7"
    />
  </svg>
);

const ChevronDown = () => (
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
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

type SidebarProps = {
  library: LibraryItem[];
  selectedDocs: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function Sidebar({
  library,
  selectedDocs,
  onToggleSelect,
  onDelete,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
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
  }, [deduped, search, formatAuthors]);

  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-500">
            My Papers
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            Paper Context
          </h3>
        </div>
        <button
          className="cursor-pointer rounded-full border border-slate-200 p-2 text-slate-600 hover:border-slate-300"
          title={collapsed ? "Expand section" : "Collapse section"}
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      {!collapsed && (
        <div className="flex flex-1 min-h-0 flex-col px-4 py-4">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span>Select papers to chat</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              {selectedCount} selected
            </span>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-500">
              Search
            </label>
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
          <div className="space-y-3 overflow-auto min-h-0 py-1 pr-1 flex-1">
            {deduped.length === 0 && (
              <div className="text-sm text-gray-500">No papers found</div>
            )}
            {deduped.length > 0 && filtered.length === 0 && (
              <div className="text-sm text-gray-500">
                No results for &quot;{search}&quot;.
              </div>
            )}
            {filtered.map((it) => {
              const checked = selectedDocs.has(it.rootId);
              return (
                <label
                  key={it.rootId}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30 ${
                    checked
                      ? "border-blue-300 bg-blue-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      onToggleSelect(it.rootId, e.target.checked)
                    }
                    className="mt-1 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-sm flex-1">
                    <div className="font-semibold text-sm leading-tight line-clamp-2">
                      {it.title}
                    </div>
                    {it.authors &&
                      (() => {
                        const fa = formatAuthors(
                          it.authors as string | string[]
                        );
                        return fa ? (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {fa}
                          </div>
                        ) : null;
                      })()}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
