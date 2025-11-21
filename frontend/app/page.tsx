"use client";

import Link from "next/link";

const workflowPillars = [
  {
    title: "Structured Comparison",
    description:
      "Summaries of methods, results, and limitations across papers in a synchronized view.",
  },
  {
    title: "Discovery + Library",
    description:
      "Search arXiv, favorite key PDFs, and keep a curated reading list ready for follow-up questions.",
  },
  {
    title: "Contextual Chat",
    description:
      "Ask grounded questions and receive citation-backed answers linked to exact sections or repo files.",
  },
];

const workflowSteps = [
  {
    label: "01",
    title: "Capture papers fast",
    detail:
      "Pull PDFs from discovery or upload directly; metadata and GitHub repos follow automatically.",
  },
  {
    label: "02",
    title: "Chat and compare",
    detail:
      "Explore methodologies side-by-side and get summaries of key results and limitations.",
  },
  {
    label: "03",
    title: "Iterate with context",
    detail:
      "Follow up with deeper questions, code references, and citations without losing track.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-slate-100 bg-white/70 p-10 shadow-2xl shadow-blue-100 md:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center md:text-left">
            <p className="flex items-center justify-center md:justify-start gap-2 text-xs uppercase tracking-[0.4em] text-blue-500">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l8.49-8.49a3 3 0 014.24 4.24l-8.49 8.49a1 1 0 01-1.42-1.42l7.78-7.78"
                />
              </svg>
              Paperlink
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Compare, analyze, and explore computer science research faster.
            </h1>
            <p className="mt-4 text-base text-slate-500">
              Search thousands of papers, track your library, chat with
              documents, and compare methodologies in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 md:justify-start justify-center">
              <Link
                href="/discovery"
                className="cursor-pointer rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5"
              >
                Discover Papers
              </Link>
              <Link
                href="/compare"
                className="cursor-pointer rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200"
              >
                Compare Papers
              </Link>
              <Link
                href="/chat"
                className="cursor-pointer rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200"
              >
                Open Chat
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 text-left shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500">
              Highlights
            </p>
            <div className="mt-6 space-y-4">
              {[
                "ArXiv discovery with smart filters",
                "Library curation + favorites",
                "RAG chat with PDF viewer",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 px-4 py-4 text-sm text-slate-500">
              Built for speed: discovery, comparison, and chat in one workflow.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-xl shadow-blue-100">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                Workflow
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Research with memory
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                PaperLink remembers every document you ingest. Flow from
                discovery to comparison to contextual chat without losing
                citations or code references.
              </p>
              <div className="mt-8 space-y-4">
                {workflowSteps.map((step) => (
                  <div
                    key={step.label}
                    className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3 shadow-sm shadow-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">
                        {step.label}
                      </span>
                      <p className="text-sm font-semibold text-slate-900">
                        {step.title}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 text-white shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff20,transparent_50%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200">
                  Pillars
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  All tools, one thread
                </h3>
                <p className="mt-2 text-xs text-slate-200">
                  Each step is citation-aware and instantly available inside
                  chat.
                </p>
                <div className="mt-6 space-y-4">
                  {workflowPillars.map((pillar) => (
                    <div
                      key={pillar.title}
                      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur"
                    >
                      <p className="text-[0.8rem] font-semibold text-blue-100">
                        {pillar.title}
                      </p>
                      <p className="mt-1 text-[0.8rem] text-slate-200">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
            Team
          </p>
          <h2 className="mt-3 text-3xl font-semibold">PaperLink Builders</h2>
          <p className="mt-2 text-sm text-slate-500">
            AU25 CSE 5914 Knowledge-Based Systems
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              "Jeevan Nadella",
              "Adam Khalil",
              "Yutong Ye",
              "Athin Shetty",
              "Jason Zhang",
            ].map((name) => (
              <div
                key={name}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-slate-700 shadow-sm"
              >
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-slate-500">4th Year CSE, AI Spec.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-500">
        © 2025 PaperLink · Built with Next.js, FastAPI, Chroma, Firebase
      </footer>
    </main>
  );
}
