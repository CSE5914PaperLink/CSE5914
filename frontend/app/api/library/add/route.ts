import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, addPaper, updatePaperIngestionStatus } from "@/src/dataconnect-generated";

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

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const arxivId = searchParams.get("arxiv_id");
    const userId = searchParams.get("user_id");
    
    if (!arxivId) {
      return NextResponse.json(
        { error: "arxiv_id is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required - please sign in" },
        { status: 401 }
      );
    }

    // Initialize Firebase and DataConnect for this API route
    const app = getFirebaseApp();
    const dc = getDataConnect(app, connectorConfig);

    // First, fetch paper metadata from arXiv API
    const arxivApiUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
    const arxivResp = await fetch(arxivApiUrl);
    const xmlText = await arxivResp.text();
    
    // Parse XML - skip first <title> (feed title) and get entry title
    // Find the <entry> section first
    const entryMatch = xmlText.match(/<entry>([\s\S]*?)<\/entry>/);
    if (!entryMatch) {
      return NextResponse.json(
        { error: "Paper not found in arXiv" },
        { status: 404 }
      );
    }
    
    const entryContent = entryMatch[1];
    
    const titleMatch = entryContent.match(/<title>([\s\S]*?)<\/title>/);
    const summaryMatch = entryContent.match(/<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = entryContent.match(/<published>([\s\S]*?)<\/published>/);
    const authorsMatch = entryContent.match(/<author>[\s\S]*?<name>([^<]+)<\/name>/g);
    
    const title = titleMatch ? titleMatch[1].trim().replace(/\n\s+/g, ' ') : `arXiv:${arxivId}`;
    const abstract = summaryMatch ? summaryMatch[1].trim().replace(/\n\s+/g, ' ') : null;
    const publishedDate = publishedMatch ? publishedMatch[1] : null;
    const year = publishedDate ? new Date(publishedDate).getFullYear() : null;
    const authors = authorsMatch 
      ? authorsMatch.map(a => a.match(/<name>([^<]+)<\/name>/)![1].trim())
      : [];

    // Add paper to DataConnect with pending status
    const { data: paperData } = await addPaper(dc, {
      userId,
      title,
      authors,
      year,
      abstract,
      arxivId,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
    });

    const paperId = paperData.paper_insert.id;

    // Trigger backend ingestion
    const backendUrl = `${BACKEND_URL}/library/add/${encodeURIComponent(arxivId)}`;
    const backendResp = await fetch(backendUrl, { method: "POST" });
    
    if (!backendResp.ok) {
      const data = await backendResp.json().catch(() => ({}));
      // Mark as failed in DataConnect
      await updatePaperIngestionStatus(dc, { 
        paperId, 
        status: "failed" 
      });
      return NextResponse.json(
        { error: data.detail || "Failed to ingest paper in backend" },
        { status: backendResp.status }
      );
    }

    // Mark as completed in DataConnect
    await updatePaperIngestionStatus(dc, { 
      paperId, 
      status: "completed" 
    });

    return NextResponse.json({ 
      success: true, 
      paperId,
      message: "Paper added and ingested successfully" 
    });
  } catch (err) {
    console.error("/api/library/add error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
