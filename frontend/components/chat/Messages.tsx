"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage, SourceChunk } from "./types";

interface MessagesProps {
  messages: ChatMessage[];
  typing: boolean;
  chatRef: React.RefObject<HTMLDivElement>;
  onSourceClick: (source: SourceChunk) => void;
}

export function Messages({
  messages,
  typing,
  chatRef,
  onSourceClick,
}: MessagesProps) {
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing, chatRef]);

  return (
    <div
      ref={chatRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              msg.sender === "user"
                ? "bg-blue-600 text-white"
                : msg.sender === "system"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-slate-100 text-slate-900"
            }`}
          >
            {msg.sender === "ai" || msg.sender === "system" ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    span: ({ node, ...props }: any) => {
                      if (props.className === "citation") {
                        const citationNum = props["data-citation"];
                        const source = msg.sources?.find(
                          (s) => s.citation_number === Number(citationNum)
                        );
                        return (
                          <span
                            {...props}
                            className="cursor-pointer text-blue-600 underline hover:text-blue-800"
                            onClick={() => source && onSourceClick(source)}
                          />
                        );
                      }
                      return <span {...props} />;
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{msg.text}</p>
            )}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-300">
                <p className="text-xs font-semibold mb-1">Sources:</p>
                <ul className="text-xs space-y-1">
                  {msg.sources.map((source, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => onSourceClick(source)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        [{source.citation_number}] {source.heading || source.content?.slice(0, 50)}...
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
      {typing && (
        <div className="flex justify-start">
          <div className="bg-slate-100 rounded-lg px-4 py-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

