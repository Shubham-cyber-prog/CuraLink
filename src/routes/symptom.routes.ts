import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mlServiceClient } from '../services/ml-service.client';

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

    console.log(`\n[Express Symptom Route] Incoming request for: "${symptoms}"`);

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

    // STEP 2: Call Gemini with Retry and Model Fallbacks
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (!geminiKey) {
      console.error('[Express Symptom Route] GEMINI_API_KEY is not configured');
      res.status(503).json({
        success: false,
        message: 'Clinical AI engine is not configured on the server.',
      });
      return;
    }

    const modelChain = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];
    const genAI = new GoogleGenerativeAI(geminiKey);

    let parsedResult: AnalysisResult | null = null;
    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const currentModelName = modelChain[Math.min(attempt - 1, modelChain.length - 1)];
      const attemptStart = Date.now();

      console.log(`[Express Symptom Route] [Attempt ${attempt}/3] Calling model: ${currentModelName}`);
      console.log(`[Express Symptom Route] EXACT PROMPT SENT TO GEMINI: "${symptoms}"`);

      try {
        const model = genAI.getGenerativeModel({
          model: currentModelName,
          systemInstruction: SYMPTOM_SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        const result = await Promise.race([
          model.generateContent(symptoms),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini call timed out after 35s`)), 35000)
          ),
        ]) as any;

        const text = result.response.text();
        const callDuration = Date.now() - attemptStart;
        console.log(`[Express Symptom Route] [Attempt ${attempt}] Response in ${callDuration}ms:`);
        console.log(text);

        let cleanText = text.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        parsedResult = JSON.parse(cleanText) as AnalysisResult;
        break; // Success!
      } catch (err: any) {
        lastError = err;
        const callDuration = Date.now() - attemptStart;
        console.error(`[Express Symptom Route] [Attempt ${attempt}] ❌ Failed (${callDuration}ms):`, err?.message || err);

        if (attempt < 3) {
          const delay = attempt * 1000;
          console.log(`[Express Symptom Route] Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    if (!parsedResult) {
      const totalDuration = Date.now() - startTime;
      console.error(`[Express Symptom Route] ❌ All 3 Gemini attempts failed after ${totalDuration}ms`);
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

router.post('/', handleSymptomAnalysis);
router.post('/analyze', handleSymptomAnalysis);

export default router;
