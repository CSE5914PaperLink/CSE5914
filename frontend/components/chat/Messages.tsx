"use client";
import { ChatMessage, SourceChunk } from "./types";
import { RefObject } from "react";
import ReactMarkdown from "react-markdown";

function MessageWithCitations({
  text,
  sources,
  onSourceClick,
}: {
  text: string;
  sources?: SourceChunk[];
  onSourceClick?: (source: SourceChunk) => void;
}) {
  if (!sources || sources.length === 0) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    );
  }

  // Split text into segments and citations
  const segments: Array<{
    type: "text" | "citation";
    content: string | number;
  }> = [];
  let lastIndex = 0;
  const citationRegex = /\[(\d+)\]/g;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }
    segments.push({ type: "citation", content: parseInt(match[1], 10) });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.substring(lastIndex) });
  }

  return (
    <div className="prose prose-sm max-w-none">
      {segments.map((segment, idx) => {
        if (segment.type === "text") {
          return (
            <span key={idx}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span>{children}</span>,
                }}
              >
                {segment.content as string}
              </ReactMarkdown>
            </span>
          );
        } else {
          const citationNum = segment.content as number;
          const source = sources[citationNum - 1];
          if (!source) return <span key={idx}>[{citationNum}]</span>;
          return (
            <button
              key={idx}
              onClick={() => onSourceClick?.(source)}
              className="inline-flex items-center justify-center w-5 h-5 mx-0.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-full cursor-pointer transition-colors"
              style={{ verticalAlign: "super", fontSize: "0.65em" }}
              title={`Source ${citationNum}: ${
                source.type === "image"
                  ? source.filename || "Image"
                  : `Chunk ${source.chunk_index ?? citationNum}`
              }`}
            >
              {citationNum}
            </button>
          );
        }
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
                            const displayTitle =
                              source.title ||
                              source.doc_id ||
                              `Source ${idx + 1}`;
                            const pageInfo = source.page
                              ? ` • p.${source.page}`
                              : "";

                            return (
                              <button
                                key={source.id}
                                onClick={() => onSourceClick?.(source)}
                                className="inline-flex items-center gap-2 text-xs bg-white border-2 border-neutral-300 rounded-lg px-3 py-2 hover:bg-neutral-50 hover:border-blue-400 transition-all shadow-sm"
                                title={`Click to view ${
                                  isImage ? "image" : "text"
                                } from ${displayTitle}`}
                              >
                                {/* Icon */}
                                {isImage ? (
                                  <svg
                                    className="w-4 h-4 text-purple-600"
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
                                    className="w-4 h-4 text-blue-600"
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
                                <div className="flex flex-col items-start text-left">
                                  <span className="font-semibold text-neutral-800 max-w-[200px] truncate">
                                    {displayTitle}
                                  </span>
                                  <span className="text-[10px] text-neutral-500">
                                    {isImage
                                      ? source.filename || "Image"
                                      : `Chunk ${
                                          source.chunk_index ?? idx + 1
                                        }`}
                                    {pageInfo}
                                    {source.distance !== undefined &&
                                      ` • ${source.distance.toFixed(3)}`}
                                  </span>
                                </div>
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
