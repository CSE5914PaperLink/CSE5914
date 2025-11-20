import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, system, temperature = 0.7, doc_ids, thread_id } = body;

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
          top_k: 8,
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
