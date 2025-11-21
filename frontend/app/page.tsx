import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-slate-100 bg-white/70 p-10 shadow-2xl shadow-blue-100 md:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-blue-500">Paperlink</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Compare, analyze, and explore computer science research faster.
            </h1>
            <p className="mt-4 text-base text-slate-500">
              Search thousands of papers, track your library, chat with documents, and compare methodologies in seconds.
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
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Highlights</p>
            <div className="mt-6 space-y-4">
              {["ArXiv discovery with smart filters", "Library curation + favorites", "RAG chat with PDF viewer"].map(
                (item) => (
                  <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600">
                    {item}
                  </div>
                )
              )}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 px-4 py-4 text-sm text-slate-500">
              Built for speed: discovery, comparison, and chat in one workflow.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          {
            title: "Structured Comparison",
            text: "Summaries of methods, results, and limitations across papers in one view.",
          },
          {
            title: "Discovery + Library",
            text: "Search arXiv, add favorites, and keep a curated reading list for future chats.",
          },
          {
            title: "Contextual Chat",
            text: "Upload PDFs and chat with your papers using citation-backed answers.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm shadow-slate-200"
          >
            <h3 className="text-lg font-semibold text-blue-600">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm text-slate-600">{feature.text}</p>
          </div>
        ))}
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
