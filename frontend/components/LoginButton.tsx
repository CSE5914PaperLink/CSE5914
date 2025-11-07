"use client";

import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedListener,
} from "../lib/firebase";

export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChangedListener((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

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
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={handleSignIn}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

          <div className="mt-2 text-xs text-gray-500">No account? Use your Google account to sign in.</div>
        </div>
      )}
    </div>
  );
}
