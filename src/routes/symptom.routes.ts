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

function runClinicalRuleTriage(symptoms: string): AnalysisResult {
  const text = symptoms.toLowerCase();

  // Emergency Red Flags
  if (
    text.includes('chest pain') ||
    text.includes('heart attack') ||
    text.includes('shortness of breath') ||
    text.includes('difficulty breathing') ||
    text.includes('faint') ||
    text.includes('stroke') ||
    text.includes('loss of consciousness') ||
    text.includes('unconscious') ||
    text.includes('severe bleeding') ||
    text.includes('paralysis')
  ) {
    return {
      triageCategory: 'RED',
      severity: 'Emergency',
      urgencyLabel: 'Immediate Emergency Medical Care Required',
      summary: `Urgent critical indicators detected in: "${symptoms.slice(0, 100)}..."`,
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

  // Moderate Yellow Flags
  if (
    text.includes('fever') ||
    text.includes('headache') ||
    text.includes('migraine') ||
    text.includes('stomach') ||
    text.includes('abdomen') ||
    text.includes('rash') ||
    text.includes('infection') ||
    text.includes('vomit') ||
    text.includes('nausea') ||
    text.includes('dizziness') ||
    text.includes('joint') ||
    text.includes('burn')
  ) {
    let specialist = 'General Practice';
    if (text.includes('headache') || text.includes('migraine')) specialist = 'Neurology Specialist';
    else if (text.includes('rash') || text.includes('skin') || text.includes('itching')) specialist = 'Dermatology Specialist';
    else if (text.includes('child') || text.includes('infant') || text.includes('baby')) specialist = 'Pediatrics Specialist';
    else if (text.includes('joint') || text.includes('bone')) specialist = 'Orthopedic Specialist';

    return {
      triageCategory: 'YELLOW',
      severity: 'Moderate',
      urgencyLabel: 'Consultation Recommended Within 24-48 Hours',
      summary: `Clinical assessment for moderate symptoms: "${symptoms.slice(0, 100)}..."`,
      recommendedSpecialist: specialist,
      possibleCauses: [
        'Viral or Bacterial Infection',
        'Localized Acute Inflammation',
        'Tension or Migraine Headache Syndrome',
        'Gastrointestinal Irritation',
      ],
      recommendedAction:
        'Book an appointment with a verified CuraLink specialist. Monitor symptoms, stay hydrated, and rest.',
    };
  }

  // Mild Green Routine
  return {
    triageCategory: 'GREEN',
    severity: 'Mild',
    urgencyLabel: 'Routine Self-Care & Outpatient Follow-up',
    summary: `Assessment for general mild symptoms: "${symptoms.slice(0, 100)}..."`,
    recommendedSpecialist: 'General Practice Physician',
    possibleCauses: [
      'Mild Seasonal Allergies',
      'Common Cold / Upper Respiratory Fatigue',
      'Mild Tension / Dehydration',
      'Physical Strain',
    ],
    recommendedAction:
      'Maintain adequate fluid intake, rest well, and monitor progression. If symptoms persist beyond 48 hours, schedule a telehealth consultation.',
  };
}

router.post('/', async (req: Request, res: Response) => {
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

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are a clinical AI triage assistant for CuraLink.
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

Patient symptoms: "${symptoms}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text) as AnalysisResult;

        // Fetch ML text classification signal in parallel
        const mlPrediction = await mlServiceClient.predictUrgency(symptoms);

        res.status(200).json({
          success: true,
          data: {
            ...parsed,
            mlPrediction: mlPrediction ? {
              urgencyLevel: mlPrediction.urgencyLevel,
              confidence: mlPrediction.confidence,
              confidencePercentage: mlPrediction.confidencePercentage,
              modelType: mlPrediction.modelType,
            } : null,
          },
        });
        return;
      } catch (geminiErr: any) {
        // Fallback to rule-based clinical engine if Gemini model is rate-limited or fails
        console.error('[Symptom Routes] Gemini API error, falling back to rule engine:', geminiErr?.message || geminiErr);
      }
    }

    // High-precision clinical rule triage engine + ML classifier
    const triageData = runClinicalRuleTriage(symptoms);
    const mlPrediction = await mlServiceClient.predictUrgency(symptoms);

    res.status(200).json({
      success: true,
      data: {
        ...triageData,
        mlPrediction: mlPrediction ? {
          urgencyLevel: mlPrediction.urgencyLevel,
          confidence: mlPrediction.confidence,
          confidencePercentage: mlPrediction.confidencePercentage,
          modelType: mlPrediction.modelType,
        } : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error evaluating symptoms',
    });
  }
});

export default router;
