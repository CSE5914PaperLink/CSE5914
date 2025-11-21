"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { signOutUser } from "@/lib/firebase";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { firebaseUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/discovery", label: "Discover" },
    { href: "/chat", label: "Chat" },
    { href: "/library", label: "Library" },
    { href: "/compare", label: "Compare" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

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
    <nav className="sticky top-0 z-40 bg-white text-slate-900 shadow-lg shadow-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="cursor-pointer text-2xl font-semibold tracking-tight text-slate-900"
        >
          PaperLink
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1 rounded-full bg-slate-100 p-1 text-sm font-medium shadow-inner shadow-white">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`cursor-pointer rounded-full px-3 py-1.5 transition-colors ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="flex gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${isActive(link.href) ? "text-blue-600" : ""} cursor-pointer`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {firebaseUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-700">
                  {(firebaseUser.displayName || firebaseUser.email || "?")
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "?"}
                </span>
                <span className="max-w-[140px] truncate text-left">
                  {firebaseUser.displayName || firebaseUser.email?.split("@")[0]}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 bg-white p-2 text-slate-700 shadow-2xl" role="menu">
                  <Link
                    href="/profile"
                    className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
