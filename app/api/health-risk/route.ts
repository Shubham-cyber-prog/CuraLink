import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

    if (type === "diabetes") {
      const res = await fetch(`${mlUrl}/predict/diabetes-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `ML service error: ${errText}` },
          { status: res.status }
        );
      }

      const result = await res.json();
      return NextResponse.json(result);
    }

    if (type === "heart") {
      const res = await fetch(`${mlUrl}/predict/heart-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `ML service error: ${errText}` },
          { status: res.status }
        );
      }

      const result = await res.json();
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid prediction type. Must be 'diabetes' or 'heart'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Health Risk API] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to communicate with ML microservice" },
      { status: 500 }
    );
  }
}
