/**
 * Emergency Keyword Detector Service
 *
 * Synchronous, zero-latency emergency keyword detection that runs BEFORE
 * any Gemini API call. This is the core safety mechanism of the symptom checker.
 *
 * When emergency keywords are detected, the response is returned IMMEDIATELY
 * without waiting for any network call to an AI model.
 */

const EMERGENCY_KEYWORDS = [
  "chest pain",
  "heart attack",
  "difficulty breathing",
  "can't breathe",
  "cannot breathe",
  "shortness of breath",
  "stroke",
  "paralysis",
  "unconscious",
  "loss of consciousness",
  "passed out",
  "fainted",
  "severe bleeding",
  "uncontrollable bleeding",
  "seizure",
  "convulsion",
  "choking",
  "suicidal",
  "suicide",
  "overdose",
  "poisoning",
  "anaphylaxis",
  "allergic shock",
  "severe burn",
  "drowning",
  "gunshot",
  "stabbing",
  "head injury",
  "skull fracture",
  "not responding",
  "no pulse",
  "cardiac arrest",
];

export interface SymptomAnalysis {
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  triageCategory: "GREEN" | "YELLOW" | "RED";
  summary: string;
  possibleCauses: string[];
  recommendedAction: string;
  suggestBooking: boolean;
  disclaimer: string;
  isEmergency: boolean;
  responseTimeMs?: number;
  mlPrediction?: {
    urgencyLevel: string;
    confidence: number;
    confidencePercentage?: number;
    modelType?: string;
  } | null;
  mlUrgency?: string | null;
  mlConfidence?: number | null;
  mlConfidencePercentage?: number | null;
}

const DISCLAIMER =
  "This is not a medical diagnosis, please consult a doctor. CuraLink's AI Symptom Checker provides informational guidance only and is not a substitute for professional medical advice, diagnosis, or treatment.";

/**
 * Detects emergency keywords synchronously. Returns an immediate
 * SymptomAnalysis if emergency is detected, or null if no emergency.
 */
export function detectEmergency(text: string): SymptomAnalysis | null {
  const lower = text.toLowerCase();

  const matchedKeywords: string[] = [];
  for (const kw of EMERGENCY_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length === 0) {
    return null;
  }

  console.log(
    `[EmergencyDetector] 🚨 EMERGENCY keywords detected: [${matchedKeywords.join(", ")}]`
  );

  return {
    urgencyLevel: "EMERGENCY",
    triageCategory: "RED",
    summary: `🚨 EMERGENCY: Critical symptoms detected ("${matchedKeywords.join('", "').slice(0, 80)}"). This requires immediate medical attention.`,
    possibleCauses: [
      "Acute Cardiac Event (Heart Attack)",
      "Severe Respiratory Distress",
      "Cerebrovascular Emergency (Stroke)",
      "Critical Trauma / Shock",
    ],
    recommendedAction:
      "🆘 Call emergency services IMMEDIATELY (112 in India / 911 in US) or go to the nearest emergency room. Do NOT wait. Do NOT drive yourself — ask someone to drive you or call an ambulance.",
    suggestBooking: false,
    disclaimer: DISCLAIMER,
    isEmergency: true,
  };
}

/**
 * The standard disclaimer string — exported so it can be appended to
 * all response types consistently.
 */
export { DISCLAIMER };
