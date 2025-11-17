"use client";
import { ChatMessage } from "./types";
import { RefObject } from "react";
import ReactMarkdown from "react-markdown";

export function Messages({
  messages,
  typing,
  chatRef,
}: {
  messages: ChatMessage[];
  typing: boolean;
  chatRef: RefObject<HTMLDivElement | null>;
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
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )}
                {m.images && m.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Extracted Images:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {m.images.map((img, idx) => (
                        <div key={idx} className="border rounded overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${img.url}`}
                            alt={img.filename}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                          />
                          <div className="bg-gray-50 px-2 py-1 text-xs text-gray-600 truncate">
                            {img.filename}
                          </div>
                        </div>
                      ))}
                    </div>
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
