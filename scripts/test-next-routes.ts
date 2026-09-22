async function run() {
  console.log("=== TESTING NEXT.JS API ROUTES ===");

  // 1. Diabetes Health Risk Route
  const diabetesPayload = {
    type: "diabetes",
    data: {
      pregnancies: 2,
      glucose: 140,
      bloodPressure: 80,
      skinThickness: 25,
      insulin: 100,
      bmi: 32,
      diabetesPedigreeFunction: 0.5,
      age: 45,
    },
  };

  const resD = await fetch("http://localhost:3000/api/health-risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(diabetesPayload),
  });

  const dataD = await resD.json();
  console.log("\n--- /api/health-risk (Diabetes) ---");
  console.log("Status:", resD.status);
  console.log("Risk:", dataD.riskLevel, `${dataD.riskPercentage}%`);
  console.log("Feature Importance Top 3:", dataD.featureImportance?.slice(0, 3));

  // 2. Heart Health Risk Route
  const heartPayload = {
    type: "heart",
    data: {
      age: 58,
      sex: 1,
      cp: 1,
      trestbps: 135,
      chol: 245,
      fbs: 0,
      restecg: 0,
      thalach: 140,
      exang: 1,
      oldpeak: 1.5,
      slope: 1,
      ca: 1,
      thal: 2,
    },
  };

  const resH = await fetch("http://localhost:3000/api/health-risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(heartPayload),
  });

  const dataH = await resH.json();
  console.log("\n--- /api/health-risk (Heart) ---");
  console.log("Status:", resH.status);
  console.log("Risk:", dataH.riskLevel, `${dataH.riskPercentage}%`);
  console.log("Feature Importance Top 3:", dataH.featureImportance?.slice(0, 3));

  // 3. Symptom Checker Route
  const symptomPayload = {
    messages: [
      {
        role: "user",
        content: "I've had a persistent cough for 5 days",
      },
    ],
  };

  const resS = await fetch("http://localhost:3000/api/symptom-checker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(symptomPayload),
  });

  const dataS = await resS.json();
  console.log("\n--- /api/symptom-checker ---");
  console.log("Status:", resS.status);
  console.log("Gemini Urgency Level:", dataS.urgencyLevel);
  console.log("Gemini Summary:", dataS.summary);
  console.log("ML Urgency (mlUrgency):", dataS.mlUrgency);
  console.log("ML Confidence (mlConfidence):", dataS.mlConfidence);
  console.log("ML Prediction object:", dataS.mlPrediction);
}

run().catch(console.error);
