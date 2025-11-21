"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import type { LibraryItem } from "@/components/chat/types";

type Citation = {
  chunk_id?: string;
  page?: number;
  chunk_index?: number;
  heading?: string;
  excerpt?: string;
};

type SectionImage = {
  chunk_id?: string;
  page?: number;
  picture_number?: number;
  caption?: string;
  image_b64: string;
};

type SectionComparison = {
  section: string;
  paper_a_summary: string;
  paper_b_summary: string;
  similarities?: string;
  differences?: string;
  notes?: string;
  paper_a_citations: Citation[];
  paper_b_citations: Citation[];
  paper_a_images?: SectionImage[];
  paper_b_images?: SectionImage[];
};

type ComparisonResponse = {
  doc_a: { doc_id: string; title?: string };
  doc_b: { doc_id: string; title?: string };
  sections: SectionComparison[];
  overall_summary?: string | null;
};

export default function ComparePage() {
  const { dataConnectUserId } = useUser();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [previewImage, setPreviewImage] = useState<SectionImage | null>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!dataConnectUserId) return;
    let active = true;
    fetch(`/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setLibrary(data.results || []);
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load library items.");
      });
    return () => {
      active = false;
    };
  }, [dataConnectUserId]);

  const chromaDocs = useMemo(
    () => library.filter((item) => item.in_chromadb),
    [library]
  );

  const handleCompare = async () => {
    if (!selectedA || !selectedB || selectedA === selectedB) {
      setError("Select two different documents to compare.");
      return;
    }
    setLoading(true);
    setError(null);
    setComparison(null);
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_a: selectedA, doc_b: selectedB }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Comparison failed");
      }
      const data: ComparisonResponse = await response.json();
      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderImageGallery = (images?: SectionImage[]) => {
    if (!images?.length) return null;
    return (
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {images.map((image) => (
          <button
            key={image.chunk_id || `${image.page}-${image.picture_number}`}
            type="button"
            onClick={() => setPreviewImage(image)}
            className="inline-flex min-h-[200px] w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition transform hover:-translate-y-0.5 hover:shadow-lg cursor-zoom-in"
            aria-label="Expand image"
          >
            <img
              src={`data:image/png;base64,${image.image_b64}`}
              alt={image.caption || "Section reference"}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  };

  const renderCitationList = (citations: Citation[]) => {
    if (!citations.length) return null;
    return (
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-blue-600">
          View cited chunks
        </summary>
        <ul className="mt-2 space-y-1 text-neutral-600">
          {citations.map((citation) => (
            <li key={citation.chunk_id || `${citation.page}-${citation.heading}`}>
              <span className="font-semibold">
                {citation.heading || "Section"}
              </span>{" "}
              {citation.page && <span>p.{citation.page}</span>}
              {citation.chunk_index !== undefined && (
                <span className="ml-1 text-xs text-neutral-500">
                  chunk {citation.chunk_index}
                </span>
              )}
              {citation.excerpt && (
                <blockquote className="border-l-2 border-neutral-200 pl-2 text-xs italic text-neutral-500">
                  {citation.excerpt}
                </blockquote>
              )}
            </li>
          ))}
        </ul>
      </details>
    );
  };

  const modalOverlay = previewImage ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={() => setPreviewImage(null)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-lg font-bold text-white shadow hover:bg-black cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
          aria-label="Close image preview"
        >
          ×
        </button>
        <img
          src={`data:image/png;base64,${previewImage.image_b64}`}
          alt={previewImage.caption || "Expanded figure"}
          className="w-full rounded-t-3xl object-contain max-h-[70vh]"
        />
          {(previewImage.caption ||
            previewImage.page !== undefined ||
            previewImage.picture_number !== undefined) && (
            <div className="px-6 py-4 text-sm text-slate-700">
              {previewImage.caption && (
                <p className="mb-2 text-base font-medium">{previewImage.caption}</p>
              )}
              <p className="text-xs text-slate-500">
                {previewImage.page !== undefined ? `p.${previewImage.page}` : null}
                {previewImage.picture_number !== undefined
                  ? ` • img ${previewImage.picture_number}`
                  : null}
              </p>
              <p className="mt-2 text-[0.65rem] text-slate-400">
                Tip: Click the × or press Esc to close
              </p>
            </div>
          )}
        </div>
    </div>
  ) : null;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12 container">
        <header className="mb-10 text-center">
          <p className="text-blue-600 uppercase text-xs tracking-[0.4em]">
            Research Analyzer
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 text-slate-950">
            Compare Research Papers
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Choose two ingested papers to generate a rich, section-aligned
            comparison covering methodology, experiments, results and more.
          </p>
        </header>

        <section className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200 p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Paper A
              </label>
              <div className="relative mt-3">
                <select
                  value={selectedA}
                  onChange={(e) => setSelectedA(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:outline-none placeholder:text-slate-400"
                >
                  <option value="">Select a document</option>
                  {chromaDocs.map((doc) => (
                    <option key={doc.metadata.doc_id} value={doc.metadata.doc_id}>
                      {doc.metadata.title || doc.metadata.doc_id}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  ▼
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Paper B
              </label>
              <div className="relative mt-3">
                <select
                  value={selectedB}
                  onChange={(e) => setSelectedB(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:outline-none placeholder:text-slate-400"
                >
                  <option value="">
                    Select a document
                  </option>
                  {chromaDocs.map((doc) => (
                    <option
                      key={doc.metadata.doc_id}
                      value={doc.metadata.doc_id}
                    >
                      {doc.metadata.title || doc.metadata.doc_id}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  ▼
                </span>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-slate-500">
              {chromaDocs.length === 0
                ? "No ingested documents available yet."
                : `Ready to compare ${
                    chromaDocs.length
                  } processed documents.`}
            </p>
            <button
              onClick={handleCompare}
              disabled={
                loading ||
                !selectedA ||
                !selectedB ||
                selectedA === selectedB ||
                chromaDocs.length < 2
              }
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-blue-400/40 transition-all hover:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Comparing..." : "Compare Papers"}
            </button>
          </div>
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {comparison && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-500">
                    Paper A
                  </p>
                  <h2 className="text-xl font-semibold mt-2 text-slate-900">
                    {comparison.doc_a.title || comparison.doc_a.doc_id}
                  </h2>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-pink-500">
                    Paper B
                  </p>
                  <h2 className="text-xl font-semibold mt-2 text-slate-900">
                    {comparison.doc_b.title || comparison.doc_b.doc_id}
                  </h2>
                </div>
              </div>
            </div>

            {comparison.overall_summary && (
              <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-xl shadow-blue-100/60">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                  Overall Comparison
                </p>
                <h2 className="text-2xl font-semibold mt-2 text-slate-900">
                  {comparison.doc_a.title || comparison.doc_a.doc_id} vs{" "}
                  {comparison.doc_b.title || comparison.doc_b.doc_id}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {comparison.overall_summary}
                </p>
              </div>
            )}

            {comparison.sections.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-500">
                No comparable sections were detected across the selected
                documents.
              </div>
            ) : (
              comparison.sections.map((section) => (
                <div
                  key={section.section}
                  className="bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                        Section
                      </p>
                      <h3 className="text-2xl font-semibold mt-2 text-slate-900">
                        {section.section}
                      </h3>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {section.similarities && (
                        <p>
                          <span className="font-semibold text-slate-900">
                            Similarities:
                          </span>{" "}
                          {section.similarities}
                        </p>
                      )}
                      {section.differences && (
                        <p>
                          <span className="font-semibold text-white">
                            Differences:
                          </span>{" "}
                          {section.differences}
                        </p>
                      )}
                      {section.notes && (
                        <p className="text-xs text-slate-500">
                          Notes: {section.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                        Paper A
                      </p>
                      <p className="mt-3 text-sm text-slate-800 whitespace-pre-line">
                        {section.paper_a_summary}
                      </p>
                      {renderCitationList(section.paper_a_citations)}
                      {renderImageGallery(section.paper_a_images)}
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs uppercase tracking-[0.4em] text-pink-500">
                        Paper B
                      </p>
                      <p className="mt-3 text-sm text-slate-800 whitespace-pre-line">
                        {section.paper_b_summary}
                      </p>
                      {renderCitationList(section.paper_b_citations)}
                      {renderImageGallery(section.paper_b_images)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </div>
      {modalOverlay}
    </main>
  );
}
