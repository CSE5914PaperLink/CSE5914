import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "@/src/dataconnect-generated";
import {
  createChatSession,
  listChatSessions,
} from "@/src/dataconnect-generated";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

// POST: Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    const result = await createChatSession(dc, {
      userId,
      title: title || "New Chat",
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[Create chat session error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create chat session",
      },
      { status: 500 }
    );
  }
}

// GET: List all chat sessions for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    const result = await listChatSessions(dc, { userId });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[List chat sessions error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list chat sessions",
      },
      { status: 500 }
    );
  }
}
