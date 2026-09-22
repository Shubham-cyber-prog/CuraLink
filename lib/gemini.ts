import { GoogleGenerativeAI, Content } from "@google/generative-ai";

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Formats a generic list of messages (e.g. from UI components)
 * into the format expected by the Google Gemini Generative AI SDK.
 *
 * Requirements:
 * - Gemini expects role to be 'user' or 'model' (not 'assistant').
 * - The conversation history must start with a 'user' turn.
 * - Consecutive messages of the same role are combined.
 */
export function formatMessagesForGemini(
  messages: Array<{ role: string; content: string }>
): Content[] {
  const contents: Content[] = [];

  for (const m of messages) {
    if (!m.content || !m.content.trim()) continue;

    const role: "user" | "model" = m.role === "assistant" ? "model" : "user";

    // Drop leading model/assistant messages (e.g. initial greeting from bot)
    if (contents.length === 0 && role === "model") {
      continue;
    }

    // Merge consecutive messages with the same role
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      const prevText = contents[contents.length - 1].parts[0]?.text || "";
      contents[contents.length - 1].parts = [
        { text: `${prevText}\n\n${m.content.trim()}` },
      ];
    } else {
      contents.push({
        role,
        parts: [{ text: m.content.trim() }],
      });
    }
  }

  return contents;
}

/**
 * Streams a Gemini chat response as a standard web Response with a ReadableStream.
 * Works seamlessly with browser fetch / getReader() and res.text().
 */
export async function streamGeminiChat({
  systemInstruction,
  messages,
  temperature = 0.4,
}: {
  systemInstruction: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
}): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[Gemini] GEMINI_API_KEY is not set or empty.");
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY is not set. Please add your Gemini API key to .env",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const configuredModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const modelChain = Array.from(new Set([configuredModel, "gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"]));
  console.log(`[Gemini] Model chain: ${modelChain.join(", ")} | API key present: true`);

  const formattedContents = formatMessagesForGemini(messages);

  if (formattedContents.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid user messages found in request." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let result: any = null;
  let lastErr: any = null;
  let usedModel = configuredModel;

  for (const candidate of modelChain) {
    try {
      usedModel = candidate;
      const model = genAI.getGenerativeModel({
        model: candidate,
        systemInstruction,
        generationConfig: {
          temperature,
        },
      });

      result = await model.generateContentStream({
        contents: formattedContents,
      });
      break; // Successfully started stream
    } catch (mErr: any) {
      lastErr = mErr;
      console.warn(`[Gemini] Candidate model ${candidate} failed (${mErr?.status || mErr?.message}). Trying next...`);
    }
  }

  if (!result) {
    throw lastErr || new Error("All Gemini models in chain failed.");
  }

  try {
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err: any) {
          console.error("[Gemini] Stream chunk error:", err?.message || err);
          // Send the error as text so the frontend can display it
          try {
            controller.enqueue(
              encoder.encode(
                `\n\n⚠️ AI stream interrupted: ${err?.message || "Unknown streaming error"}. Please try again.`
              )
            );
          } catch {
            // controller may already be errored
          }
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: any) {
    // Catch errors from model instantiation or the initial generateContentStream call
    const status = err?.status || 500;
    const errorMessage = err?.message || "Unknown Gemini API error";
    console.error(
      `[Gemini] API call failed (HTTP ${status}):`,
      errorMessage
    );

    // Provide actionable error messages based on status codes
    let userFacingError = errorMessage;
    if (status === 404) {
      userFacingError = `Model "${usedModel}" is not available. It may have been deprecated. Please update GEMINI_MODEL in your .env file. Details: ${errorMessage}`;
    } else if (status === 403) {
      userFacingError = `API key is not authorized for this model. Please check your GEMINI_API_KEY. Details: ${errorMessage}`;
    } else if (status === 429) {
      userFacingError = `Gemini API rate limit exceeded. Please wait a moment and try again. Details: ${errorMessage}`;
    } else if (status === 503) {
      userFacingError = `Gemini API is temporarily unavailable (high demand). Please try again shortly. Details: ${errorMessage}`;
    }

    return new Response(
      JSON.stringify({ error: userFacingError }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Streams a single-turn prompt using Gemini (e.g. for doctor recommendation or record summarization).
 */
export async function streamGeminiPrompt({
  systemInstruction,
  prompt,
  temperature = 0.4,
}: {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
}): Promise<Response> {
  return streamGeminiChat({
    systemInstruction,
    messages: [{ role: "user", content: prompt }],
    temperature,
  });
}
