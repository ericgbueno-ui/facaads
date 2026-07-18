import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";
import { z } from "zod";

const createSaleSchema = z.object({
  amount: z.number().positive("Valor deve ser maior que 0"),
  profit: z.number().optional(),
  commission: z.number().optional(),
  source: z.enum(["manual", "whatsapp", "website", "instagram", "email"]).optional(),
  campaignId: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "debit_card", "pix", "boleto", "transfer", "cash", "other"]).optional(),
  paymentStatus: z.enum(["pending", "completed", "failed", "cancelled"]).default("pending"),
  productName: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  completedAt: z.string().datetime().optional(),
});

const updateSaleSchema = createSaleSchema.partial();

/**
 * GET /api/v1/companies/:id/sales
 * Listar vendas com filtros e paginação
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Construir filtro
    const where: any = { companyId: params.id };
    if (status) where.paymentStatus = status;
    if (source) where.source = source;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Buscar vendas
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          campaign: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/companies/:id/sales
 * Criar venda
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSaleSchema.parse(body);

    // Verificar que company existe
    const company = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Criar venda
    const sale = await prisma.sale.create({
      data: {
        ...data,
        companyId: params.id,
        amount: data.amount,
        profit: data.profit,
        commission: data.commission,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
      },
      include: {
        campaign: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: sale,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create sale error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
