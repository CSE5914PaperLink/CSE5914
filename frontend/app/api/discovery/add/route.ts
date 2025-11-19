import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("doc_id");
    if (!docId) {
      return NextResponse.json(
        { error: "doc_id is required" },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_URL}/library/add/${encodeURIComponent(
      docId
    )}`;

    const resp = await fetch(backendUrl, { method: "POST" });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to add paper" },
        { status: resp.status }
      );
    }

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("/api/discovery/add error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
