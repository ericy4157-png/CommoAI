import { NextResponse } from "next/server";
import { getOilPrices } from "@/lib/oil-data";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getOilPrices();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch oil prices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
