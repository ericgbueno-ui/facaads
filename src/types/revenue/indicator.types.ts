import { RevenueIndicator } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type IndicatorPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface CreateIndicatorDTO {
  companyId: string;
  period: IndicatorPeriod;
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

export interface IndicatorResponse {
  id: string;
  companyId: string;
  period: IndicatorPeriod;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IndicatorTrend {
  period: IndicatorPeriod;
  data: IndicatorResponse[];
  trend: 'up' | 'down' | 'stable';
  trendPercent?: number;
}

export interface IndicatorComparison {
  current: IndicatorResponse;
  previous: IndicatorResponse;
  changes: {
    roas: { value: number; percent: number };
    roi: { value: number; percent: number };
    totalRevenue: { value: number; percent: number };
    margin: { value: number; percent: number };
  };
}

export interface CacheConfig {
  enabled: boolean;
  ttlMinutes: number; // Time to live em minutos
  strategyPattern: 'daily' | 'weekly' | 'monthly'; // Quando recalcular
}

export interface IndicatorCache {
  companyId: string;
  indicator: IndicatorResponse;
  cachedAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}

export interface DailyCalculationJob {
  companyId: string;
  executedAt: Date;
  indicatorsCreated: number;
  totalTime: number; // milliseconds
  status: 'success' | 'failed';
  error?: string;
}

export const mapIndicatorToResponse = (indicator: RevenueIndicator): IndicatorResponse => {
  return {
    id: indicator.id,
    companyId: indicator.companyId,
    period: indicator.period as IndicatorPeriod,
    date: indicator.date,
    totalInvestment: indicator.totalInvestment.toNumber(),
    totalRevenue: indicator.totalRevenue.toNumber(),
    totalSales: indicator.totalSales,
    avgTicket: indicator.avgTicket.toNumber(),
    totalCost: indicator.totalCost?.toNumber(),
    totalProfit: indicator.totalProfit?.toNumber(),
    profitMargin: indicator.profitMargin?.toNumber(),
    totalLeads: indicator.totalLeads,
    conversionRate: indicator.conversionRate.toNumber(),
    roas: indicator.roas.toNumber(),
    roi: indicator.roi.toNumber(),
    cac: indicator.cac.toNumber(),
    cpa: indicator.cpa.toNumber(),
    ltv: indicator.ltv?.toNumber(),
    channel: indicator.channel ?? undefined,
    campaignId: indicator.campaignId ?? undefined,
    productId: indicator.productId ?? undefined,
    attendantId: indicator.attendantId ?? undefined,
    createdAt: indicator.createdAt,
    updatedAt: indicator.updatedAt,
  };
};

export const calculateTrendPercent = (previousValue: number, currentValue: number): number => {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

export const getTrendDirection = (percent: number): 'up' | 'down' | 'stable' => {
  if (percent > 5) return 'up';
  if (percent < -5) return 'down';
  return 'stable';
};
