import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, listPapers } from "@/src/dataconnect-generated";

// Initialize Firebase for API routes
function getFirebaseApp() {
  if (getApps().length === 0) {
    return initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }
  return getApps()[0];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 401 }
      );
    }

    // Initialize Firebase and DataConnect for this API route
    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    // Get user's papers from DataConnect
    const { data } = await listPapers(dc, { userId });
    
    // Count categories
    const categoryCount = new Map<string, number>();
    
    data.papers.forEach((paper: any) => {
      if (paper.category) {
        const count = categoryCount.get(paper.category) || 0;
        categoryCount.set(paper.category, count + 1);
      }
    });

    // Sort by count and get top 3
    const topCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({
        category,
        count,
      }));

    return NextResponse.json({ topCategories });
  } catch (e) {
    console.error("top tags error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
