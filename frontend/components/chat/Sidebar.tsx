"use client";

import type { LibraryItem } from "./types";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  library: LibraryItem[];
  selectedDocs: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  library,
  selectedDocs,
  onToggleSelect,
  onDelete,
}: SidebarProps) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center p-2">
        <button
          onClick={onToggleCollapse}
          className="text-slate-600 hover:text-slate-900"
          title="Expand library"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <h2 className="font-semibold text-slate-900">Library</h2>
        <button
          onClick={onToggleCollapse}
          className="text-slate-600 hover:text-slate-900"
          title="Collapse library"
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
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {library.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No papers in library
          </p>
        ) : (
          library.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedDocs.has(item.id)}
                  onChange={(e) => onToggleSelect(item.id, e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.metadata.title || item.metadata.doc_id}
                  </p>
                  {item.metadata.authors && (
                    <p className="text-xs text-slate-500 mt-1">
                      {item.metadata.authors.slice(0, 2).join(", ")}
                      {item.metadata.authors.length > 2 && " et al."}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-slate-400 hover:text-red-600"
                  title="Delete"
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
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

