import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";
import { z } from "zod";

const updateSaleSchema = z.object({
  amount: z.number().positive().optional(),
  profit: z.number().optional(),
  commission: z.number().optional(),
  source: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
  productName: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  completedAt: z.string().datetime().optional(),
});

/**
 * GET /api/v1/companies/:id/sales/:saleId
 * Obter detalhe de venda
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; saleId: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { companyId, saleId } = await params;
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        company: { select: { id: true, name: true } },
        campaign: { select: { id: true, name: true } },
      },
    });

    if (!sale || sale.companyId !== companyId) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error("Get sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/companies/:id/sales/:saleId
 * Editar venda
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; saleId: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { companyId, saleId } = await params;
    const body = await request.json();
    const data = updateSaleSchema.parse(body);

    // Verificar que venda existe
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale || sale.companyId !== companyId) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    // Atualizar venda
    const updated = await prisma.sale.update({
      where: { id: saleId },
      data: {
        ...data,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      },
      include: {
        campaign: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update sale error:", error);

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

/**
 * DELETE /api/v1/companies/:id/sales/:saleId
 * Deletar venda
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; saleId: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { companyId, saleId } = await params;
    // Verificar que venda existe
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale || sale.companyId !== companyId) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    // Deletar venda
    await prisma.sale.delete({
      where: { id: params.saleId },
    });

    return NextResponse.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    console.error("Delete sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
