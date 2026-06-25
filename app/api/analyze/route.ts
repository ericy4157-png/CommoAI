import { NextResponse } from "next/server";
import { analyzeOilMarket } from "@/lib/openai";
import type { AnalyzeRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    if (
      typeof body.price !== "number" ||
      !body.features ||
      !body.trend
    ) {
      return NextResponse.json(
        { error: "Invalid analyze request payload" },
        { status: 400 },
      );
    }

    const result = await analyzeOilMarket(body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
