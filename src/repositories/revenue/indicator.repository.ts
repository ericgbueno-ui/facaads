import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { RevenueIndicator } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateIndicatorInput {
  companyId: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  date: Date;
  totalInvestment: number;
  totalRevenue: number;
  totalSales: number;
  avgTicket: number;
  totalCost?: number;
  totalProfit?: number;
  profitMargin?: number;
  totalLeads: number;
  conversionRate: number;
  roas: number;
  roi: number;
  cac: number;
  cpa: number;
  ltv?: number;
  channel?: string;
  campaignId?: string;
  productId?: string;
  attendantId?: string;
}

export interface IndicatorFilterInput {
  companyId: string;
  period?: string;
  startDate?: Date;
  endDate?: Date;
  channel?: string;
  campaignId?: string;
  productId?: string;
  attendantId?: string;
  skip?: number;
  take?: number;
}

export class IndicatorRepository {
  /**
   * Criar novo indicador
   */
  async create(input: CreateIndicatorInput): Promise<RevenueIndicator> {
    return prisma.revenueIndicator.create({
      data: {
        companyId: input.companyId,
        period: input.period,
        date: input.date,
        totalInvestment: new Prisma.Decimal(input.totalInvestment),
        totalRevenue: new Prisma.Decimal(input.totalRevenue),
        totalSales: input.totalSales,
        avgTicket: new Prisma.Decimal(input.avgTicket),
        totalCost: input.totalCost ? new Prisma.Decimal(input.totalCost) : null,
        totalProfit: input.totalProfit ? new Prisma.Decimal(input.totalProfit) : null,
        profitMargin: input.profitMargin ? new Prisma.Decimal(input.profitMargin) : null,
        totalLeads: input.totalLeads,
        conversionRate: new Prisma.Decimal(input.conversionRate),
        roas: new Prisma.Decimal(input.roas),
        roi: new Prisma.Decimal(input.roi),
        cac: new Prisma.Decimal(input.cac),
        cpa: new Prisma.Decimal(input.cpa),
        ltv: input.ltv ? new Prisma.Decimal(input.ltv) : null,
        channel: input.channel,
        campaignId: input.campaignId,
        productId: input.productId,
        attendantId: input.attendantId,
      },
    });
  }

  /**
   * Criar múltiplos indicadores de uma vez
   */
  async createMany(inputs: CreateIndicatorInput[]): Promise<Prisma.BatchPayload> {
    const data = inputs.map((input) => ({
      companyId: input.companyId,
      period: input.period,
      date: input.date,
      totalInvestment: new Prisma.Decimal(input.totalInvestment),
      totalRevenue: new Prisma.Decimal(input.totalRevenue),
      totalSales: input.totalSales,
      avgTicket: new Prisma.Decimal(input.avgTicket),
      totalCost: input.totalCost ? new Prisma.Decimal(input.totalCost) : null,
      totalProfit: input.totalProfit ? new Prisma.Decimal(input.totalProfit) : null,
      profitMargin: input.profitMargin ? new Prisma.Decimal(input.profitMargin) : null,
      totalLeads: input.totalLeads,
      conversionRate: new Prisma.Decimal(input.conversionRate),
      roas: new Prisma.Decimal(input.roas),
      roi: new Prisma.Decimal(input.roi),
      cac: new Prisma.Decimal(input.cac),
      cpa: new Prisma.Decimal(input.cpa),
      ltv: input.ltv ? new Prisma.Decimal(input.ltv) : null,
      channel: input.channel,
      campaignId: input.campaignId,
      productId: input.productId,
      attendantId: input.attendantId,
    }));

    return prisma.revenueIndicator.createMany({ data });
  }

  /**
   * Obter indicador por ID
   */
  async findById(id: string, companyId: string): Promise<RevenueIndicator | null> {
    return prisma.revenueIndicator.findFirst({
      where: { id, companyId },
    });
  }

  /**
   * Listar indicadores com filtros
   */
  async findMany(filter: IndicatorFilterInput): Promise<RevenueIndicator[]> {
    const where: Prisma.RevenueIndicatorWhereInput = {
      companyId: filter.companyId,
    };

    if (filter.period) {
      where.period = filter.period;
    }

    if (filter.channel) {
      where.channel = filter.channel;
    }

    if (filter.campaignId) {
      where.campaignId = filter.campaignId;
    }

    if (filter.productId) {
      where.productId = filter.productId;
    }

    if (filter.attendantId) {
      where.attendantId = filter.attendantId;
    }

    if (filter.startDate && filter.endDate) {
      where.date = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }

    return prisma.revenueIndicator.findMany({
      where,
      skip: filter.skip || 0,
      take: filter.take || 100,
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Obter indicador do dia atual
   */
  async getTodayIndicator(companyId: string): Promise<RevenueIndicator | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.revenueIndicator.findFirst({
      where: {
        companyId,
        period: 'day',
        date: today,
      },
    });
  }

  /**
   * Obter indicador do mês atual
   */
  async getCurrentMonthIndicator(companyId: string): Promise<RevenueIndicator | null> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return prisma.revenueIndicator.findFirst({
      where: {
        companyId,
        period: 'month',
        date: monthStart,
      },
    });
  }

  /**
   * Obter último indicador por período
   */
  async getLatestByPeriod(
    companyId: string,
    period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): Promise<RevenueIndicator | null> {
    return prisma.revenueIndicator.findFirst({
      where: {
        companyId,
        period,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Atualizar indicador
   */
  async update(id: string, data: Partial<CreateIndicatorInput>): Promise<RevenueIndicator> {
    const updateData: Prisma.RevenueIndicatorUpdateInput = {};

    if (data.totalInvestment) updateData.totalInvestment = new Prisma.Decimal(data.totalInvestment);
    if (data.totalRevenue) updateData.totalRevenue = new Prisma.Decimal(data.totalRevenue);
    if (data.totalSales) updateData.totalSales = data.totalSales;
    if (data.avgTicket) updateData.avgTicket = new Prisma.Decimal(data.avgTicket);
    if (data.totalCost) updateData.totalCost = new Prisma.Decimal(data.totalCost);
    if (data.totalProfit) updateData.totalProfit = new Prisma.Decimal(data.totalProfit);
    if (data.profitMargin) updateData.profitMargin = new Prisma.Decimal(data.profitMargin);
    if (data.roas) updateData.roas = new Prisma.Decimal(data.roas);
    if (data.roi) updateData.roi = new Prisma.Decimal(data.roi);
    if (data.cac) updateData.cac = new Prisma.Decimal(data.cac);
    if (data.cpa) updateData.cpa = new Prisma.Decimal(data.cpa);

    return prisma.revenueIndicator.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deletar indicador
   */
  async delete(id: string, companyId: string): Promise<void> {
    await prisma.revenueIndicator.deleteMany({
      where: { id, companyId },
    });
  }

  /**
   * Obter indicadores por período e segmentação
   */
  async getBySegment(
    companyId: string,
    startDate: Date,
    endDate: Date,
    segmentBy: 'campaign' | 'product' | 'attendant' | 'channel'
  ): Promise<RevenueIndicator[]> {
    const where: Prisma.RevenueIndicatorWhereInput = {
      companyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Garantir que o segmento não é nulo
    if (segmentBy === 'campaign') {
      where.campaignId = { not: null };
    } else if (segmentBy === 'product') {
      where.productId = { not: null };
    } else if (segmentBy === 'attendant') {
      where.attendantId = { not: null };
    } else if (segmentBy === 'channel') {
      where.channel = { not: null };
    }

    return prisma.revenueIndicator.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Obter top items por métrica
   */
  async getTopByMetric(
    companyId: string,
    metric: 'roas' | 'roi' | 'totalRevenue',
    segmentBy: 'campaign' | 'product' | 'attendant',
    limit: number = 10
  ): Promise<RevenueIndicator[]> {
    const where: Prisma.RevenueIndicatorWhereInput = {
      companyId,
    };

    if (segmentBy === 'campaign') {
      where.campaignId = { not: null };
    } else if (segmentBy === 'product') {
      where.productId = { not: null };
    } else if (segmentBy === 'attendant') {
      where.attendantId = { not: null };
    }

    const orderBy: Prisma.RevenueIndicatorOrderByWithRelationInput = {};
    if (metric === 'roas') {
      orderBy.roas = 'desc';
    } else if (metric === 'roi') {
      orderBy.roi = 'desc';
    } else if (metric === 'totalRevenue') {
      orderBy.totalRevenue = 'desc';
    }

    return prisma.revenueIndicator.findMany({
      where,
      orderBy,
      take: limit,
    });
  }

  /**
   * Verificar se indicador já existe (para evitar duplicatas)
   */
  async exists(
    companyId: string,
    period: string,
    date: Date,
    channel?: string,
    campaignId?: string,
    productId?: string,
    attendantId?: string
  ): Promise<boolean> {
    const indicator = await prisma.revenueIndicator.findFirst({
      where: {
        companyId,
        period: period as any,
        date,
        channel,
        campaignId,
        productId,
        attendantId,
      },
    });

    return !!indicator;
  }

  /**
   * Deletar indicadores antigos (cleanup)
   */
  async deleteOlderThan(companyId: string, daysOld: number): Promise<Prisma.BatchPayload> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.revenueIndicator.deleteMany({
      where: {
        companyId,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
