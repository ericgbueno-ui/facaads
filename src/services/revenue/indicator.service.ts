import { IndicatorRepository, CreateIndicatorInput } from '@/repositories/revenue/indicator.repository';
import { RevenueService } from './revenue.service';
import {
  CreateIndicatorDTO,
  IndicatorResponse,
  IndicatorTrend,
  IndicatorComparison,
  IndicatorCache,
  DailyCalculationJob,
  IndicatorPeriod,
  mapIndicatorToResponse,
  calculateTrendPercent,
  getTrendDirection,
} from '@/types/revenue/indicator.types';
import { KPICalculationInput } from '@/repositories/revenue/revenue.repository';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';

export class IndicatorService {
  private repository: IndicatorRepository;
  private revenueService: RevenueService;
  private eventBus: EventBus;
  private logger: Logger;
  private cache: Map<string, IndicatorCache> = new Map();

  constructor(revenueService: RevenueService, eventBus: EventBus, logger: Logger) {
    this.repository = new IndicatorRepository();
    this.revenueService = revenueService;
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Armazenar indicador (salvar no banco)
   */
  async storeIndicator(dto: CreateIndicatorDTO): Promise<IndicatorResponse> {
    // Verificar se já existe
    const exists = await this.repository.exists(
      dto.companyId,
      dto.period,
      dto.date,
      dto.channel,
      dto.campaignId,
      dto.productId,
      dto.attendantId
    );

    if (exists) {
      this.logger.warn('Indicator already exists, skipping', {
        companyId: dto.companyId,
        period: dto.period,
        date: dto.date,
      });
      return this.getIndicator(
        dto.companyId,
        dto.period,
        dto.date,
        dto.campaignId
      );
    }

    const input: CreateIndicatorInput = {
      companyId: dto.companyId,
      period: dto.period,
      date: dto.date,
      totalInvestment: dto.totalInvestment,
      totalRevenue: dto.totalRevenue,
      totalSales: dto.totalSales,
      avgTicket: dto.avgTicket,
      totalCost: dto.totalCost,
      totalProfit: dto.totalProfit,
      profitMargin: dto.profitMargin,
      totalLeads: dto.totalLeads,
      conversionRate: dto.conversionRate,
      roas: dto.roas,
      roi: dto.roi,
      cac: dto.cac,
      cpa: dto.cpa,
      ltv: dto.ltv,
      channel: dto.channel,
      campaignId: dto.campaignId,
      productId: dto.productId,
      attendantId: dto.attendantId,
    };

    const indicator = await this.repository.create(input);

    this.eventBus.emit('indicator:stored', {
      companyId: dto.companyId,
      period: dto.period,
      roas: dto.roas,
      roi: dto.roi,
    });

    return mapIndicatorToResponse(indicator);
  }

  /**
   * Armazenar múltiplos indicadores (bulk)
   */
  async bulkStoreIndicators(dtos: CreateIndicatorDTO[]): Promise<number> {
    const inputs = dtos.map((dto) => ({
      companyId: dto.companyId,
      period: dto.period,
      date: dto.date,
      totalInvestment: dto.totalInvestment,
      totalRevenue: dto.totalRevenue,
      totalSales: dto.totalSales,
      avgTicket: dto.avgTicket,
      totalCost: dto.totalCost,
      totalProfit: dto.totalProfit,
      profitMargin: dto.profitMargin,
      totalLeads: dto.totalLeads,
      conversionRate: dto.conversionRate,
      roas: dto.roas,
      roi: dto.roi,
      cac: dto.cac,
      cpa: dto.cpa,
      ltv: dto.ltv,
      channel: dto.channel,
      campaignId: dto.campaignId,
      productId: dto.productId,
      attendantId: dto.attendantId,
    }));

    const result = await this.repository.createMany(inputs);

    this.logger.info('Bulk indicators stored', {
      count: result.count,
      companyId: dtos[0]?.companyId,
    });

    return result.count;
  }

  /**
   * Obter indicador do banco (com cache)
   */
  async getIndicator(
    companyId: string,
    period: IndicatorPeriod,
    date: Date,
    campaignId?: string
  ): Promise<IndicatorResponse> {
    const cacheKey = this.getCacheKey(companyId, period, date, campaignId);

    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && !cached.isExpired) {
      this.logger.debug('Cache hit', { cacheKey });
      return cached.indicator;
    }

    // Cache miss, buscar do banco
    const indicator = await this.repository.findFirst({
      companyId,
      period,
      startDate: date,
      endDate: date,
      campaignId,
      take: 1,
    });

    if (!indicator || indicator.length === 0) {
      throw new Error(`Indicator not found for ${period} on ${date.toISOString()}`);
    }

    const response = mapIndicatorToResponse(indicator[0]);

    // Guardar em cache
    this.setCache(cacheKey, response);

    return response;
  }

  /**
   * Obter indicador de hoje
   */
  async getTodayIndicator(companyId: string): Promise<IndicatorResponse | null> {
    const indicator = await this.repository.getTodayIndicator(companyId);

    if (!indicator) {
      return null;
    }

    return mapIndicatorToResponse(indicator);
  }

  /**
   * Obter indicador do mês atual
   */
  async getCurrentMonthIndicator(companyId: string): Promise<IndicatorResponse | null> {
    const indicator = await this.repository.getCurrentMonthIndicator(companyId);

    if (!indicator) {
      return null;
    }

    return mapIndicatorToResponse(indicator);
  }

  /**
   * Obter últimos N indicadores
   */
  async getRecent(
    companyId: string,
    period: IndicatorPeriod,
    limit: number = 30
  ): Promise<IndicatorResponse[]> {
    const indicators = await this.repository.findMany({
      companyId,
      period,
      take: limit,
    });

    return indicators.map(mapIndicatorToResponse);
  }

  /**
   * Calcular e armazenar indicadores automaticamente (DAILY JOB)
   * Esse job roda diariamente à noite e calcula KPIs de todos os períodos
   */
  async calculateAndCacheDailyIndicators(
    companyId: string,
    jobDate: Date = new Date()
  ): Promise<DailyCalculationJob> {
    const startTime = Date.now();
    const startOfDay = new Date(jobDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(jobDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const indicatorsToStore: CreateIndicatorDTO[] = [];

      // 1. Calcular para hoje (day)
      const todayKpis = await this.revenueService.calculateAllKPIs({
        companyId,
        startDate: startOfDay,
        endDate: endOfDay,
      });

      indicatorsToStore.push({
        companyId,
        period: 'day',
        date: jobDate,
        totalInvestment: todayKpis.totalSpend,
        totalRevenue: todayKpis.totalRevenue,
        totalSales: todayKpis.completedSales,
        avgTicket: todayKpis.avgTicket.value,
        totalCost: todayKpis.totalCost,
        totalProfit: todayKpis.totalProfit,
        profitMargin: todayKpis.margin.value,
        totalLeads: todayKpis.totalLeads,
        conversionRate: todayKpis.conversionRate.value,
        roas: todayKpis.roas.value,
        roi: todayKpis.roi.value,
        cac: todayKpis.cac.value,
        cpa: todayKpis.cpa.value,
        ltv: todayKpis.ltv?.value,
      });

      // 2. Calcular para semana atual
      const weekStart = new Date(jobDate);
      weekStart.setDate(jobDate.getDate() - jobDate.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekKpis = await this.revenueService.calculateAllKPIs({
        companyId,
        startDate: weekStart,
        endDate: endOfDay,
      });

      indicatorsToStore.push({
        companyId,
        period: 'week',
        date: weekStart,
        totalInvestment: weekKpis.totalSpend,
        totalRevenue: weekKpis.totalRevenue,
        totalSales: weekKpis.completedSales,
        avgTicket: weekKpis.avgTicket.value,
        totalCost: weekKpis.totalCost,
        totalProfit: weekKpis.totalProfit,
        profitMargin: weekKpis.margin.value,
        totalLeads: weekKpis.totalLeads,
        conversionRate: weekKpis.conversionRate.value,
        roas: weekKpis.roas.value,
        roi: weekKpis.roi.value,
        cac: weekKpis.cac.value,
        cpa: weekKpis.cpa.value,
        ltv: weekKpis.ltv?.value,
      });

      // 3. Calcular para mês atual
      const monthStart = new Date(jobDate.getFullYear(), jobDate.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthKpis = await this.revenueService.calculateAllKPIs({
        companyId,
        startDate: monthStart,
        endDate: endOfDay,
      });

      indicatorsToStore.push({
        companyId,
        period: 'month',
        date: monthStart,
        totalInvestment: monthKpis.totalSpend,
        totalRevenue: monthKpis.totalRevenue,
        totalSales: monthKpis.completedSales,
        avgTicket: monthKpis.avgTicket.value,
        totalCost: monthKpis.totalCost,
        totalProfit: monthKpis.totalProfit,
        profitMargin: monthKpis.margin.value,
        totalLeads: monthKpis.totalLeads,
        conversionRate: monthKpis.conversionRate.value,
        roas: monthKpis.roas.value,
        roi: monthKpis.roi.value,
        cac: monthKpis.cac.value,
        cpa: monthKpis.cpa.value,
        ltv: monthKpis.ltv?.value,
      });

      // Armazenar todos os indicadores
      await this.bulkStoreIndicators(indicatorsToStore);

      const duration = Date.now() - startTime;

      this.logger.info('Daily indicators calculated and cached', {
        companyId,
        count: indicatorsToStore.length,
        duration,
      });

      this.eventBus.emit('indicator:calculated', {
        companyId,
        jobDate,
        periodsCalculated: indicatorsToStore.length,
      });

      return {
        companyId,
        executedAt: new Date(),
        indicatorsCreated: indicatorsToStore.length,
        totalTime: duration,
        status: 'success',
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Daily indicator calculation failed', {
        companyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      });

      return {
        companyId,
        executedAt: new Date(),
        indicatorsCreated: 0,
        totalTime: duration,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Detectar tendências ao longo do tempo
   */
  async detectTrends(
    companyId: string,
    period: IndicatorPeriod,
    days: number = 30
  ): Promise<IndicatorTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const indicators = await this.repository.findMany({
      companyId,
      period,
      startDate,
      endDate,
      take: 1000,
    });

    if (indicators.length < 2) {
      return [];
    }

    const responses = indicators.map(mapIndicatorToResponse);

    // Calcular tendência de ROAS
    const roasValues = responses.map((r) => r.roas);
    const roasTrend = this.calculateTrend(roasValues);

    // Calcular tendência de ROI
    const roiValues = responses.map((r) => r.roi);
    const roiTrend = this.calculateTrend(roiValues);

    // Calcular tendência de Revenue
    const revenueValues = responses.map((r) => r.totalRevenue);
    const revenueTrend = this.calculateTrend(revenueValues);

    return [
      {
        period,
        data: responses,
        trend: roasTrend.trend,
        trendPercent: roasTrend.percent,
      },
    ];
  }

  /**
   * Invalidar cache (limpar tudo)
   */
  invalidateCache(companyId?: string): void {
    if (!companyId) {
      this.cache.clear();
      this.logger.info('All cache invalidated');
    } else {
      // Limpar apenas de uma empresa
      const keys = Array.from(this.cache.keys()).filter((k) => k.startsWith(companyId));
      keys.forEach((k) => this.cache.delete(k));
      this.logger.info('Cache invalidated for company', { companyId });
    }
  }

  /**
   * Limpeza automática de indicadores antigos (cleanup job)
   */
  async cleanupOldIndicators(companyId: string, daysToKeep: number = 365): Promise<number> {
    const result = await this.repository.deleteOlderThan(companyId, daysToKeep);

    this.logger.info('Old indicators cleaned up', {
      companyId,
      daysToKeep,
      deleted: result.count,
    });

    return result.count;
  }

  /**
   * Helpers privados
   */

  private getCacheKey(
    companyId: string,
    period: IndicatorPeriod,
    date: Date,
    campaignId?: string
  ): string {
    const dateStr = date.toISOString().split('T')[0];
    return `${companyId}:${period}:${dateStr}:${campaignId || 'all'}`;
  }

  private setCache(key: string, indicator: IndicatorResponse): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h TTL

    this.cache.set(key, {
      companyId: indicator.companyId,
      indicator,
      cachedAt: now,
      expiresAt,
      isExpired: false,
    });
  }

  private calculateTrend(values: number[]): { trend: 'up' | 'down' | 'stable'; percent: number } {
    if (values.length < 2) {
      return { trend: 'stable', percent: 0 };
    }

    const oldest = values[0];
    const newest = values[values.length - 1];
    const percent = calculateTrendPercent(oldest, newest);
    const trend = getTrendDirection(percent);

    return { trend, percent };
  }
}
