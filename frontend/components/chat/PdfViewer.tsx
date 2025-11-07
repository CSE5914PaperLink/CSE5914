"use client";
import { LibraryItem, HighlightRequest } from "./types";
import { useEffect, useMemo, useState } from "react";

export function PdfViewer({
  selectedIds,
  library,
  highlight,
}: {
  selectedIds: string[];
  library: LibraryItem[];
  highlight?: HighlightRequest | null;
}) {
  const tabs = useMemo(() => {
    const set = new Set(selectedIds);
    return library.filter((l) => set.has(l.id));
  }, [selectedIds, library]);

  const [activeId, setActiveId] = useState<string | null>(tabs[0]?.id ?? null);
  const resolvedActiveId = tabs.some((t) => t.id === activeId)
    ? activeId
    : tabs[0]?.id ?? null;
  const [activeHighlight, setActiveHighlight] =
    useState<HighlightRequest | null>(null);

  useEffect(() => {
    if (!highlight) {
      setActiveHighlight(null);
      return;
    }
    if (!tabs.some((t) => t.id === highlight.docId)) {
      return;
    }
    setActiveId(highlight.docId);
    setActiveHighlight(highlight);
  }, [highlight, tabs]);

  useEffect(() => {
    if (
      activeHighlight &&
      !tabs.some((tab) => tab.id === activeHighlight.docId)
    ) {
      setActiveHighlight(null);
    }
  }, [tabs, activeHighlight]);

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
  const currentHighlight =
    activeHighlight && activeHighlight.docId === active?.id
      ? activeHighlight
      : null;

  const buildPdfSrc = (
    url: string | undefined,
    highlightRequest: HighlightRequest | null
  ) => {
    if (!url) return undefined;
    if (!highlightRequest) return url;
    const sanitizedSnippet = highlightRequest.snippet
      ? highlightRequest.snippet.replace(/\s+/g, " ").trim()
      : "";
    const hashParts: string[] = [];
    if (highlightRequest.pageNumber && highlightRequest.pageNumber > 0) {
      hashParts.push(`page=${highlightRequest.pageNumber}`);
    }
    if (sanitizedSnippet) {
      const snippetFragment = encodeURIComponent(
        sanitizedSnippet.slice(0, 80)
      );
      hashParts.push(`search=${snippetFragment}`);
    }
    if (hashParts.length === 0) return url.split("#")[0];
    return `${url.split("#")[0]}#${hashParts.join("&")}`;
  };

  const iframeSrc = buildPdfSrc(pdfUrl, currentHighlight) ?? pdfUrl;
  const iframeKey = currentHighlight
    ? `${active?.id}-${currentHighlight.requestId}`
    : active?.id ?? "pdf";

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
      {currentHighlight && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-neutral-600 bg-neutral-50 border-b">
          <span>
            Highlighting cited passage
            {currentHighlight.pageNumber
              ? ` (page ${currentHighlight.pageNumber})`
              : ""}
            .
          </span>
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium"
            onClick={() => setActiveHighlight(null)}
          >
            Clear
          </button>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto p-4 container">
        {pdfUrl ? (
          <iframe
            key={iframeKey}
            src={iframeSrc}
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
