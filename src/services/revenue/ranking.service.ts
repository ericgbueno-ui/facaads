import { prisma } from '@/lib/prisma';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';

export class RankingService {
  constructor(private eventBus: EventBus, private logger: Logger) {}

  async rankCampaigns(companyId: string, metric: 'revenue' | 'roas' | 'roi' | 'profit' = 'revenue', limit: number = 10) {
    const indicators = await prisma.revenueIndicator.findMany({
      where: { companyId, campaignId: { not: null } },
      orderBy: { [metric]: 'desc' },
      take: limit,
    });

    return indicators.map((ind, idx) => ({
      rank: idx + 1,
      campaignId: ind.campaignId,
      [metric]: metric === 'revenue' ? ind.totalRevenue.toNumber() : ind[metric],
    }));
  }

  async rankAttendants(companyId: string, metric: 'revenue' | 'conversions' | 'avgTicket' = 'revenue', limit: number = 10) {
    const sales = await prisma.revenueSale.groupBy({
      by: ['attendantId', 'attendantName'],
      where: { companyId, status: 'VENDA_REALIZADA' },
      _sum: { totalAmount: true },
      _count: { id: true },
      _avg: { totalAmount: true },
      orderBy: metric === 'revenue' ? { _sum: { totalAmount: 'desc' } } : { _count: { id: 'desc' } },
      take: limit,
    });

    return sales.map((s, idx) => ({
      rank: idx + 1,
      attendantId: s.attendantId,
      attendantName: s.attendantName,
      revenue: s._sum.totalAmount?.toNumber() || 0,
      sales: s._count.id,
      avgTicket: s._avg.totalAmount?.toNumber() || 0,
    }));
  }

  async rankProducts(companyId: string, metric: 'revenue' | 'quantity' | 'margin' = 'revenue', limit: number = 10) {
    const sales = await prisma.revenueSale.findMany({
      where: { companyId, status: 'VENDA_REALIZADA' },
      select: { products: true, profitMargin: true },
    });

    const productMap = new Map<string, { revenue: number; count: number; margin: number }>();

    sales.forEach((sale) => {
      const products = (sale.products as any[]) || [];
      products.forEach((p: any) => {
        const key = p.id;
        const existing = productMap.get(key) || { revenue: 0, count: 0, margin: 0 };
        productMap.set(key, {
          revenue: existing.revenue + (p.totalPrice || 0),
          count: existing.count + 1,
          margin: sale.profitMargin?.toNumber() || 0,
        });
      });
    });

    const sorted = Array.from(productMap.entries())
      .sort((a, b) => (metric === 'revenue' ? b[1].revenue - a[1].revenue : b[1].count - a[1].count))
      .slice(0, limit);

    return sorted.map(([productId, data], idx) => ({
      rank: idx + 1,
      productId,
      ...data,
    }));
  }

  async rankChannels(companyId: string, metric: 'roas' | 'roi' | 'cac' = 'roas', limit: number = 10) {
    const indicators = await prisma.revenueIndicator.findMany({
      where: { companyId, channel: { not: null } },
      orderBy: { [metric]: 'desc' },
      take: limit,
      distinct: ['channel'],
    });

    return indicators.map((ind, idx) => ({
      rank: idx + 1,
      channel: ind.channel,
      [metric]: ind[metric],
    }));
  }

  async calculateScore(companyId: string, metric: 'revenue' | 'roi' | 'profit' = 'revenue'): Promise<number> {
    const indicators = await prisma.revenueIndicator.findMany({
      where: { companyId },
      orderBy: { [metric]: 'desc' },
      take: 1,
    });

    if (!indicators.length) return 0;
    const max = indicators[0][metric]?.toNumber() || 0;
    const current = indicators[0][metric]?.toNumber() || 0;
    return (current / (max || 1)) * 100;
  }
}
