"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedListener,
} from "../lib/firebase.client"; // ✅ client-only

export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChangedListener((u) => {
      setUser(u);
      // Redirect to profile after login
      if (u) {
        router.push("/profile");
      }
    });
    return () => unsub();
  }, [router]);

  async function handleSignIn() {
    setLoading(true);
    const result = await signInWithGoogle();
    // keep loading state short — signInWithGoogle logs errors
    setLoading(false);
    return result;
  }

  async function handleSignOut() {
    setLoading(true);
    await signOutUser();
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {user ? (
        <div className="flex flex-col items-center">
          {user.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.displayName ?? "user avatar"}
              className="h-16 w-16 rounded-full mb-2"
            />
          )}
          <div className="text-center">
            <div className="font-medium">{user.displayName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>

          <button
            onClick={handleSignOut}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            disabled={loading}
          >
            {loading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={handleSignIn}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-200 disabled:opacity-60"
            disabled={loading}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 533.5 544.3"
              aria-hidden="true"
            >
              <path
                fill="#4285f4"
                d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95.1h146.9c-6.3 34-25 62.8-53.3 82v68.1h86.5c50.7-46.7 81.4-115.5 81.4-195z"
              />
              <path
                fill="#34a853"
                d="M272 544.3c72.4 0 133.2-24 177.6-65.2l-86.5-68.1c-24 16.1-54.5 25.6-91.1 25.6-69.9 0-129.1-47.2-150.2-110.7H31.9v69.4C75.8 486.8 167.7 544.3 272 544.3z"
              />
              <path
                fill="#fbbc04"
                d="M121.8 325.9c-10.2-30-10.2-62.3 0-92.3v-69.4H31.9c-40.5 80.9-40.5 175.8 0 256.7z"
              />
              <path
                fill="#ea4335"
                d="M272 107.7c37.7-.6 73.9 13.7 101.9 40.2l76.2-76.2C405.1 24.3 344.4-.6 272 0 167.7 0 75.8 57.5 31.9 150.8l89.9 69.4C142.9 154.9 202.1 107.7 272 107.7z"
              />
            </svg>
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

          <div className="mt-2 text-xs text-gray-500">No account? Use your Google account to sign in.</div>
        </div>
      )}
    </div>
  );
}
