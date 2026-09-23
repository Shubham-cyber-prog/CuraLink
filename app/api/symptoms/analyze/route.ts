import { POST as symptomCheckerHandler } from "@/app/api/symptom-checker/route";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. If Express backend is running, try querying it first
    try {
      const expressRes = await fetch(`${API_BASE}/symptoms/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (expressRes.ok) {
        const expressData = await expressRes.json();
        return new Response(JSON.stringify(expressData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      // Express not reachable, fallback to direct Next.js symptom handler below
    }

    // 2. Direct Next.js Fallback: Convert body into messages format
    const symptomText =
      body.symptoms ||
      body.symptomText ||
      body.message ||
      (Array.isArray(body.messages) ? body.messages[body.messages.length - 1]?.content : "");

    const adaptedRequest = new Request(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: symptomText || "" }],
      }),
    });

    const directRes = await symptomCheckerHandler(adaptedRequest);
    const directData = await directRes.json();

    // Normalize output format to { success: true, data: { ... } }
    if (directRes.ok && !directData.error) {
      return new Response(
        JSON.stringify({
          success: true,
          data: directData,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(directData), {
      status: directRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Failed to analyze symptoms",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
