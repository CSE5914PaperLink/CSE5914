"use client";
import { ChatMessage, Citation } from "./types";
import { RefObject } from "react";

export function Messages({
  messages,
  typing,
  chatRef,
  onCitationClick,
}: {
  messages: ChatMessage[];
  typing: boolean;
  chatRef: RefObject<HTMLDivElement | null>;
  onCitationClick: (citation: Citation) => void;
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
                    : "bg-neutral-100 text-neutral-900 rounded-2xl px-4 py-2 max-w-prose whitespace-pre-wrap"
                }
              >
                <div>{m.text}</div>
                {m.sender === "ai" &&
                  Array.isArray(m.citations) &&
                  m.citations.length > 0 && (
                    <div className="mt-3 space-y-2 text-xs text-neutral-700">
                      {m.citations.map((citation, idx) => (
                        <div
                          key={`${m.id}-citation-${citation.id ?? idx}`}
                          className="border-l-2 border-neutral-300 pl-3"
                        >
                          <button
                            type="button"
                            className="text-blue-600 font-medium hover:underline"
                            onClick={() => onCitationClick(citation)}
                          >
                            Source {idx + 1}:{" "}
                            {citation.title || citation.docId || "Document"}
                          </button>
                          {citation.pages && citation.pages.length > 0 && (
                            <div className="text-[11px] text-neutral-500">
                              Pages {citation.pages.slice(0, 4).join(", ")}
                            </div>
                          )}
                          {citation.snippet && (
                            <p className="mt-1 text-neutral-500">
                              {citation.snippet}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
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
