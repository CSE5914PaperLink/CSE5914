"use client";

import { signInWithGoogle } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginButton() {
  const { firebaseUser, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (firebaseUser && !loading) {
      router.push("/");
    }
  }, [firebaseUser, loading, router]);

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result === "success") {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white opacity-50"
      >
        Loading...
      </button>
    );
  }

  if (firebaseUser) {
    return (
      <div className="w-full rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
        Signed in as {firebaseUser.email}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Sign in with Google
    </button>
  );
}

