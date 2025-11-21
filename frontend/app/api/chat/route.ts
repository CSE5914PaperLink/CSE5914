import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, addChat } from "@/src/dataconnect-generated";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, system, temperature = 0, doc_ids, thread_id, session_id } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use agent endpoint when doc_ids provided (RAG mode), otherwise simple chat
    const useAgent = Array.isArray(doc_ids) && doc_ids.length > 0;
    const backendPath = useAgent ? "/gemini/chat_agent" : "/gemini/chat";

    // Chat API called; useAgent determines agent vs simple chat

    // Build backend URL
    const backendUrl = new URL(`${BACKEND_URL}${backendPath}`);

    if (!useAgent) {
      // Simple chat uses query params
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
      
      // Save to database if session_id provided
      if (session_id) {
        try {
          const app = getFirebaseApp();
          const dc = getDataConnect(app, connectorConfig);
          await addChat(dc, {
            sessionId: session_id,
            content: prompt,
            response: data.content || null,
          });
          console.log("[Chat saved to DB]");
        } catch (dbError) {
          console.error("[Failed to save chat to database]:", dbError);
          // Don't fail the request if DB save fails
        }
      }
      
      return NextResponse.json(data);
    } else {
      // Agent endpoint with streaming
      const response = await fetch(backendUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          doc_ids,
          thread_id: thread_id || `session-${Date.now()}`,
          temperature,
          top_k: 6,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        return NextResponse.json(
          { error: errorData.detail || "Failed to get response from agent" },
          { status: response.status }
        );
      }

      // Stream the response from the agent to the frontend
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({ type: "error", value: "No response body" }) +
                  "\n"
              )
            );
            controller.close();
            return;
          }

          let buffer = ""; // Buffer for incomplete lines
          let fullResponse = ""; // Accumulate full response for DB save

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Append new chunk to buffer
              buffer += decoder.decode(value, { stream: true });

              // Split by newlines but keep incomplete last line in buffer
              const lines = buffer.split("\n");
              buffer = lines.pop() || ""; // Keep last incomplete line

              for (const line of lines) {
                if (!line.trim()) continue;

                try {
                  const event = JSON.parse(line);

                  // Forward all events (status, token, sources, error) to frontend
                  if (event.type === "status") {
                    controller.enqueue(
                      new TextEncoder().encode(JSON.stringify(event) + "\n")
                    );
                  } else if (event.type === "token") {
                    fullResponse += event.value; // Accumulate response
                    controller.enqueue(
                      new TextEncoder().encode(JSON.stringify(event) + "\n")
                    );
                  } else if (event.type === "sources") {
                    // Forward sources to frontend
                    controller.enqueue(
                      new TextEncoder().encode(JSON.stringify(event) + "\n")
                    );
                  } else if (event.type === "error") {
                    controller.enqueue(
                      new TextEncoder().encode(JSON.stringify(event) + "\n")
                    );
                    throw new Error(event.value);
                  }
                } catch {
                  // Ignore malformed JSON chunks; continue streaming
                }
              }
            }

            // Process any remaining data in buffer
            if (buffer.trim()) {
              try {
                const event = JSON.parse(buffer);
                controller.enqueue(
                  new TextEncoder().encode(JSON.stringify(event) + "\n")
                );
              } catch {
                // ignore final partial buffer parse errors
              }
            }
          } catch (error) {
            // Log stream-level errors
            console.error("[Stream Error]:", error);
          } finally {
            // Save to database after stream completes
            if (session_id && fullResponse) {
              try {
                const app = getFirebaseApp();
                const dc = getDataConnect(app, connectorConfig);
                await addChat(dc, {
                  sessionId: session_id,
                  content: prompt,
                  response: fullResponse,
                });
                console.log("[Chat saved to DB (streamed)]");
              } catch (dbError) {
                console.error("[Failed to save streamed chat to database]:", dbError);
              }
            }
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
