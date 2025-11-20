import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen flex flex-col">
      {/* Hero */}
      <header className="text-center py-28 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-inner">
        <h2 className="text-5xl font-extrabold mb-6 tracking-tight">
          Compare, Analyze, and Explore <br /> Computer Science Research
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Search across papers, compare algorithms, and link directly to real
          code — all in one intelligent research platform.
        </p>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-10">
        {[
          {
            title: "📚 Structured Comparison",
            text: "Compare algorithms, datasets, and results side-by-side — not just summaries.",
          },
          {
            title: "⚡ Multi-Paper Search",
            text: "Search, filter, and analyze multiple papers at once — no downloads needed.",
          },
          {
            title: "💻 Code Linking",
            text: "Automatically link papers to their GitHub codebases for deeper understanding.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 text-center hover:-translate-y-1"
          >
            <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.text}</p>
          </div>
        ))}
      </section>

      {/* Team */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Meet the Team</h3>
          <p className="text-gray-600 mb-10">
            Developed by PaperLink Team — AU25 CSE 5914 Knowledge-Based Systems
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              "Jeevan Nadella",
              "Adam Khalil",
              "Yutong Ye",
              "Athin Shetty",
              "Jason Zhang",
            ].map((name, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow hover:shadow-md transition-all p-6"
              >
                <h4 className="font-semibold text-lg">{name}</h4>
                <p className="text-gray-500 text-sm mt-1">
                  4th Year CSE, AI Spec.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-blue-700 text-white mt-auto">
        <p className="text-sm">
          &copy; 2025 <span className="font-semibold">PaperLink</span> |
          Built with Next.js, FastAPI, and AWS
        </p>
      </footer>
    </div>
  );
}
