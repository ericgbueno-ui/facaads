import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCampaignPerformance, PeriodType } from "@/lib/dashboard/advanced-queries";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const period = (req.nextUrl.searchParams.get("period") as PeriodType) || "30d";
  const includeOffline = req.nextUrl.searchParams.get("include_offline") === "true";

  // Gerar dados da campanha
  const campaigns = await getCampaignPerformance(period);

  // Gerar CSV
  let csv = "Campanha,Canal,Gasto,Impressões,Cliques,CTR (%),CPC,Conversões,CPA,Valor Conversão,ROAS\n";

  for (const c of campaigns) {
    csv += `"${c.name}",${c.channel},${c.spend.toFixed(2)},${c.impressions},${c.clicks},${c.ctr.toFixed(2)},${c.cpc.toFixed(2)},${c.conversions},${c.cpa.toFixed(2)},${c.conversionValue.toFixed(2)},${c.roas.toFixed(2)}\n`;
  }

  if (includeOffline) {
    csv += "\n\n--- Conversões Offline ---\nOrigem,Canal,Campanha,Valor,Data,Status\n";

    const conversions = await prisma.conversionEvent.findMany({
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    });

    for (const conv of conversions) {
      csv += `${conv.sourceType},${conv.channel},"${conv.campaign?.name || 'N/A'}",${conv.amount || 0},${conv.createdAt.toISOString()},${conv.pushBackStatus || 'pending'}\n`;
    }
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="facaads-report-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
