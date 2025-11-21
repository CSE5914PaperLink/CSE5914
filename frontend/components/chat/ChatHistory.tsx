"use client";

import { useEffect, useState } from "react";

interface ChatHistoryProps {
  userId: string | null;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  refreshTrigger: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetch("/api/chat/sessions")
      .then((res) => res.json())
      .then((data) => {
        setSessions(data.chatSessions || []);
      })
      .catch((err) => {
        console.error("Error loading chat sessions:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, refreshTrigger]);

  if (collapsed) {
    return (
      <div className="flex items-center justify-center p-2">
        <button
          onClick={onToggleCollapse}
          className="text-slate-600 hover:text-slate-900"
          title="Expand history"
        >
          <svg
            className="w-6 h-6"
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
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <h2 className="font-semibold text-slate-900">History</h2>
        <div className="flex gap-2">
          <button
            onClick={onNewChat}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="New chat"
          >
            +
          </button>
          <button
            onClick={onToggleCollapse}
            className="text-slate-600 hover:text-slate-900"
            title="Collapse history"
          >
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
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No chat history
          </p>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  session.id === currentSessionId
                    ? "bg-blue-100 text-blue-900"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <p className="truncate">{session.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(session.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

