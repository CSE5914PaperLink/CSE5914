"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Feature = "search" | "papers" | "analyze" | null;

export default function ChatPage() {
  const [active, setActive] = useState<Feature>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: "user" | "ai" | "system" }[]
  >([
    {
      id: "intro",
      text: "AI responses are coming soon! You can send messages and they will be displayed.",
      sender: "system",
    },
  ]);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const addMessage = (text: string, sender: "user" | "ai" | "system") => {
    setMessages((m) => [...m, { id: crypto.randomUUID(), text, sender }]);
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
  };

  const onFeature = (f: Exclude<Feature, null>, name: string) => {
    setActive(f);
    addMessage(
      `Switched to ${name} mode. You can now ask questions related to this feature.`,
      "system"
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const labels = {
      search: "Search Papers",
      papers: "My Papers",
      analyze: "Compare & Analyze",
    } as const;
    const display = active ? `[${labels[active]}] ${trimmed}` : trimmed;
    addMessage(display, "user");
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const feats = {
        search: "paper search",
        papers: "paper management",
        analyze: "paper analysis",
      } as const;
      addMessage(
        active
          ? `AI responses for ${feats[active]} are not yet implemented. Your message has been received!`
          : "AI responses are not yet implemented. Your message has been received!",
        "ai"
      );
    }, 2000);
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <nav className="bg-blue-700 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">CS Paper Compare - Chat</h1>
          <div className="space-x-4">
            <Link href="/app" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <div
          ref={chatRef}
          id="chatContainer"
          className="flex-1 bg-white rounded-lg shadow p-4 mb-4 overflow-y-auto"
        >
          <div className="text-center text-gray-500 py-8">
            <h2 className="text-2xl font-semibold mb-2">AI Chat Interface</h2>
            <p className="mb-4">
              Ask questions about your research papers and codebases
            </p>
            <div className="bg-yellow-100 border border-yellow-300 rounded p-3 inline-block">
              <p className="text-yellow-800 text-sm">
                🚧 AI responses are coming soon! You can send messages and they
                will be displayed.
              </p>
            </div>
          </div>
          <div id="messagesContainer" className="space-y-4 mt-8">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs wrap-break-word"
                      : m.sender === "system"
                      ? "bg-yellow-100 text-yellow-800 rounded-lg px-4 py-2 max-w-md text-center text-sm mx-auto"
                      : "bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs wrap-break-word"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div id="typingIndicator" className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 rounded-lg px-4 py-2 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <form id="chatForm" className="space-y-3" onSubmit={onSubmit}>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <button
                  type="button"
                  id="searchBtn"
                  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                  title="Search Papers"
                  onClick={() => onFeature("search", "Search Papers")}
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </button>
                <button
                  type="button"
                  id="papersBtn"
                  className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
                  title="My Papers"
                  onClick={() => onFeature("papers", "My Papers")}
                >
                  <svg
                    className="w-5 h-5 text-green-600"
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
                </button>
                <button
                  type="button"
                  id="analyzeBtn"
                  className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
                  title="Compare & Analyze"
                  onClick={() => onFeature("analyze", "Compare & Analyze")}
                >
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </button>
              </div>
              <input
                type="text"
                id="messageInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  active
                    ? `Ask about ${
                        active === "search"
                          ? "Search Papers"
                          : active === "papers"
                          ? "My Papers"
                          : "Compare & Analyze"
                      }...`
                    : "Type your message here..."
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Click feature icons to set context. Messages will be displayed but
            AI responses are not yet implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
