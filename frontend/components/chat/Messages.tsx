"use client";
import { annotateWithCitations, parseCitationGroup } from "./citations";
import { truncateTitle } from "./sourceUtils";
import { ChatMessage, SourceChunk } from "./types";
import { RefObject } from "react";
import ReactMarkdown from "react-markdown";

const NON_BREAKING_SPACE = "\u00A0";

const handleSourceInteraction = (
  source: SourceChunk,
  callback?: (source: SourceChunk) => void
) => {
  if (source.type === "text" && source.content) {
    console.log("Source content:", source.content);
  }
  callback?.(source);
};

function MessageWithCitations({
  text,
  sources,
  onSourceClick,
}: {
  text: string;
  sources?: SourceChunk[];
  onSourceClick?: (source: SourceChunk) => void;
}) {
  const resolvedText =
    sources && sources.length > 0 ? annotateWithCitations(text, sources) : text;

  const sourceMap = new Map<number, SourceChunk>();
  sources?.forEach((source, idx) => {
    const citationNumber = source.citation_number ?? idx + 1;
    if (!sourceMap.has(citationNumber)) {
      sourceMap.set(citationNumber, source);
    }
  });

  type Segment =
    | { type: "text"; content: string }
    | { type: "citation"; content: number };

  const segments: Segment[] = [];
  const citationGroupRegex = /\[(\s*\d+(?:\s*,\s*\d+)*)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = citationGroupRegex.exec(resolvedText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: resolvedText.slice(lastIndex, match.index),
      });
    }

    const prevChar =
      match.index > 0 ? resolvedText.charAt(match.index - 1) : "";
    if (prevChar && !/\s/.test(prevChar)) {
      segments.push({ type: "text", content: NON_BREAKING_SPACE });
    }

    const citationNumbers = parseCitationGroup(match[1]);
    citationNumbers.forEach((num, idx) => {
      if (idx > 0) {
        segments.push({ type: "text", content: NON_BREAKING_SPACE });
      }
      segments.push({ type: "citation", content: num });
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < resolvedText.length) {
    segments.push({ type: "text", content: resolvedText.slice(lastIndex) });
  }

  return (
    <div className="prose prose-sm max-w-none">
      {segments.map((segment, idx) => {
        if (segment.type === "text") {
          const content = segment.content as string;
          return (
            <span key={idx}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span>{children}</span>,
                }}
              >
                {content}
              </ReactMarkdown>
            </span>
          );
        }
        const citationNum = segment.content as number;
        const source =
          sourceMap.get(citationNum) ||
          (sources ? sources[citationNum - 1] : undefined);
        if (!source) return <span key={idx}>[{citationNum}]</span>;
        return (
          <button
            key={idx}
            onClick={() => handleSourceInteraction(source, onSourceClick)}
            type="button"
            className="inline text-blue-700 hover:underline align-super px-1 whitespace-nowrap"
            style={{ fontSize: "0.7em" }}
            title={
              source.title
                ? `${source.title} (Doc ${source.doc_id ?? "?"})`
                : source.doc_id
                ? `Doc ${source.doc_id}`
                : `Source ${citationNum}`
            }
          >
            {citationNum}
          </button>
        );
      })}
    </div>
  );
}

export function Messages({
  messages,
  typing,
  chatRef,
  onSourceClick,
}: {
  messages: ChatMessage[];
  typing: boolean;
  chatRef: RefObject<HTMLDivElement | null>;
  onSourceClick?: (source: SourceChunk) => void;
}) {
  return (
    <div
      ref={chatRef}
      id="chatContainer"
      className="flex-1 overflow-y-auto min-h-0 bg-transparent"
    >
      <div className="max-w-3xl mx-auto px-6 py-8 container">
        <div className="text-center text-gray-500 py-4">
          <h2 className="text-lg font-medium">AI Research Assistant</h2>
          <p className="text-xs">Ask anything about research papers.</p>
        </div>
        <div id="messagesContainer" className="space-y-5 mt-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.sender === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-prose"
                    : m.sender === "system"
                    ? "bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-2xl px-4 py-2 max-w-prose text-center text-sm mx-auto"
                    : "bg-neutral-100 text-neutral-900 rounded-2xl px-4 py-2 max-w-prose"
                }
              >
                {m.sender === "ai" ? (
                  <div>
                    {/* Show status indicator if status is present */}
                    {m.status && (
                      <div className="mb-3 flex items-center gap-2 text-sm text-neutral-600">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.15s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.3s" }}
                          ></div>
                        </div>
                        <span className="font-medium capitalize">
                          {m.status}
                        </span>
                      </div>
                    )}

                    <MessageWithCitations
                      text={m.text}
                      sources={m.sources}
                      onSourceClick={onSourceClick}
                    />

                    {/* Note: Images are embedded in the LLM response text, 
                        so no need for a separate "Referenced Images" section */}

                    {/* Compact horizontal sources section */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-300">
                        <div className="text-xs font-semibold text-neutral-600 mb-3">
                          Sources Used ({m.sources.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {m.sources.map((source, idx) => {
                            const isImage = source.type === "image";
                            const citationLabel =
                              source.citation_number ?? idx + 1;
                            const displayTitle =
                              source.title ||
                              source.doc_id ||
                              `Source ${citationLabel}`;
                            const shortTitle = truncateTitle(displayTitle, 15);
                            const tooltipDetails = [
                              source.title,
                              source.doc_id,
                              source.page ? `p.${source.page}` : undefined,
                              source.heading,
                              source.caption,
                            ]
                              .filter(Boolean)
                              .join(" • ");

                            return (
                              <button
                                key={source.id || `${source.doc_id}-${idx}`}
                                onClick={() =>
                                  handleSourceInteraction(source, onSourceClick)
                                }
                                className="inline-flex min-w-0 items-center gap-1 text-[11px] font-semibold bg-white border border-neutral-300 rounded-full px-2.5 py-1 hover:bg-neutral-50 hover:border-blue-400 transition-all shadow-sm"
                                title={
                                  tooltipDetails ||
                                  `Source ${citationLabel} • ${displayTitle}`
                                }
                              >
                                {/* Icon */}
                                {isImage ? (
                                  <svg
                                    className="w-3.5 h-3.5 text-purple-600 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-3.5 h-3.5 text-blue-600 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    ></path>
                                  </svg>
                                )}

                                {/* Content */}
                                <span className="text-neutral-800 truncate max-w-[140px]">
                                  [{citationLabel}] {shortTitle}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div id="typingIndicator" className="flex justify-start">
              <div className="bg-neutral-100 text-neutral-600 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
