import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mlServiceClient } from '../services/ml-service.client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

interface AnalysisResult {
  triageCategory: 'RED' | 'YELLOW' | 'GREEN';
  severity: 'Emergency' | 'Moderate' | 'Mild';
  urgencyLabel: string;
  summary: string;
  recommendedSpecialist: string;
  possibleCauses: string[];
  recommendedAction: string;
}

interface SymptomUserTracker {
  windowStart: number;
  windowCount: number;
  dayStart: number;
  dayCount: number;
}

export const SYMPTOM_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const SYMPTOM_MAX_PER_WINDOW = 5; // 5 assessments per 15 minutes
export const SYMPTOM_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
export const SYMPTOM_MAX_DAILY = 15; // 15 assessments per 24 hours
export const TOTAL_GEMINI_BUDGET_MS = 20000; // Hard cap of 20s total per request (Render gateway limit is 30s)

const symptomUserStore = new Map<string, SymptomUserTracker>();

export function resetSymptomUserStore(): void {
  symptomUserStore.clear();
}

/**
 * Strict per-user rate limit and daily cap middleware for symptom routes.
 */
export function symptomUserRateLimiter(req: Request, res: Response, next: NextFunction): void {
  // Allow skipping in tests unless explicitly testing rate limits
  if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
    return next();
  }

  const userId = req.user?.id || req.ip || 'anonymous';
  const now = Date.now();

  let tracker = symptomUserStore.get(userId);

  if (!tracker) {
    tracker = {
      windowStart: now,
      windowCount: 1,
      dayStart: now,
      dayCount: 1,
    };
    symptomUserStore.set(userId, tracker);
    return next();
  }

  // Check and roll daily window
  if (now - tracker.dayStart >= SYMPTOM_DAILY_WINDOW_MS) {
    tracker.dayStart = now;
    tracker.dayCount = 0;
  }

  // Check and roll short window
  if (now - tracker.windowStart >= SYMPTOM_RATE_LIMIT_WINDOW_MS) {
    tracker.windowStart = now;
    tracker.windowCount = 0;
  }

  // Check daily limit first
  if (tracker.dayCount >= SYMPTOM_MAX_DAILY) {
    const retryAfterSec = Math.ceil((tracker.dayStart + SYMPTOM_DAILY_WINDOW_MS - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec.toString());
    res.status(429).json({
      success: false,
      message: `Daily symptom assessment limit reached (${SYMPTOM_MAX_DAILY} assessments per 24 hours). Please consult a doctor on CuraLink directly if your condition persists or worsens.`,
      retryAfter: retryAfterSec,
    });
    return;
  }

  // Check short-window limit
  if (tracker.windowCount >= SYMPTOM_MAX_PER_WINDOW) {
    const retryAfterSec = Math.ceil((tracker.windowStart + SYMPTOM_RATE_LIMIT_WINDOW_MS - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec.toString());
    res.status(429).json({
      success: false,
      message: 'Too many symptom check requests. Please wait a few minutes before trying again.',
      retryAfter: retryAfterSec,
    });
    return;
  }

  tracker.dayCount++;
  tracker.windowCount++;
  next();
}

const SYMPTOM_SYSTEM_PROMPT = `You are a clinical AI triage assistant for CuraLink.
Analyze the following patient symptoms and return a strictly valid JSON object matching this exact TypeScript interface:
{
  "triageCategory": "RED" | "YELLOW" | "GREEN",
  "severity": "Emergency" | "Moderate" | "Mild",
  "urgencyLabel": string,
  "summary": string,
  "recommendedSpecialist": string,
  "possibleCauses": string[],
  "recommendedAction": string
}

Clinical classification & behavior rules:
1. VAGUE, AMBIGUOUS, OR NON-SYMPTOM MESSAGES (e.g. "I am ill, can you give me some medicine to feel relief", "I am ill", "give me medicine", "help me feel better", "I feel sick"):
   - When the user does NOT provide specific symptoms (body location, duration, characteristics, or nature of illness):
   - You MUST NOT guess or hallucinate generic conditions like "Common Cold", "Seasonal Allergies", or "Mild Tension".
   - In "summary": Empathize warmly, ask clarifying questions (e.g. asking what specific symptoms they are experiencing like fever, headache, body aches, cough, or stomach pain, when they started, and how severe they are), and explicitly state: "As an AI clinical assistant, I cannot prescribe, recommend, or dispense medications."
   - In "possibleCauses": Return exactly ["Insufficient symptom details provided to identify possible causes"].
   - In "recommendedSpecialist": "General Practice Physician".
   - In "recommendedAction": State: "Please describe your specific symptoms (e.g., location, duration, severity). If you require prescription medication or medical evaluation, please book a consultation with a licensed CuraLink doctor."
   - triageCategory: "GREEN", severity: "Mild", urgencyLabel: "Clarification Needed / Insufficient Details".

2. CHRONIC OR PROLONGED SYMPTOMS (e.g., lasting > 6 weeks, multiple months, persistent progressive pain, like "back pain around 2 months"):
   - Symptoms lasting 2 months or more are CHRONIC, not acute. Chronic conditions require formal clinical investigation.
   - ALWAYS classify symptoms lasting 2 months or more as at least 'YELLOW' (Moderate) with urgencyLabel: "Medical Consultation Recommended (Chronic Condition)".
   - For back pain: Provide specific causes such as Musculoskeletal lumbar strain, Posture or ergonomic strain, Herniated or bulging intervertebral disc, or Degenerative disc changes.
   - recommendedSpecialist: "Orthopedic Specialist / Physical Therapist".

3. ACUTE MODERATE SYMPTOMS (fever >101°F, persistent cough >3 days, moderate rash, vomiting, migraines):
   - triageCategory: "YELLOW", severity: "Moderate", urgencyLabel: "Consultation Recommended Within 24-48 Hours".

4. SEVERE OR HIGH RISK SYMPTOMS (high fever 104°F with lethargy/drowsiness, severe acute pain, signs of systemic infection):
   - triageCategory: "RED", severity: "Emergency", urgencyLabel: "Immediate Medical Evaluation Required".

5. MILD TRANSIENT SYMPTOMS (mild tension after screen time, minor temporary itch for <2 days, slight fatigue):
   - triageCategory: "GREEN", severity: "Mild", urgencyLabel: "Routine Self-Care & Outpatient Follow-up".

Guidelines:
- NEVER prescribe or recommend specific medications.
- Always provide symptom-specific possible causes directly matching the body area and duration. Never return generic respiratory causes for non-respiratory complaints.
- Return ONLY the valid JSON object.`;

/**
 * Emergency Keyword Detector for Express route
 */
function checkEmergencyKeywords(text: string): AnalysisResult | null {
  const lower = text.toLowerCase();
  if (
    lower.includes('chest pain') ||
    lower.includes('heart attack') ||
    lower.includes('shortness of breath') ||
    lower.includes('difficulty breathing') ||
    lower.includes('cannot breathe') ||
    lower.includes('faint') ||
    lower.includes('stroke') ||
    lower.includes('unconscious') ||
    lower.includes('severe bleeding') ||
    lower.includes('paralysis')
  ) {
    return {
      triageCategory: 'RED',
      severity: 'Emergency',
      urgencyLabel: 'Immediate Emergency Medical Care Required',
      summary: `Urgent critical indicators detected in: "${text.slice(0, 100)}..."`,
      recommendedSpecialist: 'Cardiologist / Emergency Medicine',
      possibleCauses: [
        'Acute Coronary Syndrome',
        'Severe Pulmonary Distress',
        'Cerebrovascular Event',
        'Critical Hypoxia',
      ],
      recommendedAction:
        'Call emergency services immediately (911 / 112) or go to the nearest emergency department. Do not drive yourself.',
    };
  }
  return null;
}

const handleSymptomAnalysis = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const geminiDeadline = startTime + TOTAL_GEMINI_BUDGET_MS;

  try {
    const rawSymptoms =
      req.body?.symptoms ||
      (Array.isArray(req.body?.messages) ? req.body.messages[req.body.messages.length - 1]?.content : '') ||
      req.body?.message ||
      '';

    const symptoms = typeof rawSymptoms === 'string' ? rawSymptoms.trim() : '';

    if (!symptoms) {
      res.status(400).json({
        success: false,
        message: 'Please provide symptoms description',
      });
      return;
    }

    console.log(`\n[Express Symptom Route] Incoming triage request (length: ${symptoms.length} chars)`);

    // STEP 1: Check emergency short-circuit
    const emergency = checkEmergencyKeywords(symptoms);
    if (emergency) {
      console.log(`[Express Symptom Route] 🚨 EMERGENCY short-circuit triggered: ${emergency.summary}`);
      const mlPrediction = await mlServiceClient.predictUrgency(symptoms);
      res.status(200).json({
        success: true,
        data: {
          ...emergency,
          urgencyLevel: 'EMERGENCY',
          mlPrediction: mlPrediction ? {
            urgencyLevel: mlPrediction.urgencyLevel,
            confidence: mlPrediction.confidence,
            confidencePercentage: mlPrediction.confidencePercentage,
            modelType: mlPrediction.modelType,
          } : null,
        },
      });
      return;
    }

    // STEP 2: Call Gemini with strict total deadline of ~20s (Render gateway limit is 30s)
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (!geminiKey) {
      console.error('[Express Symptom Route] GEMINI_API_KEY is not configured');
      res.status(503).json({
        success: false,
        message: 'Clinical AI engine is not configured on the server.',
      });
      return;
    }

    const configuredModel = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
    const modelChain = Array.from(new Set([configuredModel, 'gemini-2.5-flash-lite'])).slice(0, 2);
    const genAI = new GoogleGenerativeAI(geminiKey);

    let parsedResult: AnalysisResult | null = null;
    let lastError: any = null;

    for (const candidate of modelChain) {
      const remainingTotal = geminiDeadline - Date.now();
      if (remainingTotal < 2500) {
        console.warn(`[Express Symptom Route] Skipping model ${candidate}: total time budget exhausted (${remainingTotal}ms remaining)`);
        break;
      }

      const model = genAI.getGenerativeModel({
        model: candidate,
        systemInstruction: SYMPTOM_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      for (let retry = 0; retry < 2; retry++) {
        const remainingForAttempt = geminiDeadline - Date.now();
        if (remainingForAttempt < 2500) {
          console.warn(`[Express Symptom Route] Aborting retries for ${candidate}: time budget exhausted (${remainingForAttempt}ms remaining)`);
          break;
        }

        // Cap each individual call to either 9s or the remaining total budget (whichever is smaller)
        const callTimeoutMs = Math.min(remainingForAttempt, 9000);
        const attemptStart = Date.now();
        console.log(`[Express Symptom Route] [${candidate}] Attempt ${retry + 1}/2 calling Gemini (budget: ${callTimeoutMs}ms)...`);

        let timer: NodeJS.Timeout | null = null;
        try {
          const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Gemini call timed out after ${callTimeoutMs}ms`)), callTimeoutMs);
          });

          const result = (await Promise.race([
            model.generateContent(symptoms),
            timeoutPromise,
          ])) as any;

          if (timer) clearTimeout(timer);

          const text = result.response.text();
          const callDuration = Date.now() - attemptStart;
          console.log(`[Express Symptom Route] ✅ ${candidate} responded in ${callDuration}ms`);

          let cleanText = text.trim();
          if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          }
          parsedResult = JSON.parse(cleanText) as AnalysisResult;
          break; // Success!
        } catch (err: any) {
          if (timer) clearTimeout(timer);
          lastError = err;
          const status = err?.status || err?.code;
          console.warn(`[Express Symptom Route] ⚠️ ${candidate} attempt ${retry + 1} failed:`, err?.message || err);

          const isTransient = status === 503 || status === 429 || err?.message?.includes('503') || err?.message?.includes('429');
          const timeLeft = geminiDeadline - Date.now();

          if (isTransient && retry === 0 && timeLeft > 4000) {
            await new Promise((r) => setTimeout(r, 1000));
          } else {
            break;
          }
        }
      }

      if (parsedResult) break;
    }

    if (!parsedResult) {
      const totalDuration = Date.now() - startTime;
      console.error(`[Express Symptom Route] ❌ All Gemini attempts failed or budget exceeded after ${totalDuration}ms`);
      res.status(503).json({
        success: false,
        message: 'Our clinical AI engine is temporarily unavailable. Please try again in a few moments, or consult a doctor on CuraLink directly.',
        error: lastError?.message || 'Service unavailable',
      });
      return;
    }

    // Fetch ML classification
    const mlPrediction = await mlServiceClient.predictUrgency(symptoms);

    res.status(200).json({
      success: true,
      data: {
        ...parsedResult,
        urgencyLevel: (parsedResult.severity?.toUpperCase() === 'EMERGENCY' || parsedResult.triageCategory === 'RED')
          ? 'EMERGENCY'
          : (parsedResult.severity?.toUpperCase() === 'MODERATE' || parsedResult.triageCategory === 'YELLOW')
          ? 'MODERATE'
          : 'LOW',
        mlPrediction: mlPrediction ? {
          urgencyLevel: mlPrediction.urgencyLevel,
          confidence: mlPrediction.confidence,
          confidencePercentage: mlPrediction.confidencePercentage,
          modelType: mlPrediction.modelType,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('[Express Symptom Route] ❌ Unhandled error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Error evaluating symptoms',
    });
  }
};

// Require authentication for all symptom routes
router.use(authenticate);

// Mount authenticated endpoints with strict rate limiting and daily cap
router.post('/', symptomUserRateLimiter, handleSymptomAnalysis);
router.post('/analyze', symptomUserRateLimiter, handleSymptomAnalysis);

export default router;
