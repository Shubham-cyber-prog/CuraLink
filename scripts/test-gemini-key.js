require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const modelsToTest = [
    'gemini-3-flash-preview',
    'gemini-3.1-pro-preview',
    'gemini-pro-latest',
    'gemini-3.6-flash',
    'gemini-3.8-flash'
  ];

  for (const modelName of modelsToTest) {
    const start = Date.now();
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent('Say hello in 3 words');
      console.log(`✅ [${modelName}] in ${Date.now() - start}ms: "${res.response.text().trim()}"`);
    } catch (err) {
      console.log(`❌ [${modelName}] in ${Date.now() - start}ms: ${err.message}`);
    }
  }
}

main();
