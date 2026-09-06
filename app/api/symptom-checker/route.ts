import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing ANTHROPIC_API_KEY in environment variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      system: `You are CuraLink's advanced AI Symptom Checker. You are a highly professional, empathetic, and knowledgeable virtual health assistant.
Your goal is to help users understand their symptoms and provide general medical information, while strictly maintaining that you are an AI and NOT providing professional medical advice, diagnosis, or treatment.

Guidelines:
1. Always be empathetic and professional.
2. Ask clarifying questions if the symptoms are vague, but try to keep it brief (1-2 questions at most).
3. Provide a structured response:
   - Initial empathetic acknowledgment.
   - Possible causes (list a few common and less common ones, without diagnosing).
   - When to see a doctor (red flag symptoms).
   - Recommended next steps (e.g., resting, hydrating, or booking a consultation through CuraLink).
4. Always include a disclaimer at the bottom: "*Disclaimer: I am an AI, not a doctor. This information is for educational purposes only. Always consult a healthcare professional for medical advice.*"
5. Keep formatting clean using markdown (bullet points, bold text).

If a user describes a life-threatening emergency (e.g., severe chest pain, sudden numbness, difficulty breathing), immediately advise them to call emergency services (like 911) or go to the nearest emergency room.`,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Symptom checker error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during symptom analysis." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
