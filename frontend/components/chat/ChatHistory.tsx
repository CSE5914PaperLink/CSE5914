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
}

// Simple SVG icons
const ChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    if (!confirm("Are you sure you want to delete this conversation?")) return;

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

  if (isCollapsed) {
    return (
      <div className="h-full bg-neutral-50 border-r border-neutral-200 flex items-start p-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-neutral-200 rounded transition-colors"
          title="Expand chat history"
        >
          <ChevronRight />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-neutral-50 border-r border-neutral-200 flex flex-col w-64">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200">
        <h2 className="font-semibold text-sm text-neutral-700">Chat History</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="New Chat"
          >
            <Plus />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-neutral-200 rounded transition-colors"
            title="Collapse"
          >
            <ChevronLeft />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {loading && sessions.length === 0 ? (
          <div className="p-4 text-sm text-neutral-500">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-neutral-500">
            No chat history yet. Start a new conversation!
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 cursor-pointer transition-colors group relative ${
                  currentSessionId === session.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-neutral-100"
                }`}
              >
                {editingId === session.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(session.id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(session.id)}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                      title="Save"
                    >
                      <Check />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Cancel"
                    >
                      <X />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => onSessionSelect(session.id)}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-neutral-800 line-clamp-2 flex-1">
                        {session.title}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(session);
                          }}
                          className="p-1 hover:bg-neutral-200 rounded transition-colors"
                          title="Edit title"
                        >
                          <Edit2 />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(session.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {formatTimestamp(session.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
