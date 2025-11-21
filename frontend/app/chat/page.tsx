"use client";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { Messages } from "@/components/chat/Messages";
import { InputForm, type Feature } from "@/components/chat/InputForm";
import { PdfViewer } from "@/components/chat/PdfViewer";
import { annotateWithCitations } from "@/components/chat/citations";
import { dedupeSources } from "@/components/chat/sourceUtils";
import type {
  ChatMessage,
  LibraryItem,
  SourceChunk,
} from "@/components/chat/types";
import { useUser } from "@/contexts/UserContext";

export default function ChatPage() {
  const { dataConnectUserId } = useUser();

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

  // Split ratio for chat/pdf (0..1). Sidebar stays auto.
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

  const [active, setActive] = useState<Feature>(null);
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

  const onFeature = (f: Exclude<Feature, null>, name: string) => {
    setActive(f);
    addMessage(
      `Switched to ${name} mode. You can now ask questions related to this feature.`,
      "system"
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const labels = {
      search: "Search Papers",
      papers: "My Papers",
      analyze: "Compare & Analyze",
    } as const;
    const display = active
      ? `[${labels[active as Exclude<Feature, null>]}] ${trimmed}`
      : trimmed;
    addMessage(display, "user");
    setInput("");
    setTyping(true);

    try {
      // Build system instruction based on active feature
      let systemInstruction =
        "You are a helpful AI assistant for researchers working with computer science papers.";
      if (active === "search") {
        systemInstruction +=
          " You help users discover and search for research papers.";
      } else if (active === "papers") {
        systemInstruction += " You help users manage their paper collections.";
      } else if (active === "analyze") {
        systemInstruction +=
          " You help users compare and analyze research papers.";
      }

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
  // remaining viewport. Also disable body scrolling while this page is active
  // so the visible area (navbar + chat) never causes a window scrollbar.
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

    // Prevent the document from scrolling while on the chat page. Save
    // previous overflow and restore on unmount.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", update);
      document.body.style.overflow = prev || "";
    };
  }, []);
  const navbarHeight = navHeight; // used below in styles
  const handleWidthPx = 6;
  // 4-column grid: sidebar | chat | handle | pdf
  // use fr units for chat/pdf so they split the remaining space after sidebar correctly
  const gridTemplate = `auto ${split}fr ${handleWidthPx}px ${1 - split}fr`;

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
          <Sidebar
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
            <InputForm
              active={active}
              input={input}
              setInput={setInput}
              onFeature={onFeature}
              onSubmit={onSubmit}
            />
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
