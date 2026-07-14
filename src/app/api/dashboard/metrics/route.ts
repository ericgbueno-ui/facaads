import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Return empty data without database dependency
  return NextResponse.json({
    ok: true,
    campaigns: [],
    funnel: [],
    ranking: [],
  });
}
