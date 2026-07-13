import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignPerformance,
  getConversionFunnel,
  getBenchmarkRanking,
  PeriodType,
} from "@/lib/dashboard/advanced-queries";

export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get("period") as PeriodType) || "30d";

    const [campaigns, funnel, ranking] = await Promise.all([
      getCampaignPerformance(period),
      getConversionFunnel(period),
      getBenchmarkRanking(period),
    ]);

    return NextResponse.json({
      ok: true,
      campaigns,
      funnel,
      ranking,
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message,
        campaigns: [],
        funnel: [],
        ranking: [],
      },
      { status: 500 }
    );
  }
}
