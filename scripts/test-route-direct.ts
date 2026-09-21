import dotenv from "dotenv";
dotenv.config();

import { POST } from "../app/api/symptom-checker/route";

async function testRoute() {
  console.log("Testing POST /api/symptom-checker directly with simulated HTTP requests...\n");

  // TEST 1 — Mild symptom
  console.log("=== TEST 1: Mild symptom ===");
  const req1 = new Request("http://localhost:3000/api/symptom-checker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "I have a mild headache since yesterday" }],
    }),
  });
  const res1 = await POST(req1);
  const data1 = await res1.json();
  console.log("Status:", res1.status);
  console.log("Urgency:", data1.urgencyLevel);
  console.log("SuggestBooking:", data1.suggestBooking);
  console.log("Disclaimer present:", !!data1.disclaimer);
  console.log("Summary:", data1.summary?.slice(0, 80));
  console.log("ResponseTimeMs:", data1.responseTimeMs, "ms\n");

  // TEST 2 — Emergency symptom
  console.log("=== TEST 2: Emergency symptom ===");
  const req2 = new Request("http://localhost:3000/api/symptom-checker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "I'm having chest pain and difficulty breathing" }],
    }),
  });
  const res2 = await POST(req2);
  const data2 = await res2.json();
  console.log("Status:", res2.status);
  console.log("Urgency:", data2.urgencyLevel);
  console.log("IsEmergency:", data2.isEmergency);
  console.log("SuggestBooking:", data2.suggestBooking);
  console.log("RecommendedAction:", data2.recommendedAction?.slice(0, 80));
  console.log("Disclaimer present:", !!data2.disclaimer);
  console.log("ResponseTimeMs:", data2.responseTimeMs, "ms\n");

  // TEST 3 — Moderate symptom
  console.log("=== TEST 3: Moderate symptom ===");
  const req3 = new Request("http://localhost:3000/api/symptom-checker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "I've had a fever of 101F for 3 days" }],
    }),
  });
  const res3 = await POST(req3);
  const data3 = await res3.json();
  console.log("Status:", res3.status);
  console.log("Urgency:", data3.urgencyLevel);
  console.log("SuggestBooking:", data3.suggestBooking);
  console.log("Disclaimer present:", !!data3.disclaimer);
  console.log("Summary:", data3.summary?.slice(0, 80));
  console.log("ResponseTimeMs:", data3.responseTimeMs, "ms\n");
}

testRoute().catch(console.error);
