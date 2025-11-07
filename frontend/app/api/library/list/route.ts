import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const url = new URL(`${BACKEND_URL}/library/list`);
    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("library list error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
