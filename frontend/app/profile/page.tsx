"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOutUser } from "@/lib/firebase";

export default function ProfilePage() {
  const { firebaseUser, dataConnectUserId, loading } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [topTags, setTopTags] = useState<{ name: string; count: number }[]>([]);
  const [tagLoading, setTagLoading] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
    if (firebaseUser?.displayName) {
      setDisplayName(firebaseUser.displayName);
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    if (!dataConnectUserId) return;
    const fetchAndComputeTags = async () => {
      try {
        setTagLoading(true);
        const res = await fetch(
          `/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const items = data.results || [];

        // Compute tag frequency based on title keywords (simple split by space)
        const tagCounts: Record<string, number> = {};
        items.forEach((item: any) => {
          const titleWords = (item?.metadata?.title || "")
            .toLowerCase()
            .split(/[\s:,-]+/);
          titleWords.forEach((word: string) => {
            if (word.length > 3) {
              // ignore stop-words / short words
              tagCounts[word] = (tagCounts[word] || 0) + 1;
            }
          });
        });
        // Convert to array, sort, and take top 3
        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        setTopTags(sortedTags);
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        setTagLoading(false);
      }
    };
    fetchAndComputeTags();
  }, [dataConnectUserId]);

  const handleSaveName = async () => {
    if (!firebaseUser) return;

    setIsSaving(true);
    try {
      // Update display name in Firebase
      await firebaseUser.reload();
      // Note: You might need to use Firebase Admin SDK or custom endpoint to update display name
      // For now, we'll just show a success message
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="bg-gray-50 font-sans text-gray-800 min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-1">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {(firebaseUser.displayName ||
                    firebaseUser.email ||
                    "U")[0].toUpperCase()}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {firebaseUser.displayName || "User"}
                  </h2>
                  <p className="text-gray-600">{firebaseUser.email}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Joined{" "}
                    {firebaseUser.metadata?.creationTime
                      ? new Date(
                          firebaseUser.metadata.creationTime
                        ).toLocaleDateString()
                      : "recently"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Top Tags Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Your Top Topics
            </h3>
            {tagLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : topTags.length === 0 ? (
              <p className="text-gray-500 italic">
                No data yet. Add some papers to your library!
              </p>
            ) : (
              <ul className="space-y-2">
                {topTags.map((tag) => (
                  <li key={tag.name} className="text-gray-700">
                    <span className="font-semibold">{tag.name}</span> ·{" "}
                    {tag.count} paper(s)
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Edit Mode */}
          {isEditing && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Edit Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-blue-600 mb-2">📚</div>
            <h3 className="font-semibold text-gray-900 mb-1">Saved Papers</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-purple-600 mb-2">💬</div>
            <h3 className="font-semibold text-gray-900 mb-1">Chat Sessions</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-green-600 mb-2">⭐</div>
            <h3 className="font-semibold text-gray-900 mb-1">Favorites</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Account Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900">Email</h4>
                <p className="text-gray-600 text-sm">{firebaseUser.email}</p>
              </div>
              <span className="text-green-600 text-sm font-medium">
                ✓ Verified
              </span>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="text-right">
          <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 underline">
            Delete Account
          </button>
        </div>
      </main>

      {/* Quick Links */}
      <div className="bg-gray-100 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/chat"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              → Chat
            </Link>
            <Link
              href="/library"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              → Library
            </Link>
            <Link
              href="/discovery"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              → Discovery
            </Link>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              → Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 bg-blue-700 text-white mt-auto">
        <p className="text-sm">
          &copy; 2025 <span className="font-semibold">CS Paper Compare</span> |
          Built with Next.js, FastAPI, and AWS
        </p>
      </footer>
    </div>
  );
}
