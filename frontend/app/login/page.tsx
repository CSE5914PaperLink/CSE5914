"use client";

import Link from "next/link";
import LoginButton from "../../components/LoginButton";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 text-slate-900">
      <div className="relative isolate px-6 py-20 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 rounded-3xl border border-slate-100 bg-white/90 p-10 shadow-2xl shadow-blue-100 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-blue-500">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l8.49-8.49a3 3 0 014.24 4.24l-8.49 8.49a1 1 0 01-1.42-1.42l7.78-7.78"
                />
              </svg>
              PaperLink
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Welcome to PaperLink.
            </h1>
            <div className="mt-10 rounded-3xl border border-slate-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5 text-sm text-slate-600 shadow-inner">
              <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                One workspace
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                Discovery, comparison, and chat stay in sync
              </h3>
              <p className="mt-2">
                Sign in and PaperLink will keep your saved PDFs, GitHub repos,
                and conversation history aligned so you can jump back into any
                conversation with ease.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
            <p className="flex items-center justify-center gap-2 text-center text-xs uppercase tracking-[0.4em] text-blue-500">
              Sign In
            </p>
            <h2 className="mt-3 text-2xl font-bold text-center">
              Login to PaperLink
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Access your notebooks, favorites, and conversation history.
            </p>
            <div className="mt-8">
              <LoginButton />
            </div>
            <div className="mt-8 text-center text-sm text-slate-500">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
