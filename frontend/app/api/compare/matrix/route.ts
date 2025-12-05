import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doc_ids, aspects } = body;

    if (!doc_ids || !Array.isArray(doc_ids) || doc_ids.length < 2) {
      return NextResponse.json(
        { error: "At least two doc_ids are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/compare/matrix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_ids, aspects }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.detail || "Matrix generation failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Matrix API error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
