import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { isGeminiConfigured, streamGeminiChat } from "@/lib/gemini";

export const maxDuration = 30;

// Simple in-memory rate limiter (use Redis in production with multiple instances)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const AI_CHAT_SYSTEM_PROMPT = `You are CuraLink AI — a friendly, professional health assistant embedded inside CuraLink, an AI-powered telehealth platform built for India.

Your role:
1. Answer quick health questions concisely (2-3 sentences max unless the user asks for detail).
2. Help users navigate the CuraLink app:
   - "Find Doctors" → /find-doctor
   - "Book Appointment" → /find-doctor
   - "AI Symptom Checker" → /symptom-checker (for detailed symptom triage)
   - "Medical Records" → /records
   - "Appointments" → /appointments
   - "Profile/Settings" → /profile
3. Provide wellness tips, medication reminders guidance, and general health literacy.
4. If asked about emergencies, immediately tell them to call 112 (India) or go to the nearest ER.
5. Always clarify you are an AI, not a doctor. Never diagnose.
6. Keep responses warm, brief, and use markdown formatting (bold, bullets) for readability.
7. If someone needs detailed symptom analysis, recommend they use the dedicated AI Symptom Checker at /symptom-checker.

Tone: Friendly, professional, empathetic. Like a knowledgeable health concierge.`;

export async function POST(req: Request) {
  try {
    // Rate Limiting: 30 requests per hour per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;

    let rateLimit = rateLimitStore.get(ip);
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimit = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(ip, rateLimit);
    } else {
      rateLimit.count++;
      if (rateLimit.count > 30) {
        return new Response(
          JSON.stringify({
            error: "AI assistant rate limit exceeded. Please try again later.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide chat messages." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Prioritize Google Gemini AI
    if (isGeminiConfigured()) {
      return await streamGeminiChat({
        systemInstruction: AI_CHAT_SYSTEM_PROMPT,
        messages,
        temperature: 0.5,
      });
    }

    // 2. Fallback to Anthropic Claude if configured
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const result = streamText({
        model: anthropic("claude-3-5-haiku-20241022"),
        system: AI_CHAT_SYSTEM_PROMPT,
        messages,
      });

      return result.toTextStreamResponse();
    }

    // 3. Neither key is configured
    return new Response(
      JSON.stringify({
        error:
          "AI assistant is not configured. Please set GEMINI_API_KEY in your .env file.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred with the AI assistant.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
