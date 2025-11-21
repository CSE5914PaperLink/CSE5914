"use client";

import { useMemo, useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/firebase";

export default function ProfilePage() {
  const { firebaseUser, dataConnectUserId, loading } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [topTags, setTopTags] = useState<{ name: string; count: number }[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [savedPapersCount, setSavedPapersCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

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
          `/api/library/list?user_id=${encodeURIComponent(dataConnectUserId)}&t=${Date.now()}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const items = data.results || [];

        // Update saved papers count
        setSavedPapersCount(items.length);

        // Count favorites
        const favorites = items.filter((item: any) => item?.metadata?.is_favorite === true);
        setFavoritesCount(favorites.length);

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
  }, [dataConnectUserId, refreshKey]);

  // Listen for storage events to refresh when favorites change from library page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'library_updated') {
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event on same page
    const handleCustomEvent = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('libraryUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('libraryUpdated', handleCustomEvent);
    };
  }, []);

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

  const initials = useMemo(() => {
    const source = firebaseUser?.displayName || firebaseUser?.email || "?";
    return source
      .split(" ")
      .map((part) => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("")
      .padEnd(2, "");
  }, [firebaseUser]);

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
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-xl shadow-blue-100/60">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-lg">
              {initials}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                Profile
              </p>
              <h1 className="mt-3 text-4xl font-semibold">
                {firebaseUser.displayName || "Researcher"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">{firebaseUser.email}</p>
              <p className="text-xs text-slate-400">
                Joined {" "}
                {firebaseUser.metadata?.creationTime
                  ? new Date(
                      firebaseUser.metadata.creationTime
                    ).toLocaleDateString()
                  : "recently"}
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <button
                  onClick={() => setIsEditing(!isEditing)}
                className="cursor-pointer rounded-2xl border border-slate-200 px-6 py-2 text-slate-800 transition hover:border-blue-200"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
              <button
                onClick={handleSignOut}
                className="cursor-pointer rounded-2xl bg-red-50 px-6 py-2 text-red-600 transition hover:bg-red-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
              Saved
            </p>
            <p className="mt-2 text-3xl font-bold">{savedPapersCount}</p>
            <p className="text-xs text-slate-500">papers in library</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-500">
              Chat
            </p>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="text-xs text-slate-500">sessions logged</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
              Favorites
            </p>
            <p className="mt-2 text-3xl font-bold">{favoritesCount}</p>
            <p className="text-xs text-slate-500">starred references</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                Library Insights
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Top Topics</h2>
            </div>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="text-sm font-semibold text-blue-600"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4">
            {tagLoading ? (
              <p className="text-sm text-slate-500">Analyzing titles...</p>
            ) : topTags.length === 0 ? (
              <p className="text-sm text-slate-400">
                No data yet. Add papers to see trends.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <span
                    key={tag.name}
                    className="rounded-full border border-slate-200 px-4 py-1 text-sm font-medium text-slate-700"
                  >
                    {tag.name} · {tag.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {isEditing && (
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <h3 className="text-xl font-semibold">Edit Profile</h3>
            <p className="text-sm text-slate-500">Update your display name.</p>
            <div className="mt-4 space-y-4">
              <label className="text-sm font-semibold text-slate-600">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Your name"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="cursor-pointer rounded-2xl bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="cursor-pointer rounded-2xl border border-slate-200 px-5 py-2 font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
          <h3 className="text-xl font-semibold">Account Settings</h3>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Email</p>
              <p className="text-xs text-slate-500">{firebaseUser.email}</p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              ✓ Verified
            </span>
          </div>
        </section>

        <div className="text-right">
          <button className="cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700">
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}
