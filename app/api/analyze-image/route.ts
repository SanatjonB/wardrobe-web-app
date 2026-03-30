import { NextResponse } from "next/server";

// Paid path placeholder.
// TODO: gate behind subscription check, then call Claude Vision or OpenAI Vision.
// Expected request body: { imageBase64: string }
// Expected response: { category, color, tags, suggestedName, confidence }
export async function POST() {
  return NextResponse.json(
    { error: "AI analysis requires a premium subscription." },
    { status: 402 }
  );
}
