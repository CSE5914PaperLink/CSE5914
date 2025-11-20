"use client";

import Link from "next/link";
import LoginButton from "../../components/LoginButton";

export default function LoginPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl text-black font-bold text-center mb-6">
          Login to CS Paper Compare
        </h2>

        <div className="mb-4">
          <LoginButton />
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
