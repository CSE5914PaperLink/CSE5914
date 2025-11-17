"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import {
  signOutUser,
  onAuthStateChangedListener,
} from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";

interface TopTag {
  category: string;
  count: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { firebaseUser, dataConnectUserId, loading: userContextLoading } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [topTags, setTopTags] = useState<TopTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChangedListener((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (dataConnectUserId) {
      const fetchTags = async () => {
        try {
          setTagsLoading(true);
          const res = await fetch(`/api/user/top-tags?user_id=${encodeURIComponent(dataConnectUserId)}`);
          if (res.ok) {
            const data = await res.json();
            setTopTags(data.topCategories || []);
          }
        } catch (error) {
          console.error("Error fetching tags:", error);
        } finally {
          setTagsLoading(false);
        }
      };
      fetchTags();
    }
  }, [dataConnectUserId]);

  async function handleSignOut() {
    setLoading(true);
    await signOutUser();
    setLoading(false);
    router.push("/");
  }

  if (loading || userContextLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? "user avatar"}
                className="h-32 w-32 rounded-full mb-4 border-4 border-blue-700"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900">{user.displayName}</h1>
            <p className="text-lg text-gray-600 mt-2">{user.email}</p>
          </div>

          {/* Profile Info */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Display Name</span>
                <span className="text-gray-900 font-medium">{user.displayName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Email Verified</span>
                <span className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.emailVerified ? 'Yes' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* User Preferences - Top Tags */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Research Interests</h2>
            {tagsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700 mx-auto"></div>
                <p className="text-gray-600 text-sm mt-2">Loading interests...</p>
              </div>
            ) : topTags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {topTags.map((tag) => (
                  <div
                    key={tag.category}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium hover:bg-blue-200 transition-colors"
                  >
                    <span className="text-sm">{tag.category}</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-700 text-white rounded-full text-xs font-bold">
                      {tag.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No papers in your library yet. Add papers from Discovery to see your research interests.</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-medium transition-all duration-200"
            >
              Back to Home
            </Link>
            <button
              onClick={handleSignOut}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
