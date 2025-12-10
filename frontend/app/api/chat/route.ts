import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, addChat } from "@/src/dataconnect-generated";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      system,
      temperature = 0.2,
      doc_ids,
      doc_titles,
      session_id,
      github_only = false,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use RAG chat endpoint when doc_ids provided, otherwise simple chat
    const useRagChat = Array.isArray(doc_ids) && doc_ids.length > 0;
    const backendPath = useRagChat ? "/gemini/rag_chat" : "/gemini/chat";

    // Build backend URL
    const backendUrl = new URL(`${BACKEND_URL}${backendPath}`);

    if (!useRagChat) {
      // Simple chat uses query params
      backendUrl.searchParams.append("prompt", prompt);
      if (system) {
        backendUrl.searchParams.append("system", system);
      }
      backendUrl.searchParams.append("temperature", temperature.toString());

      const response = await fetch(backendUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        return NextResponse.json(
          { error: errorData.detail || "Failed to get response from Gemini" },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Save to database if session_id provided
      if (session_id) {
        try {
          const app = getFirebaseApp();
          const dc = getDataConnect(app, connectorConfig);
          await addChat(dc, {
            sessionId: session_id,
            content: prompt,
            response: data.content || null,
          });
          console.log("[Chat saved to DB]");
        } catch (dbError) {
          console.error("[Failed to save chat to database]:", dbError);
          // Don't fail the request if DB save fails
        }
      }

      return NextResponse.json(data);
    } else {
      // RAG chat endpoint - structured JSON response
      const response = await fetch(backendUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          doc_ids,
          doc_titles,
          temperature,
          github_only,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        return NextResponse.json(
          { error: errorData.detail || "Failed to get response from RAG chat" },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Save to database if session_id provided
      if (session_id) {
        try {
          // Combine chunks into full response text for DB storage
          const fullResponse =
            data.chunks
              ?.map((chunk: { text: string }) => chunk.text)
              .join(" ") || "";

          const app = getFirebaseApp();
          const dc = getDataConnect(app, connectorConfig);
          await addChat(dc, {
            sessionId: session_id,
            content: prompt,
            response: fullResponse,
          });
          console.log("[RAG Chat saved to DB]");
        } catch (dbError) {
          console.error("[Failed to save RAG chat to database]:", dbError);
        }
      }

      // Return the structured response with chunks and sources
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
