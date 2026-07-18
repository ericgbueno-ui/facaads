import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PipelineSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

const StageSchema = z.object({
  name: z.string().min(1, "Nome do estágio é obrigatório"),
  description: z.string().optional(),
  order: z.number().default(0),
  color: z.string().default("#3b82f6"),
  isFinal: z.boolean().default(false),
  isWon: z.boolean().optional(),
});

type PipelineInput = z.infer<typeof PipelineSchema>;
type StageInput = z.infer<typeof StageSchema>;

/**
 * GET /api/v1/companies/:companyId/pipelines
 * Listar pipelines da empresa
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
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

    const pipelines = await prisma.cRMPipeline.findMany({
      where: { companyId, isActive: true },
      include: {
        stages: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            order: true,
            color: true,
            isFinal: true,
            isWon: true,
            _count: {
              select: { leads: true },
            },
          },
        },
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { ok: true, pipelines },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao listar pipelines:", error);
    return NextResponse.json(
      { error: "Erro ao listar pipelines" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/companies/:companyId/pipelines
 * Criar novo pipeline
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } }
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
    const validated = PipelineSchema.parse(body);

    // Se isDefault=true, desativar outros pipelines padrão
    if (validated.isDefault) {
      await prisma.cRMPipeline.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Criar pipeline
    const pipeline = await prisma.cRMPipeline.create({
      data: {
        companyId,
        ...validated,
        isActive: true,
      },
    });

    // Criar estágios padrão se não existirem
    const defaultStages = [
      { name: "Novo Lead", order: 0, color: "#93c5fd", isWon: null },
      { name: "Contato", order: 1, color: "#60a5fa", isWon: null },
      { name: "Orçamento", order: 2, color: "#3b82f6", isWon: null },
      { name: "Negociação", order: 3, color: "#1e40af", isWon: null },
      { name: "Ganho", order: 4, color: "#10b981", isFinal: true, isWon: true },
      { name: "Perdido", order: 5, color: "#ef4444", isFinal: true, isWon: false },
    ];

    const stages = await Promise.all(
      defaultStages.map((stage) =>
        prisma.cRMStage.create({
          data: {
            pipelineId: pipeline.id,
            ...stage,
          },
        })
      )
    );

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: session.user.id,
        action: "create",
        resource: "Pipeline",
        resourceId: pipeline.id,
        description: `Pipeline criado: ${pipeline.name}`,
      },
    });

    return NextResponse.json(
      { ok: true, pipeline: { ...pipeline, stages } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Erro ao criar pipeline:", error);
    return NextResponse.json(
      { error: "Erro ao criar pipeline" },
      { status: 500 }
    );
  }
}
