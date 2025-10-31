"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type FeatureKey = "search" | "papers" | "analyze" | null;

export default function DashboardPage() {
  const [activeFeature, setActiveFeature] = useState<FeatureKey>(null);
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: "user" | "ai" | "system" }[]
  >([
    {
      id: "welcome",
      text: "Welcome! You can chat freely or click on a feature card for specialized assistance.",
      sender: "system",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const switchTab = (tab: "features" | "history") => {
    // history tab is static placeholder for now; state tracked by CSS-only show/hide below
    const features = document.getElementById("featuresContent");
    const history = document.getElementById("historyContent");
    const fTab = document.getElementById("featuresTab");
    const hTab = document.getElementById("historyTab");
    if (!features || !history || !fTab || !hTab) return;
    if (tab === "features") {
      features.classList.remove("hidden");
      history.classList.add("hidden");
      fTab.classList.add("text-blue-600", "border-blue-600", "bg-blue-50");
      fTab.classList.remove("text-gray-500", "border-transparent");
      hTab.classList.add("text-gray-500", "border-transparent");
      hTab.classList.remove("text-blue-600", "border-blue-600", "bg-blue-50");
    } else {
      history.classList.remove("hidden");
      features.classList.add("hidden");
      hTab.classList.add("text-blue-600", "border-blue-600", "bg-blue-50");
      hTab.classList.remove("text-gray-500", "border-transparent");
      fTab.classList.add("text-gray-500", "border-transparent");
      fTab.classList.remove("text-blue-600", "border-blue-600", "bg-blue-50");
    }
  };

  const setFeature = (feature: Exclude<FeatureKey, null>, name: string) => {
    if (activeFeature === feature) {
      setActiveFeature(null);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          text: "Switched to general chat mode. You can ask about anything!",
          sender: "system",
        },
      ]);
      return;
    }
    setActiveFeature(feature);
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        text: `Switched to ${name} mode. You can now ask questions related to this feature.`,
        sender: "system",
      },
    ]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const featureNames = {
      search: "Search Papers",
      papers: "My Papers",
      analyze: "Compare & Analyze",
    } as const;
    const display = activeFeature
      ? `[${featureNames[activeFeature]}] ${trimmed}`
      : trimmed;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), text: display, sender: "user" },
    ]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const featureResponses = {
        search: "paper search",
        papers: "paper management",
        analyze: "paper analysis",
      } as const;
      const response = activeFeature
        ? `AI responses for ${featureResponses[activeFeature]} are not yet implemented. Your message has been received!`
        : "AI responses are not yet implemented. Your message has been received! You can continue chatting or select a feature for specialized assistance.";
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), text: response, sender: "ai" },
      ]);
    }, 2000);
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <nav className="bg-blue-700 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">CS Paper Compare - Dashboard</h1>
          <div className="space-x-4">
            <Link
              href="/"
              className="bg-white text-blue-700 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/3 flex flex-col space-y-4 lg:space-y-6 overflow-y-auto lg:max-h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              id="featuresTab"
              className="flex-1 px-4 py-2 text-sm lg:text-base font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              onClick={() => switchTab("features")}
            >
              Features
            </button>
            <button
              id="historyTab"
              className="flex-1 px-4 py-2 text-sm lg:text-base font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700"
              onClick={() => switchTab("history")}
            >
              Chat History
            </button>
          </div>

          {/* Features Content */}
          <div
            id="featuresContent"
            className="space-y-3 lg:space-y-4 flex-1 overflow-y-auto px-1 pt-1 pb-1"
          >
            <div
              className="bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-md transition-all mx-1"
              onClick={() => setFeature("search", "Search Papers")}
            >
              <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-blue-100">
                  <svg
                    className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600"
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
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-black">
                  Search Papers
                </h3>
              </div>
              <p className="text-sm lg:text-base text-gray-600">
                Discover and import research papers from arXiv and OpenAlex
              </p>
            </div>

            <div
              className="bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-md transition-all mx-1"
              onClick={() => setFeature("papers", "My Papers")}
            >
              <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-green-100">
                  <svg
                    className="w-4 h-4 lg:w-6 lg:h-6 text-green-600"
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
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-black">
                  My Papers
                </h3>
              </div>
              <p className="text-sm lg:text-base text-gray-600">
                View and manage your imported research papers
              </p>
            </div>

            <div
              className="bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-md transition-all mx-1"
              onClick={() => setFeature("analyze", "Compare & Analyze")}
            >
              <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-purple-100">
                  <svg
                    className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600"
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
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-black">
                  Compare & Analyze
                </h3>
              </div>
              <p className="text-sm lg:text-base text-gray-600">
                Compare papers and ask questions using AI
              </p>
            </div>
          </div>

          {/* History Content (placeholder) */}
          <div
            id="historyContent"
            className="space-y-3 lg:space-y-4 flex-1 overflow-y-auto px-1 pt-1 pb-1 hidden"
          >
            <div className="text-center py-8">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-yellow-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <h3 className="font-semibold text-yellow-800">Coming Soon</h3>
                </div>
                <p className="text-yellow-700 text-sm">
                  Chat history functionality will be implemented in a future
                  update.
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Previous Chat Session
                    </h4>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Search for machine learning papers...
                  </p>
                  <div className="mt-2 text-xs text-gray-400">5 messages</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Paper Analysis Session
                    </h4>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Compare transformers vs CNNs...
                  </p>
                  <div className="mt-2 text-xs text-gray-400">12 messages</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Research Discussion
                    </h4>
                    <span className="text-xs text-gray-500">2 weeks ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Questions about dataset preprocessing...
                  </p>
                  <div className="mt-2 text-xs text-gray-400">8 messages</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat column */}
        <div className="lg:w-2/3 flex flex-col min-h-0 flex-1">
          <div className="bg-white rounded-lg shadow flex flex-col h-full">
            <div className="p-3 lg:p-4 border-b border-gray-200 shrink-0">
              <h3 className="text-base lg:text-lg font-semibold text-black">
                AI Assistant
              </h3>
              <p className="text-xs lg:text-sm text-gray-600" id="chatStatus">
                {activeFeature
                  ? `Chatting about: ${
                      activeFeature === "search"
                        ? "Search Papers"
                        : activeFeature === "papers"
                        ? "My Papers"
                        : "Compare & Analyze"
                    }`
                  : "General chat - Ask anything"}
              </p>
            </div>

            <div
              ref={chatRef}
              id="chatContainer"
              className="flex-1 p-3 lg:p-4 overflow-y-auto min-h-0"
            >
              <div id="messagesContainer" className="space-y-3 lg:space-y-4">
                {messages.map((m) => (
                  <div key={m.id}>
                    {m.sender === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs wrap-break-word">
                          {m.text}
                        </div>
                      </div>
                    ) : m.sender === "system" ? (
                      <div className="flex justify-center">
                        <div className="bg-blue-100 text-blue-800 rounded-lg px-4 py-2 max-w-md text-center text-sm">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs wrap-break-word">
                          {m.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {typing && (
                  <div id="typingIndicator">
                    <div className="flex justify-start">
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
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 lg:p-4 border-t border-gray-200 shrink-0">
              <form
                id="chatForm"
                className="space-y-2 lg:space-y-3"
                onSubmit={onSubmit}
              >
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <div className="flex space-x-1 lg:space-x-2">
                    <button
                      type="button"
                      id="searchBtn"
                      className="p-1.5 lg:p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="Search Papers"
                      onClick={() => setFeature("search", "Search Papers")}
                    >
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600"
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
                      className="p-1.5 lg:p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
                      title="My Papers"
                      onClick={() => setFeature("papers", "My Papers")}
                    >
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-green-600"
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
                      className="p-1.5 lg:p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
                      title="Compare & Analyze"
                      onClick={() => setFeature("analyze", "Compare & Analyze")}
                    >
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600"
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
                      activeFeature
                        ? `Ask about ${
                            activeFeature === "search"
                              ? "Search Papers"
                              : activeFeature === "papers"
                              ? "My Papers"
                              : "Compare & Analyze"
                          }...`
                        : "Type your message here..."
                    }
                    className="flex-1 text-black px-2 lg:px-3 py-1.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    id="sendBtn"
                    className="bg-blue-600 text-white px-3 lg:px-6 py-1.5 lg:py-2 text-sm lg:text-base rounded hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
              <p className="text-xs text-gray-500 mt-1 lg:mt-2">
                Chat freely or click feature icons for specialized assistance.
                AI responses are not yet implemented.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
