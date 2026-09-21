import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { isGeminiConfigured, streamGeminiPrompt } from "@/lib/gemini";

export const maxDuration = 30;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const DOCTOR_RECOMMENDER_SYSTEM_PROMPT = `You are CuraLink's AI Doctor Recommender. Given a patient's description of their health concern, you recommend the most suitable medical specialties and what type of doctor they should look for.

Rules:
1. Recommend 1-3 specialties ranked by relevance.
2. For each specialty, explain in 1-2 sentences WHY it's appropriate.
3. Include any urgency guidance (e.g., "See a doctor within 24 hours" or "Routine — schedule at convenience").
4. If the concern sounds urgent or life-threatening, flag it clearly and recommend emergency services.
5. Use markdown formatting: **bold** for specialty names, bullets for structure.
6. End with a brief note: "Use the filters above to search for these specialties, or book directly from our verified doctors list."
7. Keep total response under 150 words.
8. Never diagnose. Always clarify this is AI guidance, not medical advice.

Available specialties on CuraLink: General Medicine, Cardiology, Dermatology, Orthopedics, Pediatrics, Gynecology, Neurology, Psychiatry, ENT, Ophthalmology, Gastroenterology, Pulmonology, Endocrinology, Urology, Oncology.`;

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
      if (rateLimit.count > 25) {
        return new Response(
          JSON.stringify({
            error:
              "Doctor recommender rate limit exceeded. Please try again later.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Please describe what kind of doctor you're looking for.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Prioritize Google Gemini AI
    if (isGeminiConfigured()) {
      return await streamGeminiPrompt({
        systemInstruction: DOCTOR_RECOMMENDER_SYSTEM_PROMPT,
        prompt: query.trim(),
        temperature: 0.3,
      });
    }

    // 2. Fallback to Anthropic Claude if configured
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const result = streamText({
        model: anthropic("claude-3-5-haiku-20241022"),
        system: DOCTOR_RECOMMENDER_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: query.trim(),
          },
        ],
      });

      return result.toTextStreamResponse();
    }

    // 3. Neither key is configured
    return new Response(
      JSON.stringify({
        error:
          "AI recommender is not configured. Please set GEMINI_API_KEY in your .env file.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Doctor recommender error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred with the AI recommender.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
