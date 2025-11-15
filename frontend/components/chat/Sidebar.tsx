"use client";
import { LibraryItem } from "./types";
import { useState } from "react";

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

  if (collapsed) {
    return (
      <aside className="w-14 bg-white border-r p-2 flex flex-col items-center min-h-0">
        <button
          className="p-2 rounded hover:bg-gray-100"
          title="Expand My Papers"
          onClick={() => setCollapsed(false)}
        >
          <svg
            className="w-5 h-5 text-neutral-900"
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
      </aside>
    );
  }

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
      (md?.arxiv_id as string | undefined) ||
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

  return (
    <aside className="w-72 bg-white border-r p-4 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-black">My Papers</h3>
        <button
          className="p-1 rounded hover:bg-gray-100"
          title="Collapse"
          onClick={() => setCollapsed(true)}
        >
          <svg
            className="w-5 h-5 text-neutral-900"
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
      <p className="text-xs text-gray-500 mb-2">
        Select papers to include in chat (RAG)
      </p>
      <div className="space-y-2 overflow-auto min-h-0 py-2">
        {deduped.length === 0 && (
          <div className="text-sm text-gray-500">No papers found</div>
        )}
        {deduped.map((it) => {
          const checked = selectedDocs.has(it.rootId);
          return (
            <label
              key={it.rootId}
              className="flex text-black items-start space-x-2 rounded hover:bg-gray-50 p-2"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggleSelect(it.rootId, e.target.checked)}
                className="mt-1"
              />
              <div className="text-sm flex-1">
                <div className="font-medium">{it.title}</div>
                {it.authors &&
                  (() => {
                    const fa = formatAuthors(it.authors as string | string[]);
                    return fa ? (
                      <div className="text-xs text-gray-500">{fa}</div>
                    ) : null;
                  })()}
              </div>
              <button
                type="button"
                title="Delete paper"
                className="p-1 text-neutral-900 hover:text-neutral-800"
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
                  className="w-5 h-5 text-neutral-500"
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
