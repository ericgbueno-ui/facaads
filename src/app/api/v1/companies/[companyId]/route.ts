import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CompanyUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  segment: z.string().optional(),
  logo: z.string().url().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  responsibleName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  shopee: z.string().optional(),
  googleBusiness: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/v1/companies/:id
 * Obter detalhes da empresa
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

    const { companyId } = await params;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            role: true,
            isOwner: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            leads: true,
            sales: true,
            adAccounts: true,
            integrations: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, company }, { status: 200 });
  } catch (error) {
    console.error("Erro ao obter empresa:", error);
    return NextResponse.json(
      { error: "Erro ao obter empresa" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/companies/:id
 * Editar empresa (apenas admin)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { companyId } = await params;

    // Validar acesso e role
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    if (validation.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = CompanyUpdateSchema.parse(body);

    const company = await prisma.company.update({
      where: { id: companyId },
      data: validated,
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: session.user.id,
        action: "update",
        resource: "Company",
        resourceId: companyId,
        changes: validated,
        description: `Empresa atualizada: ${company.name}`,
      },
    });

    return NextResponse.json({ ok: true, company }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Erro ao editar empresa:", error);
    return NextResponse.json(
      { error: "Erro ao editar empresa" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/companies/:id
 * Deletar empresa (apenas owner)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { companyId } = await params;

    // Validar acesso e role
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    if (!validation.isOwner) {
      return NextResponse.json(
        { error: "Apenas o proprietário pode deletar" },
        { status: 403 }
      );
    }

    const company = await prisma.company.delete({
      where: { id: companyId },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: session.user.id,
        action: "delete",
        resource: "Company",
        resourceId: companyId,
        description: `Empresa deletada: ${company.name}`,
      },
    });

    return NextResponse.json({ ok: true, message: "Empresa deletada" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar empresa:", error);
    return NextResponse.json(
      { error: "Erro ao deletar empresa" },
      { status: 500 }
    );
  }
}
