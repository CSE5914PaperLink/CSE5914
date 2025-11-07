"use client";

export type Feature = "search" | "papers" | "analyze" | null;

export function InputForm({
  active,
  input,
  setInput,
  onFeature,
  onSubmit,
}: {
  active: Feature;
  input: string;
  setInput: (val: string) => void;
  onFeature: (f: Exclude<Feature, null>, name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="border-t border-neutral-200 p-4 bg-white">
      <form id="chatForm" onSubmit={onSubmit}>
        <div className="flex items-center gap-3 max-w-3xl mx-auto container">
          <div className="flex space-x-3">
            <button
              type="button"
              id="searchBtn"
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              title="Search Papers"
              onClick={() => onFeature("search", "Search Papers")}
            >
              <svg
                className="w-5 h-5 text-neutral-600"
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
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              title="My Papers"
              onClick={() => onFeature("papers", "My Papers")}
            >
              <svg
                className="w-5 h-5 text-neutral-600"
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
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              title="Compare & Analyze"
              onClick={() => onFeature("analyze", "Compare & Analyze")}
            >
              <svg
                className="w-5 h-5 text-neutral-600"
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
              active
                ? `Ask about ${
                    active === "search"
                      ? "Search Papers"
                      : active === "papers"
                      ? "My Papers"
                      : "Compare & Analyze"
                  }...`
                : "Type your message here..."
            }
            className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-500 text-neutral-900"
            required
          />
          <button
            type="submit"
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-colors font-semibold"
          >
            Send
          </button>
        </div>
      </form>
      <p className="text-center text-[11px] text-neutral-400 mt-2">
        Click feature icons to set context.
      </p>
    </div>
  );
}
