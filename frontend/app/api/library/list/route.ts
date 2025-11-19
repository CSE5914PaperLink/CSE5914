import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, listPapers } from "@/src/dataconnect-generated";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 401 }
      );
    }

    // Initialize Firebase and DataConnect for this API route
    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    // Get user's papers from DataConnect
    const { data } = await listPapers(dc, { userId });

    if (data.papers.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const arxivIds = data.papers
      .map((p) => p.arxivId)
      .filter((id): id is string => id !== null);

    let chromaResults: Record<string, boolean> = {};
    if (arxivIds.length > 0) {
      try {
        const backendUrl = `${BACKEND_URL}/library/check_batch`;
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(arxivIds),
          signal: AbortSignal.timeout(60000), // 60 second timeout for many papers
        });
        if (res.ok) {
          const data = await res.json();
          chromaResults = data.results || {};
        }
      } catch (fetchErr) {
        console.error("Failed to check ChromaDB status:", fetchErr);
      }
    }

    // Merge DataConnect metadata with ChromaDB status
    const results = data.papers.map((paper) => {
      const inChroma = chromaResults[paper.arxivId || ""] || false;
      const docId = paper.arxivId ? `${paper.arxivId}` : paper.id;
      return {
        id: docId,
        dataconnect_id: paper.id,
        metadata: {
          doc_id: docId,
          title: paper.title,
          authors: paper.authors,
          year: paper.year,
          abstract: paper.abstract,
          ingestion_status: paper.ingestionStatus,
          pdf_url: paper.pdfUrl,
        },
        in_chromadb: inChroma,
      };
    });

    return NextResponse.json({ results });
  } catch (e) {
    console.error("library list error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
