"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedListener,
} from "../../lib/firebase";

export default function LoginPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChangedListener((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to CS Paper Compare
        </h2>

        {loading ? (
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Loading authentication...
          </div>
        ) : user ? (
          <div className="text-center">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt={user.displayName} className="mx-auto w-20 h-20 rounded-full mb-3" />
            ) : null}
            <p className="text-lg font-semibold">{user.displayName}</p>
            <p className="text-sm text-gray-600 mb-4">{user.email}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => signOutUser()} className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-50 transition-all duration-200">Sign out</button>
              <Link href="/" className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm hover:opacity-95">Continue</Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-gray-700">Sign in with your Google account to continue.</p>
            <button onClick={() => signInWithGoogle()} className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-blue-50 transition-all duration-200">Sign in with Google</button>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
