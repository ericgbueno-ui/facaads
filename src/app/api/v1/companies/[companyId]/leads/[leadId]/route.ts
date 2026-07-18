import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LeadUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  adSet: z.string().optional(),
  ad: z.string().optional(),
  keyword: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  productInterest: z.string().optional(),
  estimatedValue: z.number().positive().optional(),
  valueInvested: z.number().positive().optional(),
  notes_internal: z.string().optional(),
  tagsJson: z.string().optional(),
  stageId: z.string().optional(),
});

/**
 * GET /api/v1/companies/:companyId/leads/:leadId
 * Obter detalhes do lead
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string; leadId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { companyId, leadId } = params;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        stage: true,
        pipeline: true,
        campaignRef: true,
        conversions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!lead || lead.companyId !== companyId) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, lead }, { status: 200 });
  } catch (error) {
    console.error("Erro ao obter lead:", error);
    return NextResponse.json(
      { error: "Erro ao obter lead" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/companies/:companyId/leads/:leadId
 * Atualizar lead
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { companyId: string; leadId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { companyId, leadId } = params;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Verificar se lead pertence à empresa
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { companyId: true },
    });

    if (!lead || lead.companyId !== companyId) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = LeadUpdateSchema.parse(body);

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: validated,
      include: {
        stage: true,
        pipeline: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: session.user.id,
        action: "update",
        resource: "Lead",
        resourceId: leadId,
        changes: validated,
        description: `Lead atualizado: ${updatedLead.name}`,
      },
    });

    return NextResponse.json({ ok: true, lead: updatedLead }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Erro ao atualizar lead:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar lead" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/companies/:companyId/leads/:leadId
 * Deletar lead
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { companyId: string; leadId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { companyId, leadId } = params;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Verificar se lead pertence à empresa
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { companyId: true, name: true },
    });

    if (!lead || lead.companyId !== companyId) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    await prisma.lead.delete({
      where: { id: leadId },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: session.user.id,
        action: "delete",
        resource: "Lead",
        resourceId: leadId,
        description: `Lead deletado: ${lead.name}`,
      },
    });

    return NextResponse.json(
      { ok: true, message: "Lead deletado" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar lead:", error);
    return NextResponse.json(
      { error: "Erro ao deletar lead" },
      { status: 500 }
    );
  }
}
