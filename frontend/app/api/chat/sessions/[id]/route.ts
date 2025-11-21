import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "@/src/dataconnect-generated";
import {
  getChatsForSession,
  updateChatSession,
  deleteChatSession,
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

// GET: Load a specific chat session with its messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    const result = await getChatsForSession(dc, { sessionId: id });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[Get chat session error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load chat session",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update a chat session (e.g., change title)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    const result = await updateChatSession(dc, {
      sessionId: id,
      title,
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[Update chat session error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update chat session",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    await deleteChatSession(dc, { sessionId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete chat session error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete chat session",
      },
      { status: 500 }
    );
  }
}
