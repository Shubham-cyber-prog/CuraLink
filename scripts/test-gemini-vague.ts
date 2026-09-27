import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
    systemInstruction: `You are a clinical decision support system. Return JSON:
{
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "triageCategory": "GREEN" | "YELLOW" | "ORANGE" | "RED",
  "summary": "...",
  "possibleCauses": ["..."],
  "recommendedAction": "...",
  "suggestBooking": boolean
}
NEVER prescribe medicine.`,
  });

  try {
    const res = await model.generateContent("I've been feeling slightly off since yesterday, just weird and tired, what medicine should I take?");
    console.log('STATUS: OK');
    console.log(res.response.text());
  } catch (e: any) {
    console.error('ERROR:', e.message || e);
  }
}

test();
