import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, system, temperature = 0.7 } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(`${BACKEND_URL}/gemini/chat`);
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
