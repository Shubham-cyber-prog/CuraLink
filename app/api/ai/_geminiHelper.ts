import { GoogleGenerativeAI } from "@google/generative-ai";

export async function runGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
  const model = genAI.getGenerativeModel({ model: modelName });
  const response = await model.generateContent(prompt);
  return response.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export { isGeminiConfigured, streamGeminiChat, streamGeminiPrompt } from "@/lib/gemini";
