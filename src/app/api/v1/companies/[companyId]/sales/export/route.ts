import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";
import { generateCSV, generateHTML } from "@/lib/reports/generate";

/**
 * GET /api/v1/companies/:id/sales/export
 * Exportar relatório em diferentes formatos (csv, pdf, excel)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { companyId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv"; // csv, pdf, excel
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Buscar empresa
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Construir filtro
    const where: any = { companyId: params.id };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Buscar vendas
    const sales = await prisma.sale.findMany({
      where,
      select: {
        id: true,
        amount: true,
        profit: true,
        commission: true,
        productName: true,
        quantity: true,
        paymentStatus: true,
        source: true,
        notes: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular totais e métricas
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
    const totalProfit = sales.reduce((sum, s) => sum + (s.profit ? parseFloat(s.profit.toString()) : 0), 0);
    const totalCommission = sales.reduce((sum, s) => sum + (s.commission ? parseFloat(s.commission.toString()) : 0), 0);
    const totalQuantity = sales.reduce((sum, s) => sum + (s.quantity || 1), 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const conversionRate = totalSales > 0 ? ((sales.filter(s => s.paymentStatus === "completed").length) / totalSales) * 100 : 0;
    const profitPerSale = totalSales > 0 ? totalProfit / totalSales : 0;

    // Preparar dados para relatório
    const reportData = {
      companyName: company.name,
      period: { startDate, endDate },
      totals: {
        sales: totalSales,
        revenue: totalRevenue,
        profit: totalProfit,
        commission: totalCommission,
        quantity: totalQuantity,
      },
      metrics: {
        averageTicket,
        profitMargin,
        conversionRate,
        profitPerSale,
      },
      sales: sales as any,
    };

    // Gerar arquivo baseado no formato
    if (format === "csv") {
      const csv = generateCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      const html = generateHTML(reportData);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="relatorio_vendas_${new Date().toISOString().split('T')[0]}.html"`,
        },
      });
    }

    if (format === "excel") {
      // Para Excel real, usar biblioteca exceljs
      // Por enquanto, retornar CSV (será convertido em Excel via biblioteca no frontend)
      const csv = generateCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "application/vnd.ms-excel; charset=utf-8",
          "Content-Disposition": `attachment; filename="relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      error: "Invalid format. Use: csv, pdf, or excel",
    }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
