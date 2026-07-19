import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface KPICalculationInput {
  companyId: string;
  startDate: Date;
  endDate: Date;
  channel?: string;
  campaignId?: string;
  productId?: string;
  attendantId?: string;
}

export interface RevenueAggregation {
  totalRevenue: Decimal;
  totalSales: number;
  totalCost: Decimal;
  totalProfit: Decimal;
  totalLeads: number;
  completedSales: number;
  lostSales: number;
}

export class RevenueRepository {
  /**
   * Agregar receita por período
   */
  async aggregateRevenue(input: KPICalculationInput): Promise<RevenueAggregation> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'VENDA_REALIZADA',
    };

    if (input.channel) {
      // TODO: será adicionado quando houver relação com channel
    }
    if (input.campaignId) {
      where.campaignId = input.campaignId;
    }
    if (input.attendantId) {
      where.attendantId = input.attendantId;
    }

    const sales = await prisma.revenueSale.findMany({ where });

    const totalRevenue = sales.reduce((sum, s) => sum.plus(s.totalAmount), new Decimal(0));
    const totalCost = sales.reduce((sum, s) => sum.plus(s.totalCost || 0), new Decimal(0));
    const totalProfit = totalRevenue.minus(totalCost);

    return {
      totalRevenue,
      totalSales: sales.length,
      totalCost,
      totalProfit,
      totalLeads: 0, // será implementado quando houver relação com leads
      completedSales: sales.length,
      lostSales: 0,
    };
  }

  /**
   * Contar vendas completadas
   */
  async countCompletedSales(input: KPICalculationInput): Promise<number> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'VENDA_REALIZADA',
    };

    if (input.campaignId) where.campaignId = input.campaignId;
    if (input.attendantId) where.attendantId = input.attendantId;

    return prisma.revenueSale.count({ where });
  }

  /**
   * Contar vendas perdidas
   */
  async countLostSales(input: KPICalculationInput): Promise<number> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'VENDA_PERDIDA',
    };

    if (input.campaignId) where.campaignId = input.campaignId;
    if (input.attendantId) where.attendantId = input.attendantId;

    return prisma.revenueSale.count({ where });
  }

  /**
   * Obter valor total de investimento (spend)
   */
  async getTotalInvestment(input: KPICalculationInput): Promise<Decimal> {
    // Isso virá do Campaign.spend quando sincronizado
    // Por enquanto, calcula o advertising cost das vendas
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
    };

    if (input.campaignId) where.campaignId = input.campaignId;

    const result = await prisma.revenueSale.aggregate({
      where,
      _sum: {
        advertisingCost: true,
      },
    });

    return result._sum.advertisingCost || new Decimal(0);
  }

  /**
   * Obter valor total de receita
   */
  async getTotalRevenue(input: KPICalculationInput): Promise<Decimal> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'VENDA_REALIZADA',
    };

    if (input.campaignId) where.campaignId = input.campaignId;
    if (input.attendantId) where.attendantId = input.attendantId;

    const result = await prisma.revenueSale.aggregate({
      where,
      _sum: {
        totalAmount: true,
      },
    });

    return result._sum.totalAmount || new Decimal(0);
  }

  /**
   * Obter valor total de custo
   */
  async getTotalCost(input: KPICalculationInput): Promise<Decimal> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'VENDA_REALIZADA',
    };

    if (input.campaignId) where.campaignId = input.campaignId;
    if (input.attendantId) where.attendantId = input.attendantId;

    const result = await prisma.revenueSale.aggregate({
      where,
      _sum: {
        totalCost: true,
      },
    });

    return result._sum.totalCost || new Decimal(0);
  }

  /**
   * Obter valor total de lucro
   */
  async getTotalProfit(input: KPICalculationInput): Promise<Decimal> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'VENDA_REALIZADA',
    };

    if (input.campaignId) where.campaignId = input.campaignId;
    if (input.attendantId) where.attendantId = input.attendantId;

    const result = await prisma.revenueSale.aggregate({
      where,
      _sum: {
        profitAmount: true,
      },
    });

    return result._sum.profitAmount || new Decimal(0);
  }

  /**
   * Obter ticket médio
   */
  async getAverageTicket(input: KPICalculationInput): Promise<Decimal> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'VENDA_REALIZADA',
    };

    if (input.campaignId) where.campaignId = input.campaignId;
    if (input.attendantId) where.attendantId = input.attendantId;

    const result = await prisma.revenueSale.aggregate({
      where,
      _avg: {
        totalAmount: true,
      },
    });

    return result._avg.totalAmount || new Decimal(0);
  }

  /**
   * Obter vendas agrupadas por período (dia, semana, mês)
   */
  async getSalesByPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month'
  ): Promise<Array<{ date: string; sales: number; revenue: Decimal }>> {
    const sales = await prisma.revenueSale.findMany({
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'VENDA_REALIZADA',
      },
      select: {
        saleDate: true,
        totalAmount: true,
      },
      orderBy: {
        saleDate: 'asc',
      },
    });

    const groupedByPeriod = new Map<string, { sales: number; revenue: Decimal }>();

    sales.forEach((sale) => {
      const date = sale.saleDate;
      let key: string;

      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      const existing = groupedByPeriod.get(key) || { sales: 0, revenue: new Decimal(0) };
      groupedByPeriod.set(key, {
        sales: existing.sales + 1,
        revenue: existing.revenue.plus(sale.totalAmount),
      });
    });

    return Array.from(groupedByPeriod.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  /**
   * Obter top campanhas por receita
   */
  async getTopCampaignsByRevenue(
    companyId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<Array<{ campaignId: string; revenue: Decimal; sales: number }>> {
    const result = await prisma.revenueSale.groupBy({
      by: ['campaignId'],
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'VENDA_REALIZADA',
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: limit,
    });

    return result
      .filter((r) => r.campaignId)
      .map((r) => ({
        campaignId: r.campaignId!,
        revenue: r._sum.totalAmount || new Decimal(0),
        sales: r._count.id,
      }));
  }

  /**
   * Obter top vendedores por receita
   */
  async getTopAttendantsByRevenue(
    companyId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<Array<{ attendantId: string; attendantName: string; revenue: Decimal; sales: number }>> {
    const result = await prisma.revenueSale.groupBy({
      by: ['attendantId', 'attendantName'],
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'VENDA_REALIZADA',
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: limit,
    });

    return result
      .filter((r) => r.attendantId)
      .map((r) => ({
        attendantId: r.attendantId!,
        attendantName: r.attendantName || 'Unknown',
        revenue: r._sum.totalAmount || new Decimal(0),
        sales: r._count.id,
      }));
  }

  /**
   * Obter taxa de conversão (vendas / leads em atendimento ou aguardando)
   */
  async getConversionRate(input: KPICalculationInput): Promise<number> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: input.companyId,
      saleDate: {
        gte: input.startDate,
        lte: input.endDate,
      },
    };

    if (input.campaignId) where.campaignId = input.campaignId;
    if (input.attendantId) where.attendantId = input.attendantId;

    const totalLeads = await prisma.revenueSale.count({ where });
    const completedSales = await prisma.revenueSale.count({
      where: {
        ...where,
        status: 'VENDA_REALIZADA',
      },
    });

    if (totalLeads === 0) return 0;
    return (completedSales / totalLeads) * 100;
  }

  /**
   * Obter valor perdido total
   */
  async getTotalValueLost(input: KPICalculationInput): Promise<Decimal> {
    const result = await prisma.revenueSale.aggregate({
      where: {
        companyId: input.companyId,
        saleDate: {
          gte: input.startDate,
          lte: input.endDate,
        },
        status: 'VENDA_PERDIDA',
      },
      _sum: {
        valueLost: true,
      },
    });

    return result._sum.valueLost || new Decimal(0);
  }
}
