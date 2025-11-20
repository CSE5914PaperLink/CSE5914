"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { signOutUser } from "@/lib/firebase";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { firebaseUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOutUser();
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="bg-linear-to-r from-blue-700 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center container">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          PaperLink
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
            href="/library"
            className="hover:underline text-white/90 hover:text-white"
          >
            Library
          </Link>
          {firebaseUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-2xl font-bold hover:text-blue-100 text-white transition-colors flex items-center gap-2"
              >
                {firebaseUser.displayName || firebaseUser.email?.split("@")[0]}
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-50 transition-all duration-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
