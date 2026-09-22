import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  console.log('API Key length:', apiKey?.length);
  if (!apiKey) {
    console.error('No API key');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test candidate models
  const candidates = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
  ];

  for (const modelName of candidates) {
    const t0 = Date.now();
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent('Say hello in 1 word');
      console.log(`[${modelName}] ✅ Success in ${Date.now() - t0}ms:`, res.response.text().trim());
    } catch (err: any) {
      console.log(`[${modelName}] ❌ Failed in ${Date.now() - t0}ms:`, err?.status || err?.message?.slice(0, 100));
    }
  }
}

main();
