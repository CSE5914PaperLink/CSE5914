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

  // Parse text for inline citations like [1], [2], etc.
  const parts: (string | { type: "citation"; index: number })[] = [];
  let lastIndex = 0;
  const citationRegex = /\[(\d+)\]/g;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const citationNum = parseInt(match[1], 10);
    parts.push({ type: "citation", index: citationNum });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <div className="prose prose-sm max-w-none">
      {parts.map((part, idx) => {
        if (typeof part === "string") {
          return <ReactMarkdown key={idx}>{part}</ReactMarkdown>;
        } else {
          const source = sources[part.index - 1];
          if (!source) return <span key={idx}>[{part.index}]</span>;
          return (
            <button
              key={idx}
              onClick={() => onSourceClick?.(source)}
              className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-full cursor-pointer transition-colors align-super"
              title={`Source ${part.index}: ${
                source.type === "image"
                  ? source.filename || "Image"
                  : `Chunk ${source.chunk_index ?? part.index}`
              }`}
            >
              {part.index}
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
                    <MessageWithCitations
                      text={m.text}
                      sources={m.sources}
                      onSourceClick={onSourceClick}
                    />
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-300">
                        <div className="text-xs font-semibold text-neutral-600 mb-2">
                          Sources:
                        </div>
                        <div className="space-y-2">
                          {m.sources.map((source, idx) => (
                            <button
                              key={source.id}
                              onClick={() => onSourceClick?.(source)}
                              className="block w-full text-left text-xs bg-white border border-neutral-300 rounded px-3 py-2 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-neutral-700">
                                    [{idx + 1}]
                                  </span>{" "}
                                  <span className="text-neutral-600">
                                    {source.type === "image"
                                      ? `Image: ${source.filename || "Figure"}`
                                      : `Chunk ${source.chunk_index ?? idx}`}
                                    {source.page !== undefined && (
                                      <span className="text-neutral-500">
                                        {" "}
                                        • Page {source.page}
                                      </span>
                                    )}
                                  </span>
                                  {source.content && (
                                    <div className="text-neutral-500 mt-1 line-clamp-2">
                                      {source.content.substring(0, 100)}
                                      {source.content.length > 100 && "..."}
                                    </div>
                                  )}
                                </div>
                                <div className="text-neutral-500 text-xs whitespace-nowrap">
                                  {source.distance !== undefined && (
                                    <span
                                      title="Distance score (lower is better)"
                                      className="font-mono"
                                    >
                                      {source.distance.toFixed(3)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
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
