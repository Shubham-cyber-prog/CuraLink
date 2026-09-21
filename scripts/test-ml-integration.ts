import dotenv from "dotenv";
dotenv.config();

import { mlServiceClient } from "../src/services/ml-service.client";
import { POST as healthRiskPost } from "../app/api/health-risk/route";
import { POST as symptomCheckerPost } from "../app/api/symptom-checker/route";

async function runEndToEndIntegrationTests() {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  CURALINK ML MICROSERVICE END-TO-END INTEGRATION TESTS");
  console.log("══════════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details: string = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${name}`);
      if (details) console.log(`     → ${details}`);
      failed++;
    }
  }

  // TEST 1: ML Client Health Check
  console.log("━━━ 1. Health Check via Node ML Client ━━━");
  const health = await mlServiceClient.checkHealth();
  assert("ML Service is healthy and responding", health.healthy === true);
  assert(
    "All 3 model groups are loaded in microservice",
    health.details?.modelsLoaded?.length >= 6,
    `Loaded: ${health.details?.modelsLoaded?.join(", ")}`
  );

  // TEST 2: Diabetes Risk Prediction
  console.log("\n━━━ 2. Diabetes Risk Prediction via Node Client ━━━");
  const diabetesRes = await mlServiceClient.predictDiabetesRisk({
    pregnancies: 3,
    glucose: 160,
    bloodPressure: 84,
    bmi: 36.2,
    age: 50,
  });
  assert("Diabetes risk prediction succeeded", diabetesRes !== null);
  assert(
    "Diabetes risk score is within valid range (0-1)",
    diabetesRes ? diabetesRes.riskScore >= 0 && diabetesRes.riskScore <= 1 : false
  );
  assert(
    "Diabetes feature importance explainability array is populated",
    (diabetesRes?.featureImportance?.length || 0) > 0,
    `Count: ${diabetesRes?.featureImportance?.length}`
  );
  console.log(`  📊 Risk Level: ${diabetesRes?.riskLevel} (${diabetesRes?.riskPercentage}%)`);
  console.log(`  🔍 Top Factor: ${diabetesRes?.featureImportance[0]?.displayName} (${diabetesRes?.featureImportance[0]?.contribution})`);

  // TEST 3: Heart Disease Risk Prediction
  console.log("\n━━━ 3. Heart Disease Risk Prediction via Node Client ━━━");
  const heartRes = await mlServiceClient.predictHeartRisk({
    age: 60,
    sex: 1,
    cp: 0,
    trestbps: 140,
    chol: 260,
    thalach: 125,
    exang: 1,
    oldpeak: 2.0,
  });
  assert("Heart disease prediction succeeded", heartRes !== null);
  assert(
    "Heart risk score is within valid range (0-1)",
    heartRes ? heartRes.riskScore >= 0 && heartRes.riskScore <= 1 : false
  );
  assert(
    "Heart feature importance explainability array is populated",
    (heartRes?.featureImportance?.length || 0) > 0
  );
  console.log(`  📊 Risk Level: ${heartRes?.riskLevel} (${heartRes?.riskPercentage}%)`);
  console.log(`  🔍 Top Factor: ${heartRes?.featureImportance[0]?.displayName} (${heartRes?.featureImportance[0]?.contribution})`);

  // TEST 4: Symptom Urgency Text Classifier
  console.log("\n━━━ 4. Symptom Urgency Text Classifier via Node Client ━━━");
  const urgencyLow = await mlServiceClient.predictUrgency("I have a mild headache since yesterday");
  assert(
    "Urgency predicted LOW for mild headache",
    urgencyLow?.urgencyLevel === "LOW",
    `Got: ${urgencyLow?.urgencyLevel} (Confidence: ${urgencyLow?.confidencePercentage}%)`
  );

  const urgencyMed = await mlServiceClient.predictUrgency("I have had a fever of 101F for 3 days");
  assert(
    "Urgency predicted MEDIUM for fever 101F for 3 days",
    urgencyMed?.urgencyLevel === "MEDIUM",
    `Got: ${urgencyMed?.urgencyLevel} (Confidence: ${urgencyMed?.confidencePercentage}%)`
  );

  const urgencyHigh = await mlServiceClient.predictUrgency("High fever of 104F with severe confusion and shaking chills");
  assert(
    "Urgency predicted HIGH for fever 104F with rigors",
    urgencyHigh?.urgencyLevel === "HIGH",
    `Got: ${urgencyHigh?.urgencyLevel} (Confidence: ${urgencyHigh?.confidencePercentage}%)`
  );

  // TEST 5: Next.js Health Risk API Route
  console.log("\n━━━ 5. Next.js API Route (/api/health-risk) ━━━");
  const reqApi = new Request("http://localhost:3000/api/health-risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "diabetes",
      data: { glucose: 130, bmi: 29.0, age: 45 },
    }),
  });
  const resApi = await healthRiskPost(reqApi);
  const dataApi = await resApi.json();
  assert("Next.js /api/health-risk returned 200 OK", resApi.status === 200);
  assert("Next.js /api/health-risk returned riskLevel", !!dataApi.riskLevel);
  assert("Next.js /api/health-risk returned featureImportance", Array.isArray(dataApi.featureImportance));

  // TEST 6: Next.js Symptom Checker Flow with Secondary ML Signal
  console.log("\n━━━ 6. Symptom Checker Flow with Secondary ML Signal ━━━");
  const reqSymptom = new Request("http://localhost:3000/api/symptom-checker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "I have had a persistent wet cough for 5 days" }],
    }),
  });
  const resSymptom = await symptomCheckerPost(reqSymptom);
  const dataSymptom = await resSymptom.json();
  assert("Symptom checker returned 200 OK", resSymptom.status === 200);
  assert("Symptom checker response includes mlPrediction", dataSymptom.mlPrediction !== undefined);
  if (dataSymptom.mlPrediction) {
    console.log(
      `  🤖 ML Signal Attached: ${dataSymptom.mlPrediction.urgencyLevel} (${dataSymptom.mlPrediction.confidencePercentage}% confidence)`
    );
  }

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log(`  INTEGRATION RESULTS: ${passed} passed, ${failed} failed`);
  console.log("══════════════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

runEndToEndIntegrationTests().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
