"use client";
import { useEffect, useState } from "react";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryProps {
  userId: string | null;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  refreshTrigger?: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Simple SVG icons

const ChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const Edit2 = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const Trash2 = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const X = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Check = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Plus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export function ChatHistory({
  userId,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  refreshTrigger,
  collapsed,
  onToggleCollapse,
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/chat/sessions?userId=${encodeURIComponent(userId)}`
        );
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data.chatSessions || []);
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [userId]);

  useEffect(() => {
    if (!userId || refreshTrigger === undefined) return;

    const fetchSessions = async () => {
      try {
        const response = await fetch(
          `/api/chat/sessions?userId=${encodeURIComponent(userId)}`
        );
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data.chatSessions || []);
      } catch (error) {
        console.error("Error refreshing chat sessions:", error);
      }
    };

    fetchSessions();
  }, [refreshTrigger, userId]);

  const handleEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = async (sessionId: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update session");

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, title: editTitle.trim() } : s
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete session");

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      // Notify profile page to update chat sessions count
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event('chatSessionsUpdated'));
        localStorage.setItem('chat_sessions_updated', Date.now().toString());
      }
      
      // If deleting current session, clear the chat
      if (sessionId === currentSessionId) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-500">
            Chat
          </p>
          <h2 className="text-lg font-semibold text-slate-900">History</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNewChat}
            className="cursor-pointer rounded-2xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            title="New Chat"
          >
            <div className="flex items-center gap-1">
              <Plus /> New
            </div>
          </button>
          <button
            onClick={onToggleCollapse}
            className="cursor-pointer rounded-full border border-slate-200 p-2 text-slate-600 hover:border-slate-300"
            title={collapsed ? "Expand section" : "Collapse section"}
          >
            {collapsed ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && sessions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-6 text-center text-xs text-slate-500">
              Loading conversations…
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-xs text-slate-500">
              No chats yet. Start a conversation to see it here.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const isActive = currentSessionId === session.id;
                return (
                  <div
                    key={session.id}
                    className={`rounded-xl border p-2.5 text-sm shadow-sm transition hover:border-blue-200 ${
                      isActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {editingId === session.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-200 px-2 py-1 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(session.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(session.id)}
                          className="cursor-pointer rounded-full border border-green-200 bg-green-50 p-1 text-green-600 hover:bg-green-100"
                          title="Save"
                        >
                          <Check />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="cursor-pointer rounded-full border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100"
                          title="Cancel"
                        >
                          <X />
                        </button>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSessionSelect(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSessionSelect(session.id);
                          }
                        }}
                        className="flex w-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 rounded-xl cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex-1 text-sm font-semibold text-slate-900 line-clamp-2">
                            {session.title}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(session);
                              }}
                              className="cursor-pointer rounded-full border border-blue-200 bg-blue-50 p-1 text-blue-600 hover:bg-blue-100"
                              title="Rename"
                            >
                              <Edit2 />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id);
                              }}
                              className="cursor-pointer rounded-full border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatTimestamp(session.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
