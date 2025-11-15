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
  // Map each selected root id to the first matching library entry (representative)
  const reps = useMemo(() => {
    const out: { rootId: string; item: LibraryItem }[] = [];
    for (const root of selectedIds) {
      const found = library.find((l) => {
        const md = l.metadata as Record<string, unknown> | undefined;
        const rid =
          (md && (md["doc_id"] as string | undefined)) ||
          (l.id.includes("::chunk::") ? l.id.split("::chunk::")[0] : l.id);
        return rid === root;
      });
      if (found) out.push({ rootId: root, item: found });
    }
    return out;
  }, [selectedIds, library]);

  const [activeRoot, setActiveRoot] = useState<string | null>(
    reps[0]?.rootId ?? null
  );
  const resolvedActiveRoot = reps.some((t) => t.rootId === activeRoot)
    ? activeRoot
    : reps[0]?.rootId ?? null;

  if (reps.length === 0) {
    return (
      <aside className="w-full min-w-0 bg-white p-4 overflow-y-auto min-h-0">
        <div className="text-sm text-neutral-500 text-center py-8 container">
          Select papers to preview PDFs
        </div>
      </aside>
    );
  }

  const active =
    reps.find((r) => r.rootId === resolvedActiveRoot)?.item ?? reps[0].item;
  const pdfUrl = active?.metadata?.pdf_url;

  return (
    <aside className="w-full min-w-0 bg-white flex flex-col min-h-0">
      <div className="flex border-b overflow-x-auto">
        {reps.map((r) => {
          const t = r.item;
          const title = t.metadata?.title || t.metadata?.arxiv_id || r.rootId;
          const isActive = r.rootId === resolvedActiveRoot;
          return (
            <button
              key={r.rootId}
              className={`px-3 py-2 text-sm whitespace-nowrap ${
                isActive
                  ? "border-b-2 border-neutral-900 text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
              onClick={() => setActiveRoot(r.rootId)}
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
