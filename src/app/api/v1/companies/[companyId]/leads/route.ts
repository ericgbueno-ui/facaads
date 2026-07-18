import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LeadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  source: z.string().default("organic"),
  campaign: z.string().optional(),
  adSet: z.string().optional(),
  ad: z.string().optional(),
  keyword: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("BR"),
  productInterest: z.string().optional(),
  estimatedValue: z.number().positive().optional(),
  valueInvested: z.number().positive().optional(),
  notes_internal: z.string().optional(),
  tagsJson: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
});

type LeadInput = z.infer<typeof LeadSchema>;

/**
 * GET /api/v1/companies/:companyId/leads
 * Listar leads da empresa
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const companyId = params.companyId;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Parâmetros de filtro
    const searchParams = new URL(req.url).searchParams;
    const source = searchParams.get("source");
    const campaign = searchParams.get("campaign");
    const stageId = searchParams.get("stageId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = { companyId };
    if (source) where.source = source;
    if (campaign) where.campaign = campaign;
    if (stageId) where.stageId = stageId;

    // Buscar leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          stage: true,
          pipeline: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        leads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao listar leads:", error);
    return NextResponse.json(
      { error: "Erro ao listar leads" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/companies/:companyId/leads
 * Criar novo lead
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const companyId = params.companyId;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    const body = await req.json();
    const validated = LeadSchema.parse(body);

    // Obter pipeline padrão se não especificado
    let pipelineId = validated.pipelineId;
    let stageId = validated.stageId;

    if (!pipelineId) {
      const defaultPipeline = await prisma.cRMPipeline.findFirst({
        where: { companyId, isDefault: true },
        select: { id: true },
      });

      if (!defaultPipeline) {
        return NextResponse.json(
          { error: "Nenhum pipeline padrão configurado" },
          { status: 400 }
        );
      }

      pipelineId = defaultPipeline.id;
    }

    if (!stageId) {
      const firstStage = await prisma.cRMStage.findFirst({
        where: { pipelineId },
        orderBy: { order: "asc" },
        select: { id: true },
      });

      if (!firstStage) {
        return NextResponse.json(
          { error: "Pipeline sem estágios" },
          { status: 400 }
        );
      }

      stageId = firstStage.id;
    }

    // Criar lead
    const lead = await prisma.lead.create({
      data: {
        ...validated,
        companyId,
        pipelineId,
        stageId,
      },
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
        action: "create",
        resource: "Lead",
        resourceId: lead.id,
        description: `Lead criado: ${lead.name}`,
      },
    });

    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Erro ao criar lead:", error);
    return NextResponse.json(
      { error: "Erro ao criar lead" },
      { status: 500 }
    );
  }
}
