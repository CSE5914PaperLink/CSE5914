"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import type { LibraryItem } from "@/components/chat/types";

const DEFAULT_ASPECTS = ["Model", "Dataset", "Performance", "Year", "Limitations"];

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

type MatrixResponse = {
  matrix: Record<
    string,
    {
      info: { doc_id: string; title: string };
      aspects: Record<string, string>;
    }
  >;
  aspects: string[];
};

export default function ComparePage() {
  const { dataConnectUserId } = useUser();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  
  // Mode: "pair" or "matrix"
  const [mode, setMode] = useState<"pair" | "matrix">("pair");

  // Pair state
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  
  // Matrix state
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedAspects, setSelectedAspects] = useState<string[]>(DEFAULT_ASPECTS);
  const [customAspect, setCustomAspect] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  
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
    if (mode === "pair") {
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
    } else {
      // Matrix mode
      if (selectedDocs.length < 2) {
        setError("Select at least two documents for matrix comparison.");
        return;
      }
      setLoading(true);
      setError(null);
      setMatrixData(null);
      try {
        const response = await fetch("/api/compare/matrix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doc_ids: selectedDocs, aspects: selectedAspects }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Matrix generation failed");
        }
        const data: MatrixResponse = await response.json();
        setMatrixData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Matrix generation failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const toggleAspect = (aspect: string) => {
    setSelectedAspects((prev) =>
      prev.includes(aspect)
        ? prev.filter((a) => a !== aspect)
        : [...prev, aspect]
    );
  };

  const addCustomAspect = () => {
    if (!customAspect.trim()) return;
    if (!selectedAspects.includes(customAspect.trim())) {
      setSelectedAspects((prev) => [...prev, customAspect.trim()]);
    }
    setCustomAspect("");
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
      <div className="max-w-7xl mx-auto px-6 py-12 container">
        <header className="mb-10 text-center">
          <p className="text-blue-600 uppercase text-xs tracking-[0.4em]">
            Research Analyzer
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 text-slate-950">
            Compare Research Papers
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Compare papers side-by-side or generate a high-level matrix view.
          </p>
          
          <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMode("pair")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "pair"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Deep Dive (Pair)
            </button>
            <button
              onClick={() => setMode("matrix")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "matrix"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Matrix View
            </button>
          </div>
        </header>

        <section className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200 p-8 mb-12">
          {mode === "pair" ? (
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
          ) : (
            <div>
              <div className="mb-8">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 block">
                  Select Papers to Compare
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                  {chromaDocs.map((doc) => (
                    <label
                      key={doc.metadata.doc_id}
                      className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDocs.includes(doc.metadata.doc_id)
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-white border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3"
                        checked={selectedDocs.includes(doc.metadata.doc_id)}
                        onChange={() => toggleDocSelection(doc.metadata.doc_id)}
                      />
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {doc.metadata.title || doc.metadata.doc_id}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Selected: {selectedDocs.length} documents
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 block">
                  Comparison Aspects
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedAspects.map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => toggleAspect(aspect)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                    >
                      {aspect}
                      <span className="ml-2 text-blue-600 hover:text-blue-900">×</span>
                    </button>
                  ))}
                  {DEFAULT_ASPECTS.filter(a => !selectedAspects.includes(a)).map((aspect) => (
                     <button
                      key={aspect}
                      onClick={() => toggleAspect(aspect)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                      + {aspect}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAspect}
                    onChange={(e) => setCustomAspect(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomAspect()}
                    placeholder="Add custom aspect (e.g. 'Learning Rate')"
                    className="flex-1 appearance-none bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={addCustomAspect}
                    disabled={!customAspect.trim()}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

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
                (mode === "pair" && (!selectedA || !selectedB || selectedA === selectedB)) ||
                (mode === "matrix" && (selectedDocs.length < 2 || selectedAspects.length === 0)) ||
                chromaDocs.length < 2
              }
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-blue-400/40 transition-all hover:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing..." : mode === "pair" ? "Compare Papers" : "Generate Matrix"}
            </button>
          </div>
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {mode === "pair" && comparison && (
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

        {mode === "matrix" && matrixData && (
          <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200 overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr>
                   <th className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 min-w-[150px]">
                     Aspect
                   </th>
                   {Object.values(matrixData.matrix).map((doc) => (
                     <th key={doc.info.doc_id} className="p-4 border-b border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 min-w-[250px]">
                       {doc.info.title || doc.info.doc_id}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {matrixData.aspects.map((aspect) => (
                   <tr key={aspect} className="hover:bg-slate-50/50 transition-colors">
                     <td className="p-4 border-b border-slate-100 text-sm font-semibold text-slate-700">
                       {aspect}
                     </td>
                     {Object.values(matrixData.matrix).map((doc) => (
                       <td key={`${doc.info.doc_id}-${aspect}`} className="p-4 border-b border-slate-100 text-sm text-slate-600 leading-relaxed">
                         {doc.aspects[aspect] || "—"}
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
          </section>
        )}
      </div>
      {modalOverlay}
    </main>
  );
}
