"use client";

import type { FormEvent } from "react";

export function InputForm({
  input,
  setInput,
  onSubmit,
}: {
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <div className="sticky bottom-0 left-0 z-10 border-t border-slate-100 bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
      <form
        id="chatForm"
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-4xl"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="messageInput">
            Ask a question
          </label>
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 shadow-inner shadow-white/80 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0011.46 11.45z"
              />
            </svg>
            <input
              type="text"
              id="messageInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your papers or research goals..."
              className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
