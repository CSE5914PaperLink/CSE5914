"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { Messages } from "@/components/chat/Messages";
import { InputForm } from "@/components/chat/InputForm";
import { ChatHistory } from "@/components/chat/ChatHistory";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("@/components/chat/PdfViewer").then((mod) => mod.PdfViewer),
  { ssr: false }
);

import { annotateWithCitations } from "@/components/chat/citations";
import { dedupeSources } from "@/components/chat/sourceUtils";
import type {
  ChatMessage,
  LibraryItem,
  SourceChunk,
} from "@/components/chat/types";
import { useUser } from "@/contexts/UserContext";

const ChevronRight = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const ChevronLeft = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

export default function ChatPage() {
  const { dataConnectUserId } = useUser();

  // Chat session management
  const [sessionId, setSessionId] = useState<string | null>(() => {
    // Try to restore session ID from sessionStorage
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("chat_session_id");
    }
    return null;
  });
  const [refreshHistory, setRefreshHistory] = useState(0);

  // Thread ID for agent conversation memory
  const [threadId] = useState(() => {
    // Generate a unique thread ID for this session
    // Persists across page refreshes via sessionStorage
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem("chat_thread_id")
        : null;
    if (stored) return stored;
    const newId = `thread-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("chat_thread_id", newId);
    }
    return newId;
  });

  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [paperContextCollapsed, setPaperContextCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);

  // Split ratio for chat/pdf (0..1). Context column stays fixed width.
  // Use a fixed SSR-safe initial value to avoid hydration mismatch; load stored value after mount.
  const [split, setSplit] = useState<number>(0.5);
  const splitRef = useRef(split);
  const handleRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const v = window.localStorage.getItem("chat_pdf_split");
    const n = v ? Number(v) : NaN;
    if (isFinite(n) && n >= 0.2 && n <= 0.8) {
      setSplit(n);
      splitRef.current = n;
    }
  }, []);
  useEffect(() => {
    splitRef.current = split;
  }, [split]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      text: "Hello! I'm your AI research assistant. Select papers on the left side and ask me any question!",
      sender: "ai",
    },
  ]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);

  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [highlightSource, setHighlightSource] = useState<SourceChunk | null>(
    null
  );

  // Create a new chat session
  const createNewSession = async () => {
    if (!dataConnectUserId) return;

    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: dataConnectUserId,
          title: "New Chat",
        }),
      });

      if (!response.ok) throw new Error("Failed to create session");

      const data = await response.json();
      const newSessionId = data.chatSession_insert.id;

      setSessionId(newSessionId);
      // Persist session ID to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("chat_session_id", newSessionId);
      }
      setMessages([
        {
          id: "intro",
          text: "Hello! I'm your AI research assistant. Select papers on the left side and ask me any question!",
          sender: "ai",
        },
      ]);
      setRefreshHistory((prev) => prev + 1);

      // Notify profile page to update chat sessions count
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("chatSessionsUpdated"));
        localStorage.setItem("chat_sessions_updated", Date.now().toString());
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Load an existing chat session
  const loadSession = async (loadSessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${loadSessionId}`);
      if (!response.ok) throw new Error("Failed to load session");

      const data = await response.json();
      const chats = data.chats || [];

      setSessionId(loadSessionId);
      // Persist session ID to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("chat_session_id", loadSessionId);
      }

      // Convert chats to messages format
      const loadedMessages: ChatMessage[] = [
        {
          id: "intro",
          text: "Hello! I'm your AI research assistant. Select papers on the left side and ask me any question!",
          sender: "ai",
        },
      ];

      chats.forEach((chat: { content: string; response: string | null }) => {
        loadedMessages.push({
          id: crypto.randomUUID(),
          text: chat.content,
          sender: "user",
        });
        if (chat.response) {
          loadedMessages.push({
            id: crypto.randomUUID(),
            text: chat.response,
            sender: "ai",
          });
        }
      });

      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  // Create initial session when component mounts (only if no existing session)
  useEffect(() => {
    if (dataConnectUserId && !sessionId) {
      createNewSession();
    }
  }, [dataConnectUserId, sessionId]);

  useEffect(() => {
    // fetch user's library from API that merges DataConnect + ChromaDB
    if (!dataConnectUserId) return;

    let mounted = true;
    fetch(`/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setLibrary(data.results || []);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, [dataConnectUserId]);

  const addMessage = (text: string, sender: "user" | "ai" | "system") => {
    setMessages((m) => [...m, { id: crypto.randomUUID(), text, sender }]);
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage(trimmed, "user");
    setInput("");
    setTyping(true);

    try {
      // Build system instruction based on active feature
      const systemInstruction =
        "You are a helpful AI assistant for researchers working with computer science papers.";

      // include selected doc ids for RAG
      const docs = Array.from(selectedDocs.values());
      const docTitleMap = new Map(
        library.map((item) => [item.metadata.doc_id, item.metadata.title])
      );
      const docDetails = docs.map((docId) => ({
        doc_id: docId,
        title: docTitleMap.get(docId) || docId,
      }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmed,
          system: systemInstruction,
          doc_ids: docs,
          doc_titles: docDetails,
          thread_id: threadId, // Pass thread ID for conversation memory
          session_id: sessionId, // Pass session ID for database persistence
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to get response");
      }

      // Check if response is streaming (agent mode) or JSON (simple chat)
      const contentType = response.headers.get("content-type");
      const isStreaming = contentType?.includes("text/event-stream");

      if (isStreaming) {
        // Handle streaming response from agent
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        // Create initial AI message with status
        const aiMessageId = crypto.randomUUID();
        setMessages((m) => [
          ...m,
          {
            id: aiMessageId,
            text: "",
            sender: "ai",
            status: "thinking",
          },
        ]);
        setTyping(false);

        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const event = JSON.parse(line);

              if (event.type === "status") {
                // Update the status of the AI message
                setMessages((m) =>
                  m.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, status: event.value }
                      : msg
                  )
                );
              } else if (event.type === "token") {
                // Append token to content
                fullContent += event.value;
                setMessages((m) =>
                  m.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, text: fullContent } : msg
                  )
                );
              } else if (event.type === "sources") {
                // Update sources on the AI message
                // Backend now sends a dictionary with IDs as keys
                type SourceData = {
                  id?: string;
                  type: "text" | "image";
                  doc_id?: string;
                  title?: string;
                  heading?: string;
                  caption?: string;
                  distance?: number;
                  content?: string;
                  chunk_index?: number;
                  page?: number;
                  filename?: string;
                  image_data?: string;
                  citation_number?: number;
                  bbox?: {
                    left: number;
                    top: number;
                    right: number;
                    bottom: number;
                  };
                };

                // Convert dictionary to array
                const sourcesDict = (event.value || {}) as Record<
                  string,
                  SourceData
                >;
                const sourcesWithOrder = Object.entries(sourcesDict).map(
                  ([id, src], index) => ({
                    source: {
                      id: id,
                      type: src.type,
                      doc_id: src.doc_id,
                      title: src.title,
                      heading: src.heading,
                      caption: src.caption,
                      distance: src.distance,
                      content: src.content,
                      chunk_index: src.chunk_index,
                      page: src.page,
                      filename: src.filename,
                      image_data: src.image_data,
                      citation_number: src.citation_number,
                      bbox: src.bbox,
                    } satisfies SourceChunk,
                    order: index,
                  })
                );

                const orderedSources = sourcesWithOrder
                  .sort((a, b) => {
                    const aNum = a.source.citation_number ?? a.order + 1;
                    const bNum = b.source.citation_number ?? b.order + 1;
                    return aNum - bNum;
                  })
                  .map((entry) => entry.source);

                const dedupedSources = dedupeSources(orderedSources);
                const annotatedText = annotateWithCitations(
                  fullContent,
                  dedupedSources
                );
                fullContent = annotatedText;

                setMessages((m) =>
                  m.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, sources: dedupedSources, text: annotatedText }
                      : msg
                  )
                );
              } else if (event.type === "error") {
                throw new Error(event.value);
              }
            } catch (e) {
              // Skip invalid JSON lines
              if (e instanceof Error && !e.message.includes("Unexpected")) {
                console.warn("Failed to parse streamed event line:", line, e);
                throw e;
              } else {
                console.warn("Non-error JSON parse failure for line:", line, e);
              }
            }
          }
        }

        // Clear status when done
        setMessages((m) =>
          m.map((msg) =>
            msg.id === aiMessageId ? { ...msg, status: undefined } : msg
          )
        );
      } else {
        // Handle JSON response (simple chat mode)
        const data = await response.json();
        const aiResponse =
          data.content || "Sorry, I couldn't generate a response.";

        const images = data.images || [];
        const chunks = data.chunks || [];
        const imageChunks = data.images || [];

        // Combine text and image chunks into sources
        const textSources: SourceChunk[] = chunks.map(
          (
            chunk: {
              id: string;
              doc_id?: string;
              distance?: number;
              content?: string;
              chunk_index?: number;
              page?: number;
              heading?: string;
            },
            index: number
          ) => ({
            id: chunk.id,
            type: "text" as const,
            doc_id: chunk.doc_id,
            distance: chunk.distance,
            content: chunk.content,
            chunk_index: chunk.chunk_index,
            page: chunk.page,
            heading: chunk.heading,
            citation_number: index + 1,
          })
        );
        const imageSources: SourceChunk[] = imageChunks.map(
          (
            img: {
              id: string;
              doc_id?: string;
              distance?: number;
              content?: string;
              filename?: string;
              page?: number;
              url?: string;
              image_data?: string;
              caption?: string;
              bbox?: {
                left?: number;
                right?: number;
                top?: number;
                bottom?: number;
              };
            },
            index: number
          ) => ({
            id: img.id,
            type: "image" as const,
            doc_id: img.doc_id,
            distance: img.distance,
            content: img.content,
            filename: img.filename,
            page: img.page,
            url: img.url,
            image_data: img.image_data,
            caption: img.caption,
            citation_number: textSources.length + index + 1,
            bbox: img.bbox
              ? {
                  left: img.bbox.left ?? 0,
                  right: img.bbox.right ?? 1,
                  top: img.bbox.top ?? 0,
                  bottom: img.bbox.bottom ?? 1,
                }
              : undefined,
          })
        );
        const sources: SourceChunk[] = dedupeSources([
          ...textSources,
          ...imageSources,
        ]);

        setTyping(false);
        const annotatedResponse =
          sources.length > 0
            ? annotateWithCitations(aiResponse, sources)
            : aiResponse;
        addMessage(annotatedResponse, "ai");

        // Add images and sources to the last message
        setMessages((m) => {
          const updated = [...m];
          if (updated.length > 0) {
            if (images.length > 0) {
              updated[updated.length - 1].images = images;
            }
            if (sources.length > 0) {
              updated[updated.length - 1].text = annotatedResponse;
              updated[updated.length - 1].sources = sources;
            }
          }
          return updated;
        });
      }
    } catch (error) {
      setTyping(false);
      addMessage(
        `Error: ${
          error instanceof Error ? error.message : "Failed to get AI response"
        }`,
        "system"
      );
    }
  };
  // Compute Navbar height at runtime so the chat area can exactly fill the
  // remaining viewport.
  const [navHeight, setNavHeight] = useState<number>(64);
  useEffect(() => {
    const update = () => {
      const nav = document.querySelector("nav");
      const h = nav ? Math.round(nav.getBoundingClientRect().height) : 64;
      setNavHeight(h);
    };
    // compute once and also on resize
    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);
  const navbarHeight = navHeight; // used below in styles
  const handleWidthPx = 6;
  const expandedContextWidth = 360;
  const collapsedContextWidth = 0;
  const contextColumnWidth = contextCollapsed
    ? collapsedContextWidth
    : expandedContextWidth;
  const contextGapWidth = contextCollapsed ? 48 : 12;
  // 5-column grid: context stack | spacer | chat | drag handle | pdf
  const gridTemplate = `${contextColumnWidth}px ${contextGapWidth}px ${split}fr ${handleWidthPx}px ${
    1 - split
  }fr`;

  return (
    <div className="w-screen flex flex-col bg-white overflow-hidden">
      <div
        className="min-w-0 min-h-0"
        style={{
          height: `calc(100vh - ${navbarHeight}px)`,
          overflow: "hidden",
        }}
      >
        <div
          className="h-full grid gap-0"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div
            className={`relative flex h-full flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100 ${
              contextCollapsed ? "" : "border-r border-slate-200"
            }`}
          >
            {!contextCollapsed && (
              <div className="flex flex-1 min-h-0 flex-col divide-y divide-slate-200">
                <div
                  className={`flex min-h-0 flex-col ${
                    paperContextCollapsed ? "" : "flex-1"
                  }`}
                >
                  <Sidebar
                    collapsed={paperContextCollapsed}
                    onToggleCollapse={() =>
                      setPaperContextCollapsed((prev) => !prev)
                    }
                    library={library}
                    selectedDocs={selectedDocs}
                    onToggleSelect={(id: string, checked: boolean) => {
                      setSelectedDocs((s) => {
                        const copy = new Set(s);
                        if (checked) copy.add(id);
                        else copy.delete(id);
                        return copy;
                      });
                    }}
                    onDelete={async (id: string) => {
                      const item = library.find((x) => x.id === id);
                      const title =
                        item?.metadata?.title || item?.metadata?.doc_id || id;
                      try {
                        const res = await fetch(
                          `/api/library/delete?id=${encodeURIComponent(id)}`,
                          { method: "DELETE" }
                        );
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          addMessage(
                            `Error deleting ${title}: ${
                              err.error || res.statusText
                            }` as string,
                            "system"
                          );
                          return;
                        }
                        setLibrary((prev) => prev.filter((x) => x.id !== id));
                        setSelectedDocs((s) => {
                          const copy = new Set(s);
                          copy.delete(id);
                          return copy;
                        });
                      } catch (err) {
                        const msg =
                          err instanceof Error ? err.message : "Unknown error";
                        addMessage(`Error deleting ${title}: ${msg}`, "system");
                      }
                    }}
                  />
                </div>
                <div
                  className={`flex min-h-0 flex-col ${
                    historyCollapsed ? "" : "flex-1"
                  }`}
                >
                  <ChatHistory
                    userId={dataConnectUserId}
                    currentSessionId={sessionId}
                    onSessionSelect={loadSession}
                    onNewChat={createNewSession}
                    refreshTrigger={refreshHistory}
                    collapsed={historyCollapsed}
                    onToggleCollapse={() =>
                      setHistoryCollapsed((prev) => !prev)
                    }
                  />
                </div>
              </div>
            )}
            {!contextCollapsed && (
              <button
                className="absolute top-1/2 right-[-22px] z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:border-blue-200 hover:text-slate-900"
                title="Collapse context"
                onClick={() => setContextCollapsed(true)}
              >
                <ChevronLeft />
              </button>
            )}
          </div>
          <div className="relative flex items-center justify-center bg-white">
            {contextCollapsed && (
              <button
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:border-blue-200 hover:text-slate-900"
                title="Expand context"
                onClick={() => setContextCollapsed(false)}
              >
                <ChevronRight />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <Messages
              messages={messages}
              typing={typing}
              chatRef={chatRef}
              onSourceClick={(source) => {
                setHighlightSource(source);
                // Ensure the document containing the source is selected
                if (source.doc_id && !selectedDocs.has(source.doc_id)) {
                  setSelectedDocs((s) => new Set(s).add(source.doc_id!));
                }
              }}
            />
            <InputForm input={input} setInput={setInput} onSubmit={onSubmit} />
          </div>
          {/* Drag handle between chat and PDF */}
          <div
            ref={handleRef}
            className="h-full cursor-col-resize bg-neutral-200 hover:bg-neutral-300 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const container = handleRef.current?.parentElement;
              if (!container) return;
              const rect = container.getBoundingClientRect();
              // subtract sidebar width and handle width to get adjustable area
              const sidebarEl = container.children[0] as
                | HTMLElement
                | undefined;
              const sidebarWidth = sidebarEl
                ? sidebarEl.getBoundingClientRect().width
                : 0;
              const available = rect.width - sidebarWidth - handleWidthPx;
              const startChatWidth = splitRef.current * available;

              // prevent text selection while dragging
              const prevUserSelect = document.body.style.userSelect;
              document.body.style.userSelect = "none";

              const onMove = (ev: MouseEvent) => {
                const delta = ev.clientX - startX;
                const newChatWidth = startChatWidth + delta;
                let next = newChatWidth / Math.max(1, available);
                next = Math.max(0.2, Math.min(0.8, next));
                if (next !== splitRef.current) {
                  splitRef.current = next;
                  setSplit(next);
                }
              };
              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
                try {
                  window.localStorage.setItem(
                    "chat_pdf_split",
                    String(splitRef.current)
                  );
                } catch {}
                // restore user select
                document.body.style.userSelect = prevUserSelect || "";
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          />

          <PdfViewer
            selectedIds={Array.from(selectedDocs)}
            library={library}
            highlightSource={highlightSource}
          />
        </div>
      </div>
    </div>
  );
}
