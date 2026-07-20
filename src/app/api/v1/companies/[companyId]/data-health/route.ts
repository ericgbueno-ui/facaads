import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
  }

  const { companyId } = await params;
  const access = await validateCompanyAccess(session.user.id, companyId);
  if (!access.valid) {
    return NextResponse.json({ ok: false, error: access.error }, { status: 403 });
  }

  const [integrations, leads, sales, snapshots, conversions] = await Promise.all([
    prisma.companyIntegration.findMany({
      where: { companyId },
      select: { id: true, type: true, name: true, status: true, lastSyncAt: true, lastErrorAt: true, lastError: true, testedAt: true },
      orderBy: { type: "asc" },
    }),
    prisma.lead.groupBy({ by: ["dataOrigin"], where: { companyId }, _count: true }),
    prisma.sale.groupBy({ by: ["dataOrigin"], where: { companyId }, _count: true }),
    prisma.metricSnapshot.groupBy({
      by: ["dataOrigin"],
      where: { campaign: { companyId } },
      _count: true,
      _max: { sourcedAt: true },
    }),
    prisma.conversionEvent.groupBy({ by: ["dataOrigin"], where: { companyId }, _count: true }),
  ]);

  const demoRecords = [...leads, ...sales, ...snapshots, ...conversions]
    .filter((item) => item.dataOrigin === "DEMO")
    .reduce((total, item) => total + item._count, 0);
  const failedIntegrations = integrations.filter((item) => item.lastError || item.status === "error").length;
  const connectedIntegrations = integrations.filter((item) => item.status === "connected").length;

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    summary: {
      trustworthy: demoRecords === 0 && failedIntegrations === 0,
      demoRecords,
      connectedIntegrations,
      failedIntegrations,
    },
    origins: { leads, sales, snapshots, conversions },
    integrations,
  });
}
