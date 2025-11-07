import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const backendUrl = `${BACKEND_URL}/library/delete/${encodeURIComponent(
      id
    )}`;

    const resp = await fetch(backendUrl, { method: "DELETE" });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to delete paper" },
        { status: resp.status }
      );
    }

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("/api/library/delete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
