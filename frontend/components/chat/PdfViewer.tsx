"use client";

import { useEffect, useState } from "react";
import type { LibraryItem, SourceChunk } from "./types";

interface PdfViewerProps {
  selectedIds: string[];
  library: LibraryItem[];
  highlightSource?: SourceChunk | null;
}

export function PdfViewer({
  selectedIds,
  library,
  highlightSource,
}: PdfViewerProps) {
  const [currentDoc, setCurrentDoc] = useState<LibraryItem | null>(null);

  useEffect(() => {
    if (selectedIds.length > 0) {
      const doc = library.find((item) => item.id === selectedIds[0]);
      setCurrentDoc(doc || null);
    } else {
      setCurrentDoc(null);
    }
  }, [selectedIds, library]);

  if (!currentDoc) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <p className="text-slate-500">Select a document to view</p>
      </div>
    );
  }

  const pdfUrl = currentDoc.metadata.url || 
    (currentDoc.metadata.doc_id 
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/library/images/${currentDoc.metadata.doc_id}/pdf`
      : null);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <p className="text-slate-500">PDF not available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-100">
      <div className="h-full p-4 overflow-auto">
        <div className="mb-2">
          <h3 className="font-semibold text-slate-900">
            {currentDoc.metadata.title}
          </h3>
        </div>
        <iframe
          src={pdfUrl}
          className="w-full h-full min-h-[600px] border border-slate-300 rounded"
          title={currentDoc.metadata.title}
        />
      </div>
    </div>
  );
}

