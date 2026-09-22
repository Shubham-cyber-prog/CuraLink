import { GoogleGenerativeAI } from "@google/generative-ai";
import { isGeminiConfigured } from "@/lib/gemini";
import {
  detectEmergency,
  DISCLAIMER,
  type SymptomAnalysis,
} from "@/lib/emergency-detector.service";

export const maxDuration = 30;

// Simple in-memory rate limiter for the symptom checker
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const SYMPTOM_CHECKER_SYSTEM_PROMPT = `You are CuraLink's advanced AI Symptom Checker. You are a highly professional, empathetic, and knowledgeable virtual clinical assistant.
Your goal is to help users understand their symptoms and provide general clinical guidance, while strictly maintaining that you are an AI and NEVER providing definitive medical diagnosis, prescription, or treatment.

You MUST return a valid JSON object matching this EXACT structure:
{
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH",
  "triageCategory": "GREEN" | "YELLOW" | "RED",
  "summary": "Empathetic, clinically accurate summary tailored specifically to the patient's inputs",
  "possibleCauses": ["Specific Cause 1", "Specific Cause 2", "Specific Cause 3"],
  "recommendedAction": "Actionable next steps for the user",
  "suggestBooking": true or false
}

Clinical classification & behavior rules:
1. VAGUE, AMBIGUOUS, OR NON-SYMPTOM MESSAGES (e.g., "I am ill, can you give me some medicine to feel relief", "I am ill", "give me medicine", "help me feel better", "I feel sick"):
   - When the user does NOT provide specific symptoms (body location, duration, characteristics, or nature of illness):
   - You MUST NOT guess or hallucinate generic conditions like "Common Cold", "Seasonal Allergies", or "Mild Tension".
   - In "summary": Empathize warmly, ask clarifying questions (e.g. asking what specific symptoms they are experiencing like fever, headache, body aches, cough, or stomach pain, when they started, and how severe they are), and explicitly state: "As an AI clinical assistant, I cannot prescribe, recommend, or dispense medications."
   - In "possibleCauses": Return exactly ["Insufficient symptom details provided to identify possible causes"].
   - In "recommendedAction": State: "Please describe your specific symptoms (e.g., location, duration, severity). If you require prescription medication or medical evaluation, please book a consultation with a licensed CuraLink doctor."
   - urgencyLevel: "LOW", triageCategory: "GREEN", suggestBooking: false.

2. CHRONIC OR PROLONGED SYMPTOMS (e.g., lasting > 6 weeks, multiple months, persistent progressive pain, like "back pain around 2 months"):
   - Symptoms lasting 2 months or more are CHRONIC, not acute. Chronic conditions require formal clinical investigation (e.g., physical assessment, imaging, ergonomic review).
   - ALWAYS classify symptoms lasting 2 months or more as at least 'MEDIUM' (YELLOW) urgency, with suggestBooking = true.
   - For back pain: Provide specific causes such as Musculoskeletal lumbar strain, Posture or ergonomic strain, Herniated or bulging intervertebral disc, or Degenerative disc changes. Never return respiratory or allergy causes for musculoskeletal pain.
   - recommendedAction: Recommend consulting a healthcare professional or physical therapist on CuraLink for formal clinical evaluation and imaging. Advise gentle activity, avoiding heavy lifting, and proper posture.

3. ACUTE MODERATE SYMPTOMS (fever >101°F, persistent cough >3 days, moderate rash, vomiting, migraines):
   - urgencyLevel: "MEDIUM" (YELLOW), suggestBooking = true.

4. SEVERE OR HIGH RISK SYMPTOMS (high fever 104°F with lethargy/drowsiness, severe acute pain, signs of systemic infection):
   - urgencyLevel: "HIGH" (RED), suggestBooking = true.

5. MILD TRANSIENT SYMPTOMS (mild tension after screen time, minor temporary itch for <2 days, slight fatigue):
   - urgencyLevel: "LOW" (GREEN), suggestBooking = false.

Guidelines:
- NEVER prescribe or recommend specific medications.
- Always provide symptom-specific possible causes directly matching the body area and duration. Never return generic respiratory causes for non-respiratory complaints.
- Return ONLY the valid JSON object.`;

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

/**
 * Calls Gemini with automatic retries and exponential backoff.
 * Fallbacks across candidate models if 503 (high demand) or 404 is encountered.
 */
async function callGeminiWithRetry(
  prompt: string,
  systemInstruction: string,
  maxRetries = 2
): Promise<{ text: string; modelUsed: string; attempts: number }> {
  const apiKey = process.env.GEMINI_API_KEY!.trim();
  const configuredModel = process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";
  const genAI = new GoogleGenerativeAI(apiKey);

  // Verified reliable model chain
  const modelChain = ["gemini-3.5-flash-lite", "gemini-3.6-flash"];

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const currentModelName = modelChain[Math.min(attempt - 1, modelChain.length - 1)];
    const timeoutMs = 35000; // 35 seconds timeout per attempt

    console.log(
      `\n======================================================`
    );
    console.log(
      `[Symptom Checker API] [Attempt ${attempt}/${maxRetries + 1}] Calling Gemini model: ${currentModelName}`
    );
    console.log(`[Symptom Checker API] [Attempt ${attempt}] EXACT PROMPT SENT TO GEMINI:`);
    console.log(`"""\n${prompt}\n"""`);

    const callStartTime = Date.now();

    try {
      const model = genAI.getGenerativeModel({
        model: currentModelName,
        systemInstruction,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const result: any = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Gemini call to ${currentModelName} timed out after ${timeoutMs / 1000}s`
                )
              ),
            timeoutMs
          )
        ),
      ]);

      const responseText = result.response.text();
      const callDuration = Date.now() - callStartTime;

      console.log(
        `[Symptom Checker API] [Attempt ${attempt}] Gemini responded in ${callDuration}ms`
      );
      console.log(`[Symptom Checker API] [Attempt ${attempt}] EXACT RAW RESPONSE RECEIVED:`);
      console.log(responseText);

      return { text: responseText, modelUsed: currentModelName, attempts: attempt };
    } catch (err: any) {
      lastError = err;
      const callDuration = Date.now() - callStartTime;
      const status = err?.status || err?.code || "UNKNOWN";
      console.error(
        `[Symptom Checker API] [Attempt ${attempt}] ❌ Gemini call failed after ${callDuration}ms (Status: ${status}):`,
        err?.message || err
      );

      if (attempt <= maxRetries) {
        const backoffDelay = attempt * 1000;
        console.log(
          `[Symptom Checker API] Retrying in ${backoffDelay}ms with backoff...`
        );
        await new Promise((r) => setTimeout(r, backoffDelay));
      }
    }
  }

  throw lastError;
}

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Rate Limiting Logic (30 requests per hour per IP)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    let rateLimit = rateLimitStore.get(ip);
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimit = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(ip, rateLimit);
    } else {
      rateLimit.count++;
      if (rateLimit.count > 30) {
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

    console.log(`\n[Symptom Checker API] Incoming request for symptom: "${latestMessage}"`);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: EMERGENCY DETECTION — runs SYNCHRONOUSLY before any API call
    // This is the core safety mechanism. Zero network latency.
    // ═══════════════════════════════════════════════════════════════════
    const emergencyResult = detectEmergency(latestMessage);
    if (emergencyResult) {
      const elapsed = Date.now() - startTime;
      console.log(
        `[Symptom Checker API] 🚨 EMERGENCY short-circuit in ${elapsed}ms: ${emergencyResult.summary}`
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
    // STEP 2: AI-powered analysis via Gemini with Retries and Backoff
    // ═══════════════════════════════════════════════════════════════════
    if (!isGeminiConfigured()) {
      console.error("[Symptom Checker API] ❌ GEMINI_API_KEY is not configured in .env");
      return new Response(
        JSON.stringify({
          error:
            "Clinical AI engine is not configured. Please ensure GEMINI_API_KEY is set in your environment.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const { text: responseText, modelUsed, attempts } = await callGeminiWithRetry(
        latestMessage,
        SYMPTOM_CHECKER_SYSTEM_PROMPT,
        2
      );

      const parsed = parseGeminiJson(responseText);

      if (!parsed || !parsed.urgencyLevel) {
        console.error(
          "[Symptom Checker API] ❌ Failed to parse Gemini response as valid SymptomAnalysis JSON:",
          responseText
        );
        throw new Error("Invalid JSON structure returned by clinical AI engine.");
      }

      const elapsed = Date.now() - startTime;
      console.log(
        `[Symptom Checker API] ✅ Analysis complete in ${elapsed}ms | Model: ${modelUsed} (${attempts} attempts) | Urgency: ${parsed.urgencyLevel} (${parsed.triageCategory})`
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
        mlUrgency: mlPrediction?.urgencyLevel ?? null,
        mlConfidence: mlPrediction?.confidence ?? null,
        mlConfidencePercentage: mlPrediction?.confidencePercentage ?? null,
      };

      return new Response(JSON.stringify(analysis), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (geminiError: any) {
      const elapsed = Date.now() - startTime;
      console.error(
        `[Symptom Checker API] ❌ All Gemini retry attempts failed after ${elapsed}ms:`,
        geminiError?.message || geminiError
      );

      // Return an honest error message — NEVER return a generic fake medical response disguised as real guidance
      return new Response(
        JSON.stringify({
          error:
            "Our AI clinical analysis service is temporarily unavailable. Please try again in a few moments, or consult a licensed doctor on CuraLink directly.",
          details: geminiError?.message || "Service timeout or upstream error",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("[Symptom Checker API] ❌ Unhandled symptom checker error:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "An unexpected error occurred during symptom analysis.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
