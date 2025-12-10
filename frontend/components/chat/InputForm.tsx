"use client";

import type { FormEvent } from "react";

export function InputForm({
  input,
  setInput,
  onSubmit,
  githubOnly = false,
  onGithubToggle,
}: {
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  githubOnly?: boolean;
  onGithubToggle?: () => void;
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
            {onGithubToggle && (
              <button
                type="button"
                onClick={onGithubToggle}
                className={`flex-shrink-0 rounded-lg p-1.5 transition-all ${
                  githubOnly
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                }`}
                title={
                  githubOnly
                    ? "GitHub filter active"
                    : "Filter GitHub sources only"
                }
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 .5C5.648.5.5 5.787.5 12.266c0 5.194 3.438 9.607 8.205 11.168.6.115.82-.27.82-.6 0-.297-.012-1.28-.017-2.322-3.338.744-4.042-1.665-4.042-1.665-.546-1.424-1.334-1.805-1.334-1.805-1.09-.769.083-.754.083-.754 1.205.086 1.839 1.28 1.839 1.28 1.07 1.903 2.809 1.353 3.495 1.035.108-.807.418-1.353.762-1.664-2.665-.315-5.466-1.383-5.466-6.156 0-1.36.465-2.47 1.235-3.34-.124-.317-.535-1.592.115-3.32 0 0 1.005-.33 3.3 1.27a11.006 11.006 0 0 1 6 0c2.292-1.6 3.296-1.27 3.296-1.27.652 1.728.241 3.003.118 3.32.77.87 1.232 1.98 1.232 3.34 0 4.784-2.806 5.836-5.48 6.146.43.385.823 1.138.823 2.295 0 1.657-.015 2.994-.015 3.404 0 .333.216.722.825.598C20.065 21.87 23.5 17.457 23.5 12.266 23.5 5.787 18.352.5 12 .5Z" />
                </svg>
              </button>
            )}
            <div className="flex flex-1 items-center gap-3">
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
