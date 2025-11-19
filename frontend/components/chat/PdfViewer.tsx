"use client";

import { LibraryItem, SourceChunk } from "./types";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";

import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { highlightPlugin, Trigger } from "@react-pdf-viewer/highlight";
import type { RenderHighlightsProps } from "@react-pdf-viewer/highlight";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

export function PdfViewer({
  selectedIds,
  library,
  highlightSource,
}: {
  selectedIds: string[];
  library: LibraryItem[];
  highlightSource?: SourceChunk | null;
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

  // Track pending highlight jump after PDF loads
  const pendingJumpRef = useRef<{
    pageIndex: number;
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Determine which document to show based on highlight source
  const targetRoot = useMemo(() => {
    if (!highlightSource?.doc_id) {
      return activeRoot;
    }

    // Find if this doc_id matches any of our selected documents
    const matchingRep = reps.find((r) => {
      const md = r.item.metadata as Record<string, unknown> | undefined;
      const rid =
        (md && (md["doc_id"] as string | undefined)) ||
        (r.item.id.includes("::chunk::")
          ? r.item.id.split("::chunk::")[0]
          : r.item.id);
      return rid === highlightSource.doc_id;
    });

    return matchingRep?.rootId ?? activeRoot;
  }, [highlightSource, reps, activeRoot]);

  const resolvedActiveRoot = reps.some((t) => t.rootId === targetRoot)
    ? targetRoot
    : reps[0]?.rootId ?? null;

  // Create highlight areas based on the source
  const highlightAreas = useMemo(() => {
    if (!highlightSource || highlightSource.page === undefined) return [];

    console.log("PdfViewer - Creating highlight for source:", {
      page: highlightSource.page,
      bbox: highlightSource.bbox,
      type: highlightSource.type,
      doc_id: highlightSource.doc_id,
    });

    // Validate bbox - skip if missing or has null/undefined values
    if (
      !highlightSource.bbox ||
      highlightSource.bbox.left == null ||
      highlightSource.bbox.top == null ||
      highlightSource.bbox.right == null ||
      highlightSource.bbox.bottom == null
    ) {
      console.warn(
        "PdfViewer - Skipping highlight: bbox is missing or incomplete",
        highlightSource.bbox
      );
      return [];
    }

    const bbox = highlightSource.bbox;

    // Validate that coordinates are in valid range (0-1)
    if (
      bbox.left < 0 ||
      bbox.left > 1 ||
      bbox.right < 0 ||
      bbox.right > 1 ||
      bbox.top < 0 ||
      bbox.top > 1 ||
      bbox.bottom < 0 ||
      bbox.bottom > 1
    ) {
      console.warn(
        "PdfViewer - bbox coordinates out of range (should be 0-1):",
        bbox
      );
      // Try to use anyway in case it's old data
    }

    const areas = [
      {
        pageIndex: highlightSource.page - 1, // PDF pages are 0-indexed
        height: (bbox.bottom - bbox.top) * 100,
        width: (bbox.right - bbox.left) * 100,
        left: bbox.left * 100,
        top: bbox.top * 100,
      },
    ];

    console.log("PdfViewer - Highlight areas:", areas);

    return areas;
  }, [highlightSource]);

  const renderHighlights = useCallback(
    (props: RenderHighlightsProps) => (
      <div>
        {highlightAreas
          .filter((area) => area.pageIndex === props.pageIndex)
          .map((area, idx) => (
            <div
              key={idx}
              className="highlight-area"
              style={{
                background: "rgba(255, 235, 59, 0.4)",
                border: "2px solid rgb(255, 193, 7)",
                mixBlendMode: "multiply",
                position: "absolute",
                left: `${area.left}%`,
                top: `${area.top}%`,
                height: `${area.height}%`,
                width: `${area.width}%`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
          ))}
      </div>
    ),
    [highlightAreas]
  );

  const highlightPluginInstance = highlightPlugin({
    renderHighlights,
    trigger: Trigger.None,
  });

  const { jumpToHighlightArea } = highlightPluginInstance;

  // Jump to the highlighted area when it changes
  // Store the jump request for when PDF loads
  useEffect(() => {
    if (highlightAreas.length > 0) {
      const area = highlightAreas[0];
      console.log("PdfViewer - Requesting jump to:", area);

      // Store pending jump
      pendingJumpRef.current = area;

      // Try to jump immediately (works if PDF is already loaded)
      jumpToHighlightArea(area);
    }
  }, [highlightAreas, jumpToHighlightArea]);

  // Callback when PDF document loads
  const handleDocumentLoad = useCallback(() => {
    console.log("PdfViewer - PDF loaded");

    // Execute pending jump if any
    if (pendingJumpRef.current) {
      console.log(
        "PdfViewer - Executing pending jump:",
        pendingJumpRef.current
      );
      // Small delay to ensure PDF is fully rendered
      setTimeout(() => {
        if (pendingJumpRef.current) {
          jumpToHighlightArea(pendingJumpRef.current);
          pendingJumpRef.current = null;
        }
      }, 100);
    }
  }, [jumpToHighlightArea]);

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

  // Use backend proxy for PDF URLs to avoid CORS issues
  const docId = active?.metadata?.doc_id;
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const pdfUrl = docId
    ? `${backendUrl}/arxiv/download/${docId}`
    : active?.metadata?.pdf_url;

  return (
    <aside className="w-full min-w-0 bg-white flex flex-col min-h-0">
      {/* Top Tabs */}
      <div className="flex border-b overflow-x-auto">
        {reps.map((r) => {
          const t = r.item;
          const title = t.metadata?.title || t.metadata?.doc_id || r.rootId;
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

      {/* PDF viewer area */}
      <div className="flex-1 min-h-0 overflow-auto p-4 container">
        {pdfUrl ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div
              className="w-full h-full border rounded-md"
              style={{ height: "100%" }}
            >
              <Viewer
                fileUrl={pdfUrl}
                plugins={[highlightPluginInstance]}
                defaultScale={SpecialZoomLevel.PageFit}
                onDocumentLoad={handleDocumentLoad}
              />
            </div>
          </Worker>
        ) : (
          <div className="p-6 text-sm text-neutral-500 text-center">
            No PDF URL available.
          </div>
        )}
      </div>
    </aside>
  );
}
