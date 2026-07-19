import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';

export class ForecastService {
  constructor(private eventBus: EventBus, private logger: Logger) {}

  async generateForecast(companyId: string, forecastDate: Date, confidence: number = 75) {
    // Buscar dados históricos (últimos 30 dias)
    const thirtyDaysAgo = new Date(forecastDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalSales = await prisma.revenueSale.findMany({
      where: {
        companyId,
        saleDate: { gte: thirtyDaysAgo, lte: forecastDate },
        status: 'VENDA_REALIZADA',
      },
      select: { totalAmount: true, totalSales: true },
    });

    // Calcular média
    const totalRevenue = historicalSales.reduce((sum, s) => sum + s.totalAmount.toNumber(), 0);
    const avgDaily = historicalSales.length > 0 ? totalRevenue / 30 : 0;

    // Projetar para o mês
    const projectedRevenue = avgDaily * 30;
    const projectedSales = historicalSales.length > 0 ? Math.round((historicalSales.length / 30) * 30) : 0;
    const avgProfit = avgDaily * 0.6; // Assumir 60% profit
    const projectedProfit = avgProfit * 30;

    const forecast = await prisma.revenueForecast.create({
      data: {
        companyId,
        forecastDate: new Date(forecastDate.getFullYear(), forecastDate.getMonth(), 1),
        projectedRevenue: new Decimal(projectedRevenue),
        projectedSales,
        projectedProfit: new Decimal(projectedProfit),
        confidence: new Decimal(confidence),
      },
    });

    this.eventBus.emit('forecast:generated', {
      companyId,
      forecastDate: forecast.forecastDate,
      projectedRevenue,
    });

    return forecast;
  }

  async generateMonthlyForecast(companyId: string, startDate: Date) {
    const forecasts = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const forecast = await this.generateForecast(companyId, date);
      forecasts.push(forecast);
    }
    return forecasts;
  }

  async getForecasts(companyId: string, limit: number = 12) {
    return prisma.revenueForecast.findMany({
      where: { companyId },
      orderBy: { forecastDate: 'desc' },
      take: limit,
    });
  }

  async validateForecast(forecastId: string) {
    const forecast = await prisma.revenueForecast.findUnique({ where: { id: forecastId } });
    if (!forecast) return null;

    // Buscar vendas reais do período
    const monthStart = new Date(forecast.forecastDate);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const realSales = await prisma.revenueSale.aggregate({
      where: {
        saleDate: { gte: monthStart, lte: monthEnd },
        status: 'VENDA_REALIZADA',
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const realRevenue = realSales._sum.totalAmount?.toNumber() || 0;
    const error = Math.abs(forecast.projectedRevenue.toNumber() - realRevenue) / forecast.projectedRevenue.toNumber();

    return { forecast, realRevenue, error: error * 100 };
  }
}
