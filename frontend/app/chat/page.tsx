"use client";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { Messages } from "@/components/chat/Messages";
import { InputForm, type Feature } from "@/components/chat/InputForm";
import { PdfViewer } from "@/components/chat/PdfViewer";
import type { ChatMessage, LibraryItem } from "@/components/chat/types";

export default function ChatPage() {
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
      text: "Hello! I'm your AI research assistant powered by Gemini. How can I help you today?",
      sender: "ai",
    },
  ]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);

  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    // fetch user's library
    let mounted = true;
    fetch("/api/library/list")
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
  }, []);

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmed,
          system: systemInstruction,
          temperature: 0.7,
          doc_ids: docs,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      const aiResponse =
        data.content || "Sorry, I couldn't generate a response.";

      setTyping(false);
      addMessage(aiResponse, "ai");
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
                item?.metadata?.title || item?.metadata?.arxiv_id || id;
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
            <Messages messages={messages} typing={typing} chatRef={chatRef} />
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

          <PdfViewer selectedIds={Array.from(selectedDocs)} library={library} />
        </div>
      </div>
    </div>
  );
}
