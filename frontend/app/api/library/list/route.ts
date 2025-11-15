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

    // Extract arxiv_ids to query ChromaDB
    const arxivIds = data.papers
      .map(p => p.arxivId)
      .filter((id): id is string => id !== null);

    // Get ChromaDB metadata for these papers
    const backendUrl = new URL(`${BACKEND_URL}/library/list`);
    const res = await fetch(backendUrl.toString(), { method: "GET" });
    const chromaData = await res.json();

    // Match ChromaDB results with DataConnect papers
    const chromaMap = new Map(
      (chromaData.results || []).map((item: any) => [
        item.metadata?.arxiv_id,
        item
      ])
    );

    // Merge DataConnect metadata with ChromaDB data
    const results = data.papers.map(paper => {
      const chromaItem = chromaMap.get(paper.arxivId);
      return {
        id: paper.arxivId || paper.id,
        dataconnect_id: paper.id,
        metadata: {
          title: paper.title,
          authors: paper.authors,
          arxiv_id: paper.arxivId,
          year: paper.year,
          abstract: paper.abstract,
          ingestion_status: paper.ingestionStatus,
          pdf_url: paper.pdfUrl,
        },
        // Include ChromaDB document chunks if available
        document: chromaItem?.document || null,
        // Indicate if paper is in ChromaDB
        in_chromadb: !!chromaItem,
      };
    });

    return NextResponse.json({ results });
  } catch (e) {
    console.error("library list error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
