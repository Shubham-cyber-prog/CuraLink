import { isGeminiConfigured, streamGeminiChat } from "@/lib/gemini";
import {
  detectEmergency,
  DISCLAIMER,
  type SymptomAnalysis,
} from "@/lib/emergency-detector.service";

export const maxDuration = 30;

// Simple in-memory rate limiter for the symptom checker
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const SYMPTOM_CHECKER_SYSTEM_PROMPT = `You are CuraLink's advanced AI Symptom Checker. You are a highly professional, empathetic, and knowledgeable virtual health assistant.
Your goal is to help users understand their symptoms and provide general medical information, while strictly maintaining that you are an AI and NOT providing professional medical advice, diagnosis, or treatment.

You MUST return a valid JSON object (no markdown, no backticks, no extra text) matching this EXACT structure:
{
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH",
  "triageCategory": "GREEN" | "YELLOW" | "RED",
  "summary": "Brief empathetic summary of the assessment",
  "possibleCauses": ["Cause 1", "Cause 2", "Cause 3"],
  "recommendedAction": "What the patient should do next",
  "suggestBooking": true or false (true if they should see a doctor)
}

Classification rules:
- LOW (GREEN): Mild symptoms, self-care appropriate. suggestBooking = false.
- MEDIUM (YELLOW): Moderate symptoms needing monitoring. suggestBooking = true.
- HIGH (RED): Serious symptoms needing prompt medical attention. suggestBooking = true.

Guidelines:
1. Always be empathetic and professional in your summary.
2. List 2-4 possible causes (common and less common) — never diagnose.
3. For MEDIUM/HIGH, recommend booking a CuraLink consultation.
4. For LOW, recommend self-care with monitoring.
5. Return ONLY the JSON object, nothing else.`;

/**
 * Extracts the latest user message text from the messages array.
 */
function getLatestUserMessage(
  messages: Array<{ role: string; content: string }>
): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && messages[i].content?.trim()) {
      return messages[i].content.trim();
    }
  }
  return "";
}

/**
 * Try to parse a JSON response from Gemini text, with fallback extraction.
 */
function parseGeminiJson(text: string): Partial<SymptomAnalysis> | null {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Gemini sometimes wraps in markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        // fall through
      }
    }
    // Try to find JSON object in the text
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch {
        // fall through
      }
    }
    return null;
  }
}

/**
 * Calls the local Python ML microservice urgency classifier as a secondary signal.
 */
async function fetchMLUrgency(symptomText: string) {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${mlUrl}/predict/urgency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptomText }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        urgencyLevel: data.urgencyLevel,
        confidence: data.confidence,
        confidencePercentage: data.confidencePercentage,
        modelType: data.modelType,
      };
    }
  } catch {
    // Non-blocking: fail silently if microservice is offline
  }
  return null;
}

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Rate Limiting Logic (20 requests per hour per IP)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    let rateLimit = rateLimitStore.get(ip);
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimit = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(ip, rateLimit);
    } else {
      rateLimit.count++;
      if (rateLimit.count > 20) {
        return new Response(
          JSON.stringify({
            error:
              "AI symptom checker rate limit exceeded, please try again later.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide symptom messages." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const latestMessage = getLatestUserMessage(messages);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: EMERGENCY DETECTION — runs SYNCHRONOUSLY before any API call
    // This is the core safety mechanism. No network latency.
    // ═══════════════════════════════════════════════════════════════════
    const emergencyResult = detectEmergency(latestMessage);
    if (emergencyResult) {
      const elapsed = Date.now() - startTime;
      console.log(
        `[Symptom Checker] 🚨 EMERGENCY short-circuit in ${elapsed}ms (no Gemini call made)`
      );
      return new Response(
        JSON.stringify({
          ...emergencyResult,
          responseTimeMs: elapsed,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: AI-powered analysis via Gemini (only for non-emergency)
    // ═══════════════════════════════════════════════════════════════════
    const geminiReady = isGeminiConfigured();
    console.log(
      `[Symptom Checker] Gemini configured: ${geminiReady} | Model: ${process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash"}`
    );

    if (geminiReady) {
      try {
        // Use non-streaming generateContent for structured JSON response
        const { GoogleGenerativeAI } = await import(
          "@google/generative-ai"
        );
        const apiKey = process.env.GEMINI_API_KEY!.trim();
        const modelName =
          process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYMPTOM_CHECKER_SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.3,
          },
        });

        const result = await model.generateContent(latestMessage);
        const responseText = result.response.text();
        const parsed = parseGeminiJson(responseText);

        if (parsed && parsed.urgencyLevel) {
          const elapsed = Date.now() - startTime;
          console.log(
            `[Symptom Checker] Gemini response in ${elapsed}ms | urgency: ${parsed.urgencyLevel}`
          );

          const mlPrediction = await fetchMLUrgency(latestMessage);

          const analysis: SymptomAnalysis = {
            urgencyLevel: (parsed.urgencyLevel as SymptomAnalysis["urgencyLevel"]) || "LOW",
            triageCategory: (parsed.triageCategory as SymptomAnalysis["triageCategory"]) || "GREEN",
            summary: parsed.summary || "Assessment complete.",
            possibleCauses: parsed.possibleCauses || [],
            recommendedAction:
              parsed.recommendedAction || "Monitor your symptoms.",
            suggestBooking: parsed.suggestBooking ?? false,
            disclaimer: DISCLAIMER,
            isEmergency: false,
            responseTimeMs: elapsed,
            mlPrediction,
          };

          return new Response(JSON.stringify(analysis), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (geminiErr: any) {
        console.error(
          "[Symptom Checker] Gemini error, falling back to rule engine:",
          geminiErr?.message || geminiErr
        );
        // Fall through to rule-based engine
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: Rule-based fallback (if Gemini is unavailable or fails)
    // ═══════════════════════════════════════════════════════════════════
    const fallbackResult = runRuleBasedTriage(latestMessage);
    const mlPrediction = await fetchMLUrgency(latestMessage);
    const elapsed = Date.now() - startTime;
    console.log(
      `[Symptom Checker] Rule-based fallback in ${elapsed}ms | urgency: ${fallbackResult.urgencyLevel}`
    );

    return new Response(
      JSON.stringify({ ...fallbackResult, mlPrediction, responseTimeMs: elapsed }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Symptom checker error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during symptom analysis.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Rule-based triage engine for when AI is unavailable.
 * Classifies into LOW/MEDIUM/HIGH with appropriate recommendations.
 */
function runRuleBasedTriage(symptoms: string): SymptomAnalysis {
  const text = symptoms.toLowerCase();

  // HIGH — serious symptoms
  if (
    text.includes("high fever") ||
    text.includes("104") ||
    text.includes("103") ||
    text.includes("blood in") ||
    text.includes("severe pain") ||
    text.includes("persistent vomiting") ||
    text.includes("blurred vision") ||
    text.includes("swelling") ||
    text.includes("lump")
  ) {
    return {
      urgencyLevel: "HIGH",
      triageCategory: "RED",
      summary: `Potentially serious symptoms detected. We strongly recommend seeing a doctor promptly.`,
      possibleCauses: [
        "Serious Infection",
        "Acute Inflammatory Condition",
        "Condition requiring medical evaluation",
      ],
      recommendedAction:
        "Please book a doctor consultation on CuraLink as soon as possible. If symptoms worsen rapidly, consider visiting an emergency room.",
      suggestBooking: true,
      disclaimer: DISCLAIMER,
      isEmergency: false,
    };
  }

  // Check if mild symptom (e.g. mild headache, slight fatigue)
  const isExplicitlyMild =
    (text.includes("mild") || text.includes("slight") || text.includes("minor")) &&
    !text.includes("fever") &&
    !text.includes("severe") &&
    !text.includes("high") &&
    !text.includes("3 days") &&
    !text.includes("persistent");

  if (isExplicitlyMild) {
    return {
      urgencyLevel: "LOW",
      triageCategory: "GREEN",
      summary: `Your symptoms appear mild and are commonly manageable with self-care. Monitor for any changes.`,
      possibleCauses: [
        "Mild Tension or Fatigue",
        "Common Cold / Upper Respiratory Irritation",
        "Mild Seasonal Allergies",
        "Dehydration or Physical Strain",
      ],
      recommendedAction:
        "Rest, stay hydrated, and take over-the-counter pain relief if needed. If symptoms persist beyond 48 hours or worsen, consider booking a CuraLink consultation.",
      suggestBooking: false,
      disclaimer: DISCLAIMER,
      isEmergency: false,
    };
  }

  // MEDIUM — moderate symptoms
  if (
    text.includes("fever") ||
    text.includes("101") ||
    text.includes("102") ||
    text.includes("headache") ||
    text.includes("migraine") ||
    text.includes("stomach") ||
    text.includes("abdomen") ||
    text.includes("rash") ||
    text.includes("infection") ||
    text.includes("vomit") ||
    text.includes("nausea") ||
    text.includes("dizziness") ||
    text.includes("joint pain") ||
    text.includes("burn") ||
    text.includes("3 days") ||
    text.includes("persistent") ||
    text.includes("getting worse") ||
    text.includes("not improving")
  ) {
    return {
      urgencyLevel: "MEDIUM",
      triageCategory: "YELLOW",
      summary: `Your symptoms suggest a moderate concern that may benefit from professional evaluation. Monitoring is recommended.`,
      possibleCauses: [
        "Viral or Bacterial Infection",
        "Inflammatory Response",
        "Tension or Migraine Headache",
        "Gastrointestinal Issue",
      ],
      recommendedAction:
        "We recommend booking a consultation with a CuraLink doctor within the next 24-48 hours. In the meantime, stay hydrated, rest, and monitor your temperature.",
      suggestBooking: true,
      disclaimer: DISCLAIMER,
      isEmergency: false,
    };
  }

  // LOW — mild symptoms
  return {
    urgencyLevel: "LOW",
    triageCategory: "GREEN",
    summary: `Your symptoms appear mild and are commonly manageable with self-care. Monitor for any changes.`,
    possibleCauses: [
      "Mild Tension or Fatigue",
      "Common Cold / Upper Respiratory Irritation",
      "Mild Seasonal Allergies",
      "Dehydration or Physical Strain",
    ],
    recommendedAction:
      "Rest, stay hydrated, and take over-the-counter pain relief if needed. If symptoms persist beyond 48 hours or worsen, consider booking a CuraLink consultation.",
    suggestBooking: false,
    disclaimer: DISCLAIMER,
    isEmergency: false,
  };
}
