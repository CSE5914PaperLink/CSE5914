import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, system, temperature = 0.7, doc_ids } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Choose backend endpoint: use RAG endpoint when doc_ids provided
    const useRag = Array.isArray(doc_ids) && doc_ids.length > 0;
    const backendPath = useRag ? "/gemini/chat_rag" : "/gemini/chat";

    console.log("[Chat API] useRag:", useRag, "doc_ids:", doc_ids);

    // Build backend URL (non-body Query params for existing /gemini/chat)
    const backendUrl = new URL(`${BACKEND_URL}${backendPath}`);
    if (!useRag) {
      backendUrl.searchParams.append("prompt", prompt);
      if (system) {
        backendUrl.searchParams.append("system", system);
      }
      backendUrl.searchParams.append("temperature", temperature.toString());
    }

    const response = await fetch(backendUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: useRag
        ? JSON.stringify({ prompt, system, temperature, doc_ids })
        : undefined,
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
