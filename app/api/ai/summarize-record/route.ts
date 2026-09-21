import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { isGeminiConfigured, streamGeminiPrompt } from "@/lib/gemini";

export const maxDuration = 30;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const REPORT_SUMMARIZER_SYSTEM_PROMPT = `You are CuraLink's AI Medical Report Summarizer. You help patients understand their medical reports in plain, simple English.

Rules:
1. Provide a clear, structured summary with these sections:
   - **📋 Summary**: A 2-3 sentence plain-English overview of what the report says.
   - **✅ Normal Findings**: List any values or results that are within normal range.
   - **⚠️ Abnormal / Notable Findings**: List any values that are outside normal range or need attention. Explain what each means in simple terms.
   - **❓ Questions to Ask Your Doctor**: Suggest 2-3 specific questions the patient should discuss with their healthcare provider.
   - **📌 Recommended Next Steps**: Brief actionable guidance (follow-up tests, lifestyle changes, etc.).

2. Use simple, non-technical language. If you must use a medical term, explain it in parentheses.
3. Always include: "*This AI summary is for educational purposes only. Always discuss your results with your healthcare provider for accurate interpretation and medical advice.*"
4. If the input doesn't appear to be a medical report, politely say so and suggest what kind of content works best.
5. Use markdown formatting for readability.`;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;

    let rateLimit = rateLimitStore.get(ip);
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimit = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(ip, rateLimit);
    } else {
      rateLimit.count++;
      if (rateLimit.count > 15) {
        return new Response(
          JSON.stringify({
            error:
              "Record summarizer rate limit exceeded. Please try again later.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Please provide the medical report content to summarize.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (content.trim().length > 8000) {
      return new Response(
        JSON.stringify({
          error:
            "Report content is too long. Please limit to 8,000 characters.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Prioritize Google Gemini AI
    if (isGeminiConfigured()) {
      return await streamGeminiPrompt({
        systemInstruction: REPORT_SUMMARIZER_SYSTEM_PROMPT,
        prompt: `Please summarize this medical report in plain English:\n\n${content.trim()}`,
        temperature: 0.2,
      });
    }

    // 2. Fallback to Anthropic Claude if configured
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const result = streamText({
        model: anthropic("claude-3-5-haiku-20241022"),
        system: REPORT_SUMMARIZER_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Please summarize this medical report in plain English:\n\n${content.trim()}`,
          },
        ],
      });

      return result.toTextStreamResponse();
    }

    // 3. Neither key is configured
    return new Response(
      JSON.stringify({
        error:
          "AI summarizer is not configured. Please set GEMINI_API_KEY in your .env file.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Record summarizer error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred with the AI summarizer.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
