import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Schema para criar/editar empresa
const CompanySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  segment: z.string().optional().default("other"),
  logo: z.string().url().optional(),
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

type CompanyInput = z.infer<typeof CompanySchema>;

/**
 * GET /api/v1/companies
 * Listar empresas do usuário
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const companies = await prisma.companyUser.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        company: {
          select: {
            id: true,
            name: true,
            segment: true,
            logo: true,
            status: true,
            responsibleName: true,
            city: true,
            state: true,
            createdAt: true,
          },
        },
        role: true,
        isOwner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = companies.map((cu) => ({
      ...cu.company,
      userRole: cu.role,
      isOwner: cu.isOwner,
    }));

    return NextResponse.json({ ok: true, companies: formatted }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    return NextResponse.json(
      { error: "Erro ao listar empresas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/companies
 * Criar nova empresa
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const validated = CompanySchema.parse(body);

    // Criar empresa
    const company = await prisma.company.create({
      data: {
        name: validated.name,
        segment: validated.segment,
        logo: validated.logo,
        status: "active",
        responsibleName: validated.responsibleName,
        phone: validated.phone,
        whatsapp: validated.whatsapp,
        city: validated.city,
        state: validated.state,
        website: validated.website,
        instagram: validated.instagram,
        facebook: validated.facebook,
        tiktok: validated.tiktok,
        shopee: validated.shopee,
        googleBusiness: validated.googleBusiness,
        notes: validated.notes,
      },
    });

    // Vincular usuário como owner
    await prisma.companyUser.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        role: "admin",
        isOwner: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        userId: session.user.id,
        action: "create",
        resource: "Company",
        resourceId: company.id,
        description: `Empresa criada: ${company.name}`,
      },
    });

    return NextResponse.json(
      { ok: true, company },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Erro ao criar empresa:", error);
    return NextResponse.json(
      { error: "Erro ao criar empresa" },
      { status: 500 }
    );
  }
}
