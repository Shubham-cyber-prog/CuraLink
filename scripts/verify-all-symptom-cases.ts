interface TestCase {
  name: string;
  input: string;
}

const TEST_CASES: TestCase[] = [
  {
    name: "Case 1: Vague Message Asking For Medicine",
    input: "I am ill, can you give me some medicine to feel relief",
  },
  {
    name: "Case 2: Chronic Back Pain (2 months)",
    input: "I have a back pain around 2 months, what can I do",
  },
  {
    name: "Case 3: Severe Child Fever With Drowsiness",
    input: "child has 104 fever and is very drowsy",
  },
  {
    name: "Case 4: Mild Itchy Rash",
    input: "mild itchy rash on arm for 2 days",
  },
  {
    name: "Case 5: Sharp Chest Pain",
    input: "sharp chest pain when breathing",
  },
];

async function verifyEndpoint(baseUrl: string, endpointName: string) {
  console.log(`\n######################################################################`);
  console.log(`TESTING ENDPOINT: ${endpointName} (${baseUrl})`);
  console.log(`######################################################################`);

  for (const tc of TEST_CASES) {
    console.log(`\n----------------------------------------------------------------------`);
    console.log(`>>> ${tc.name}`);
    console.log(`Input: "${tc.input}"`);

    const start = Date.now();
    try {
      const payload = baseUrl.includes("3000")
        ? { messages: [{ role: "user", content: tc.input }] }
        : { symptoms: tc.input };

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-platform": "mobile",
        },
        body: JSON.stringify(payload),
      });

      const elapsed = Date.now() - start;
      const data = await res.json();

      console.log(`Status: ${res.status} (${elapsed}ms)`);

      const result = data.data || data;

      console.log(`Urgency / Category: ${result.urgencyLevel || result.severity} | Triage: ${result.triageCategory}`);
      console.log(`Summary: ${result.summary}`);
      console.log(`Possible Causes:`, JSON.stringify(result.possibleCauses, null, 2));
      console.log(`Recommended Action: ${result.recommendedAction}`);
      if (result.suggestBooking !== undefined) {
        console.log(`Suggest Booking: ${result.suggestBooking}`);
      }
      if (result.mlPrediction) {
        console.log(`ML Classifier Urgency: ${result.mlPrediction.urgencyLevel} (${result.mlPrediction.confidencePercentage || Math.round((result.mlPrediction.confidence || 0) * 100)}%)`);
      }
    } catch (err: any) {
      console.error(`FAILED:`, err.message);
    }
  }
}

async function run() {
  // Test Next.js endpoint (used by Web UI)
  await verifyEndpoint("http://localhost:3000/api/symptom-checker", "Next.js /api/symptom-checker");

  // Test Express endpoint (used by Mobile App)
  await verifyEndpoint("http://localhost:5000/api/symptom-checker", "Express /api/symptom-checker");
}

run();
