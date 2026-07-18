import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * GET /api/v1/companies/:id/sales/report
 * Gerar relatório de vendas com KPIs
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtro de data
    const where: any = { companyId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Buscar todas as vendas para cálculos
    const sales = await prisma.sale.findMany({
      where,
      select: {
        id: true,
        amount: true,
        profit: true,
        commission: true,
        paymentStatus: true,
        source: true,
        quantity: true,
        createdAt: true,
      },
    });

    // Calcular KPIs
    const totalSales = sales.length;
    const completedSales = sales.filter(s => s.paymentStatus === "completed").length;
    const pendingSales = sales.filter(s => s.paymentStatus === "pending").length;

    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
    const totalProfit = sales.reduce((sum, s) => sum + (s.profit ? parseFloat(s.profit.toString()) : 0), 0);
    const totalCommission = sales.reduce((sum, s) => sum + (s.commission ? parseFloat(s.commission.toString()) : 0), 0);
    const totalQuantity = sales.reduce((sum, s) => sum + (s.quantity || 1), 0);

    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const conversionRate = totalSales > 0 ? (completedSales / totalSales) * 100 : 0;

    // Agrupar por fonte
    const bySources = sales.reduce((acc, s) => {
      const source = s.source || "manual";
      if (!acc[source]) {
        acc[source] = { count: 0, revenue: 0, profit: 0 };
      }
      acc[source].count++;
      acc[source].revenue += parseFloat(s.amount.toString());
      acc[source].profit += s.profit ? parseFloat(s.profit.toString()) : 0;
      return acc;
    }, {} as Record<string, any>);

    // Agrupar por status de pagamento
    const byStatus = sales.reduce((acc, s) => {
      const status = s.paymentStatus || "pending";
      if (!acc[status]) {
        acc[status] = { count: 0, revenue: 0 };
      }
      acc[status].count++;
      acc[status].revenue += parseFloat(s.amount.toString());
      return acc;
    }, {} as Record<string, any>);

    // Agrupar por dia (últimos 30 dias)
    const last30Days = sales.filter(s => {
      const daysAgo = (Date.now() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const byDay = last30Days.reduce((acc, s) => {
      const day = s.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { count: 0, revenue: 0 };
      }
      acc[day].count++;
      acc[day].revenue += parseFloat(s.amount.toString());
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      summary: {
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        totals: {
          sales: totalSales,
          revenue: totalRevenue,
          profit: totalProfit,
          commission: totalCommission,
          quantity: totalQuantity,
        },
        status: {
          completed: completedSales,
          pending: pendingSales,
          failed: sales.filter(s => s.paymentStatus === "failed").length,
          cancelled: sales.filter(s => s.paymentStatus === "cancelled").length,
        },
        metrics: {
          averageTicket: parseFloat(averageTicket.toFixed(2)),
          profitMargin: parseFloat(profitMargin.toFixed(2)),
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          profitPerSale: totalSales > 0 ? parseFloat((totalProfit / totalSales).toFixed(2)) : 0,
        },
        bySources,
        byStatus,
        byDay,
      },
      rawData: sales,
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
