import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, updatePaperIngestionStatus } from "@/src/dataconnect-generated";

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
    const { paperId, arxivId } = await request.json();
    
    if (!paperId || !arxivId) {
      return NextResponse.json(
        { error: "paperId and arxivId are required" },
        { status: 400 }
      );
    }

    // Check backend status
    const backendUrl = `${BACKEND_URL}/library/status/${encodeURIComponent(arxivId)}`;
    const backendResp = await fetch(backendUrl);
    
    if (!backendResp.ok) {
      return NextResponse.json(
        { error: "Failed to check backend status" },
        { status: 502 }
      );
    }

    const statusData = await backendResp.json();
    
    // If completed in ChromaDB, update DataConnect
    if (statusData.in_chromadb && statusData.status === "completed") {
      const app = getFirebaseApp();
      const dc = getDataConnect(app, connectorConfig);
      
      await updatePaperIngestionStatus(dc, { 
        paperId, 
        status: "completed" 
      });
      
      return NextResponse.json({ 
        updated: true,
        status: "completed",
        in_chromadb: true
      });
    }

    return NextResponse.json({ 
      updated: false,
      status: statusData.status,
      in_chromadb: statusData.in_chromadb
    });
  } catch (err) {
    console.error("/api/library/check-status error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
