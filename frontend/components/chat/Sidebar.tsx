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
      github_url?: string;
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
    const githubUrl = md?.github_url as string | undefined;
    if (!grouped.has(rootId)) {
      grouped.set(rootId, {
        rootId,
        title,
        authors: md?.authors as string | string[] | undefined,
        reprId: it.id,
        chunkIds: [it.id],
        github_url: githubUrl,
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
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                        {it.title}
                      </div>
                      {it.github_url && (
                        <a
                          href={it.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 text-slate-700 hover:text-slate-900 transition-colors"
                          title="View on GitHub"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 .5C5.648.5.5 5.787.5 12.266c0 5.194 3.438 9.607 8.205 11.168.6.115.82-.27.82-.6 0-.297-.012-1.28-.017-2.322-3.338.744-4.042-1.665-4.042-1.665-.546-1.424-1.334-1.805-1.334-1.805-1.09-.769.083-.754.083-.754 1.205.086 1.839 1.28 1.839 1.28 1.07 1.903 2.809 1.353 3.495 1.035.108-.807.418-1.353.762-1.664-2.665-.315-5.466-1.383-5.466-6.156 0-1.36.465-2.47 1.235-3.34-.124-.317-.535-1.592.115-3.32 0 0 1.005-.33 3.3 1.27a11.006 11.006 0 0 1 6 0c2.292-1.6 3.296-1.27 3.296-1.27.652 1.728.241 3.003.118 3.32.77.87 1.232 1.98 1.232 3.34 0 4.784-2.806 5.836-5.48 6.146.43.385.823 1.138.823 2.295 0 1.657-.015 2.994-.015 3.404 0 .333.216.722.825.598C20.065 21.87 23.5 17.457 23.5 12.266 23.5 5.787 18.352.5 12 .5Z" />
                          </svg>
                        </a>
                      )}
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
