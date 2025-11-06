"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-linear-to-r from-blue-700 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          CS Paper Compare
        </Link>
        <div className="space-x-4 flex items-center">
          <Link
            href="/"
            className="hover:underline text-white/90 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/discovery"
            className="hover:underline text-white/90 hover:text-white"
          >
            Discover
          </Link>
          <Link
            href="/chat"
            className="hover:underline text-white/90 hover:text-white"
          >
            Chat
          </Link>
          <Link
            href="/docs"
            className="hover:underline text-white/90 hover:text-white"
          >
            API Docs
          </Link>
          <Link
            href="/login"
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-50 transition-all duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
