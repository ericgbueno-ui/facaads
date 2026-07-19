import { Decimal } from '@prisma/client/runtime/library';

/**
 * KPI Results - Todos os indicadores calculados
 */

export interface KPIResult {
  value: number;
  label: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  lastValue?: number;
}

export interface ROASResult extends KPIResult {
  // Return on Ad Spend = Revenue / Spend
  // Exemplo: R$ 12.000 / R$ 3.000 = 4x
  label: 'ROAS';
  unit: 'x';
}

export interface ROIResult extends KPIResult {
  // Return on Investment = ((Profit / Spend) * 100) %
  // Exemplo: ((8.625 / 3.000) * 100) = 287.5%
  label: 'ROI';
  unit: '%';
}

export interface CACResult extends KPIResult {
  // Customer Acquisition Cost = Spend / Number of Customers
  // Exemplo: R$ 3.000 / 30 clientes = R$ 100/cliente
  label: 'CAC';
  unit: 'R$';
}

export interface CPAResult extends KPIResult {
  // Cost Per Acquisition = Spend / Acquisitions
  // Similar ao CAC mas pode incluir leads não convertidos
  label: 'CPA';
  unit: 'R$';
}

export interface LTVResult extends KPIResult {
  // Lifetime Value = Avg Revenue per Customer
  // Exemplo: R$ 120.000 / 100 clientes = R$ 1.200/cliente
  label: 'LTV';
  unit: 'R$';
}

export interface MarginResult extends KPIResult {
  // Profit Margin = ((Revenue - Cost) / Revenue) * 100 %
  // Exemplo: ((12.000 - 3.000) / 12.000) * 100 = 75%
  label: 'Margin';
  unit: '%';
}

export interface ConversionRateResult extends KPIResult {
  // Conversion Rate = (Completed Sales / Total Leads) * 100 %
  // Exemplo: (30 / 100) * 100 = 30%
  label: 'Conversion Rate';
  unit: '%';
}

export interface AvgTicketResult extends KPIResult {
  // Average Ticket = Total Revenue / Number of Sales
  // Exemplo: R$ 12.000 / 30 vendas = R$ 400/venda
  label: 'Avg Ticket';
  unit: 'R$';
}

export interface AllKPIsResult {
  roas: ROASResult;
  roi: ROIResult;
  cac: CACResult;
  cpa: CPAResult;
  ltv?: LTVResult;
  margin: MarginResult;
  conversionRate: ConversionRateResult;
  avgTicket: AvgTicketResult;

  // Raw values
  totalRevenue: number;
  totalSpend: number;
  totalProfit: number;
  totalCost: number;
  totalSales: number;
  totalLeads: number;
  completedSales: number;
  lostSales: number;

  // Período
  period: {
    startDate: Date;
    endDate: Date;
    label: string; // "Hoje", "Esta semana", "Este mês", etc
  };

  // Segmentação
  segmentation?: {
    channel?: string;
    campaignId?: string;
    productId?: string;
    attendantId?: string;
  };

  // Timestamp
  calculatedAt: Date;
}

export interface KPIComparison {
  current: AllKPIsResult;
  previous: AllKPIsResult;
  changes: {
    roas: { value: number; percent: number };
    roi: { value: number; percent: number };
    cac: { value: number; percent: number };
    margin: { value: number; percent: number };
    conversionRate: { value: number; percent: number };
  };
}

export interface KPIBySegment {
  segment: string; // campaign_id, product_id, attendant_id, etc
  segmentLabel: string; // nome legível
  metrics: AllKPIsResult;
  rank?: number;
}

export interface KPIByPeriod {
  date: Date;
  label: string; // "18/07/2026", "Semana 29/2026", etc
  metrics: AllKPIsResult;
}

export interface KPICalculationInput {
  companyId: string;
  startDate: Date;
  endDate: Date;
  channel?: string;
  campaignId?: string;
  productId?: string;
  attendantId?: string;
  segmentBy?: 'campaign' | 'product' | 'attendant' | 'channel';
}

export interface KPITrend {
  metric: string; // 'roas', 'roi', 'margin', etc
  currentValue: number;
  previousValue: number;
  change: number; // valor absoluto
  changePercent: number; // valor percentual
  trend: 'up' | 'down' | 'stable';
  insight: string; // descrição em português
}

export interface KPIAnomaly {
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number; // percentual de desvio
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
}

/**
 * DTOs para requests/responses
 */

export interface CalculateKPIRequest {
  companyId: string;
  startDate: Date;
  endDate: Date;
  channel?: string;
  campaignId?: string;
  productId?: string;
  attendantId?: string;
}

export interface CalculateKPIResponse {
  success: boolean;
  data: AllKPIsResult;
  timestamp: Date;
}

export interface CompareKPIRequest {
  companyId: string;
  period1Start: Date;
  period1End: Date;
  period2Start: Date;
  period2End: Date;
}

export interface CompareKPIResponse {
  success: boolean;
  data: KPIComparison;
  timestamp: Date;
}

/**
 * Helper functions
 */

export const calculateTrend = (
  currentValue: number,
  previousValue: number
): 'up' | 'down' | 'stable' => {
  if (currentValue > previousValue * 1.05) return 'up';
  if (currentValue < previousValue * 0.95) return 'down';
  return 'stable';
};

export const formatCurrency = (value: number | Decimal): string => {
  const num = typeof value === 'object' ? value.toNumber() : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatMultiplier = (value: number): string => {
  return `${value.toFixed(2)}x`;
};
