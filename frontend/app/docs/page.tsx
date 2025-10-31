import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <nav className="bg-blue-700 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">CS Paper Compare - API Docs</h1>
          <div className="space-x-4">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/app" className="hover:underline">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            API Documentation
          </h2>
          <div className="bg-yellow-100 border border-yellow-300 rounded p-4 mb-8">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-yellow-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Documentation Coming Soon
                </h3>
                <p className="text-yellow-700 text-sm">
                  The API documentation is currently being developed and will be
                  available soon.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Overview
              </h3>
              <p className="text-gray-700 mb-4">
                The CS Paper Compare API enables researchers to search, analyze,
                and compare computer science research papers from multiple
                sources including arXiv and OpenAlex. The API integrates with
                GitHub to link papers with their corresponding codebases for
                comprehensive analysis.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Key Features
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-2">
                    🔍 Paper Discovery
                  </h4>
                  <p className="text-gray-600">
                    Search and discover research papers from external sources
                    like arXiv and OpenAlex.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-2">
                    📚 Paper Management
                  </h4>
                  <p className="text-gray-600">
                    Import, organize, and manage your collection of research
                    papers.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-2">
                    💻 Code Integration
                  </h4>
                  <p className="text-gray-600">
                    Link papers to their GitHub repositories for comprehensive
                    code analysis.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-2">
                    🤖 AI-Powered Chat
                  </h4>
                  <p className="text-gray-600">
                    Ask questions and get insights across multiple papers using
                    advanced AI.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                API Endpoints (Preview)
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      GET
                    </span>
                    <code className="text-gray-800">/api/discovery/search</code>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Search for papers in external sources
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      POST
                    </span>
                    <code className="text-gray-800">/api/papers/import</code>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Import papers from external sources
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      POST
                    </span>
                    <code className="text-gray-800">/api/chat/qa</code>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Perform RAG-based Q&A on papers and code
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Getting Started
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-800 mb-4">
                  <strong>Ready to explore?</strong> Start by using our
                  interactive dashboard to search for papers and experience the
                  platform&#39;s capabilities.
                </p>
                <Link
                  href="/app"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Team
              </h3>
              <p className="text-gray-700">
                Developed by Team 1 for AU25 CSE 5914 Knowledge-Based Systems at
                The Ohio State University.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
