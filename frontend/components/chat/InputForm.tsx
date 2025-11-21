"use client";

import { type FormEvent } from "react";

interface InputFormProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function InputForm({ input, setInput, onSubmit }: InputFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-slate-200 bg-white p-4"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
}

