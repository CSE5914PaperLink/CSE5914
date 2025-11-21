"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { signOutUser } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { firebaseUser, loading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-blue-600">
          PaperLink
        </Link>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {firebaseUser ? (
                <>
                  <Link
                    href="/discovery"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Discovery
                  </Link>
                  <Link
                    href="/library"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Library
                  </Link>
                  <Link
                    href="/chat"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Chat
                  </Link>
                  <Link
                    href="/compare"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Compare
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

