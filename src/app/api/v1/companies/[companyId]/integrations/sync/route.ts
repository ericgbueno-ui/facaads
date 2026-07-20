import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * POST /api/v1/companies/:companyId/integrations/sync
 * Sincronizar dados de integrações
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  try {
    const { companyId } = await params;
    const { integrationId } = await request.json();

    const integration = await prisma.companyIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    if (integration.companyId !== companyId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(
      {
        success: false,
        code: "INTEGRATION_SYNC_NOT_CONFIGURED",
        error: `Sincronização real não configurada para ${integration.type}.`,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Sync integration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
