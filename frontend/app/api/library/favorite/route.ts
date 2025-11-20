import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect, executeMutation } from "firebase/data-connect";
import { connectorConfig } from "@/src/dataconnect-generated";

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

export async function POST(request: NextRequest) {
  try {
    const { paperId, isFavorite } = await request.json();

    if (!paperId || typeof isFavorite !== "boolean") {
      return NextResponse.json(
        { error: "paperId and isFavorite are required" },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    // Use the generated togglePaperFavorite mutation
    const { togglePaperFavorite } = await import("@/src/dataconnect-generated");
    
    await togglePaperFavorite(dc, { paperId, isFavorite });

    return NextResponse.json({ success: true, isFavorite });
  } catch (e) {
    console.error("Favorite toggle error", e);
    return NextResponse.json(
      { error: "Internal error: " + (e as Error).message },
      { status: 500 }
    );
  }
}
