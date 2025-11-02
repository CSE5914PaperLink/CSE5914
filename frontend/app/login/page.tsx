"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  useEffect(() => {
    // Placeholder for FirebaseUI integration; keep loading text visible until integrated.
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.classList.remove("hidden");
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to CS Paper Compare
        </h2>

        <div id="firebaseui-auth-container" className="mb-4" />

        <div id="loading" className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Loading authentication...
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
