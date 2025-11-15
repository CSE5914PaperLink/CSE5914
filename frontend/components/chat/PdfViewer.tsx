"use client";
import { LibraryItem } from "./types";
import { useMemo, useState } from "react";

export function PdfViewer({
  selectedIds,
  library,
}: {
  // selectedIds are root document ids (not chunk ids)
  selectedIds: string[];
  library: LibraryItem[];
}) {
  const tabs = useMemo(() => {
    const set = new Set(selectedIds);
    // For each selected root id, pick the first library entry that matches
    return library.filter((l) => {
      const md = l.metadata as Record<string, unknown> | undefined;
      const root =
        (md && (md["doc_id"] as string | undefined)) ||
        (l.id.includes("::chunk::") ? l.id.split("::chunk::")[0] : l.id);
      return set.has(root);
    });
  }, [selectedIds, library]);

  const [activeId, setActiveId] = useState<string | null>(tabs[0]?.id ?? null);
  const resolvedActiveId = tabs.some((t) => t.id === activeId)
    ? activeId
    : tabs[0]?.id ?? null;

  if (tabs.length === 0) {
    return (
      <aside className="w-full min-w-0 bg-white p-4 overflow-y-auto min-h-0">
        <div className="text-sm text-neutral-500 text-center py-8 container">
          Select papers to preview PDFs
        </div>
      </aside>
    );
  }

  const active = tabs.find((t) => t.id === resolvedActiveId) ?? tabs[0];
  const pdfUrl = active?.metadata?.pdf_url;

  return (
    <aside className="w-full min-w-0 bg-white flex flex-col min-h-0">
      <div className="flex border-b overflow-x-auto">
        {tabs.map((t) => {
          const title = t.metadata?.title || t.metadata?.arxiv_id || t.id;
          const isActive = t.id === (active?.id ?? tabs[0]?.id);
          return (
            <button
              key={t.id}
              className={`px-3 py-2 text-sm whitespace-nowrap ${
                isActive
                  ? "border-b-2 border-neutral-900 text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
              onClick={() => setActiveId(t.id)}
              title={title}
            >
              {title.length > 24 ? `${title.slice(0, 24)}…` : title}
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-4 container">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-md"
            title="PDF Preview"
          />
        ) : (
          <div className="p-6 text-sm text-neutral-500 text-center">
            No PDF URL available.
          </div>
        )}
      </div>
    </aside>
  );
}
