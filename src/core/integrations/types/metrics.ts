/**
 * TIPOS PARA ARMAZENAMENTO E PROCESSAMENTO DE MÉTRICAS
 */

import { ProviderType } from './provider';

export type MetricGranularity = 'daily' | 'weekly' | 'monthly' | 'hourly';

export interface ProviderMetric {
  connectionId: string;
  companyId: string;
  provider: ProviderType;
  externalCampaignId: string;
  campaignId?: string;
  date: Date;
  granularity: MetricGranularity;

  // Dados de campanha
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number; // clicks / impressions
  cpm: number; // spend / (impressions / 1000)
  cpc: number; // spend / clicks

  // Conversões
  conversions: number;
  conversionValue: number;
  conversionRate: number; // conversions / clicks
  cpa: number; // spend / conversions
  roas: number; // conversionValue / spend

  // Leads (se aplicável)
  leads?: number;
  cpl?: number; // cost per lead

  // Dados brutos da API
  raw?: Record<string, any>;

  // Metadados
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export interface MetricSnapshot {
  date: Date;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  leads?: number;
}

export interface MetricHistory {
  campaignId: string;
  provider: ProviderType;
  snapshots: MetricSnapshot[];
  period: 'daily' | 'weekly' | 'monthly';
  totalSpend: number;
  totalConversions: number;
  avgCPA: number;
  avgROAS: number;
}

export interface MetricComparison {
  metric: string;
  previous: number;
  current: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MetricAlert {
  id: string;
  connectionId: string;
  campaignId: string;
  type: 'cpa_spike' | 'ctr_drop' | 'spend_spike' | 'no_conversions' | 'roas_drop' | 'custom';
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered: boolean;
  triggeredAt?: Date;
  dismissedAt?: Date;
}

export interface MetricAggregation {
  provider: ProviderType;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalConversionValue: number;
    avgCPC: number;
    avgCPM: number;
    avgCTR: number;
    avgCPA: number;
    avgROAS: number;
  };
  byAccount?: Record<string, any>;
  byCampaign?: Record<string, any>;
}
