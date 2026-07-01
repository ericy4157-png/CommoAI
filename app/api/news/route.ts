import { NextResponse } from "next/server";
import { getMarketNews } from "@/lib/news";

export const revalidate = 1800;

export async function GET() {
  try {
    const data = await getMarketNews();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch market news";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
