import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const companyId = request.nextUrl.searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId é obrigatório" }, { status: 400 });
  const access = await validateCompanyAccess(session.user.id, companyId);
  if (!access.valid) return NextResponse.json({ error: access.error }, { status: 403 });

  const integrations = await prisma.companyIntegration.findMany({
    where: { companyId },
    select: { id: true, type: true, name: true, status: true, connectedAt: true, lastSyncAt: true, lastErrorAt: true, lastError: true, testedAt: true },
  });
  return NextResponse.json({ ok: true, companyId, integrations, timestamp: new Date().toISOString() });
}
