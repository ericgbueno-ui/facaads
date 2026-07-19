import { Decimal } from '@prisma/client/runtime/library';
import {
  RevenueRepository,
  KPICalculationInput,
} from '@/repositories/revenue/revenue.repository';
import {
  AllKPIsResult,
  KPIComparison,
  ROASResult,
  ROIResult,
  CACResult,
  CPAResult,
  LTVResult,
  MarginResult,
  ConversionRateResult,
  AvgTicketResult,
  KPITrend,
  KPIAnomaly,
  calculateTrend,
} from '@/types/revenue/kpi.types';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';

export class RevenueService {
  private repository: RevenueRepository;
  private eventBus: EventBus;
  private logger: Logger;

  constructor(eventBus: EventBus, logger: Logger) {
    this.repository = new RevenueRepository();
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Calcular ROAS (Return on Ad Spend)
   * Fórmula: Receita / Gasto com anúncios
   * Exemplo: R$ 12.000 / R$ 3.000 = 4x
   */
  async calculateROAS(input: KPICalculationInput): Promise<ROASResult> {
    const revenue = await this.repository.getTotalRevenue(input);
    const spend = await this.repository.getTotalInvestment(input);

    if (spend.equals(0)) {
      return {
        value: 0,
        label: 'ROAS',
        unit: 'x',
      };
    }

    const roas = revenue.dividedBy(spend).toNumber();

    return {
      value: Number(roas.toFixed(2)),
      label: 'ROAS',
      unit: 'x',
      trend: roas > 3 ? 'up' : roas > 2 ? 'stable' : 'down',
    };
  }

  /**
   * Calcular ROI (Return on Investment)
   * Fórmula: ((Lucro / Investimento) * 100) %
   * Exemplo: ((8.625 / 3.000) * 100) = 287.5%
   */
  async calculateROI(input: KPICalculationInput): Promise<ROIResult> {
    const profit = await this.repository.getTotalProfit(input);
    const spend = await this.repository.getTotalInvestment(input);

    if (spend.equals(0)) {
      return {
        value: 0,
        label: 'ROI',
        unit: '%',
      };
    }

    const roi = profit.dividedBy(spend).times(100).toNumber();

    return {
      value: Number(roi.toFixed(2)),
      label: 'ROI',
      unit: '%',
      trend: roi > 200 ? 'up' : roi > 100 ? 'stable' : 'down',
    };
  }

  /**
   * Calcular CAC (Customer Acquisition Cost)
   * Fórmula: Gasto / Número de clientes adquiridos
   * Exemplo: R$ 3.000 / 30 clientes = R$ 100
   */
  async calculateCAC(input: KPICalculationInput): Promise<CACResult> {
    const spend = await this.repository.getTotalInvestment(input);
    const customers = await this.repository.countCompletedSales(input);

    if (customers === 0) {
      return {
        value: 0,
        label: 'CAC',
        unit: 'R$',
      };
    }

    const cac = spend.dividedBy(customers).toNumber();

    return {
      value: Number(cac.toFixed(2)),
      label: 'CAC',
      unit: 'R$',
    };
  }

  /**
   * Calcular CPA (Cost Per Acquisition)
   * Similar ao CAC mas pode incluir leads não convertidos
   */
  async calculateCPA(input: KPICalculationInput): Promise<CPAResult> {
    const spend = await this.repository.getTotalInvestment(input);
    const totalLeads = await this.repository.countCompletedSales(input);

    if (totalLeads === 0) {
      return {
        value: 0,
        label: 'CPA',
        unit: 'R$',
      };
    }

    const cpa = spend.dividedBy(totalLeads).toNumber();

    return {
      value: Number(cpa.toFixed(2)),
      label: 'CPA',
      unit: 'R$',
    };
  }

  /**
   * Calcular LTV (Lifetime Value)
   * Fórmula: Receita média por cliente
   * Exemplo: R$ 120.000 / 100 clientes = R$ 1.200
   */
  async calculateLTV(input: KPICalculationInput): Promise<LTVResult> {
    const revenue = await this.repository.getTotalRevenue(input);
    const customers = await this.repository.countCompletedSales(input);

    if (customers === 0) {
      return {
        value: 0,
        label: 'LTV',
        unit: 'R$',
      };
    }

    const ltv = revenue.dividedBy(customers).toNumber();

    return {
      value: Number(ltv.toFixed(2)),
      label: 'LTV',
      unit: 'R$',
    };
  }

  /**
   * Calcular Margem de Lucro
   * Fórmula: ((Receita - Custo) / Receita) * 100 %
   * Exemplo: ((12.000 - 3.000) / 12.000) * 100 = 75%
   */
  async calculateMargin(input: KPICalculationInput): Promise<MarginResult> {
    const revenue = await this.repository.getTotalRevenue(input);
    const cost = await this.repository.getTotalCost(input);

    if (revenue.equals(0)) {
      return {
        value: 0,
        label: 'Margin',
        unit: '%',
      };
    }

    const margin = revenue
      .minus(cost)
      .dividedBy(revenue)
      .times(100)
      .toNumber();

    return {
      value: Number(margin.toFixed(2)),
      label: 'Margin',
      unit: '%',
      trend: margin > 50 ? 'up' : margin > 30 ? 'stable' : 'down',
    };
  }

  /**
   * Calcular Taxa de Conversão
   * Fórmula: (Vendas Completas / Total de Leads) * 100 %
   * Exemplo: (30 / 100) * 100 = 30%
   */
  async calculateConversionRate(input: KPICalculationInput): Promise<ConversionRateResult> {
    const conversionRate = await this.repository.getConversionRate(input);

    return {
      value: Number(conversionRate.toFixed(2)),
      label: 'Conversion Rate',
      unit: '%',
      trend: conversionRate > 20 ? 'up' : conversionRate > 10 ? 'stable' : 'down',
    };
  }

  /**
   * Calcular Ticket Médio
   * Fórmula: Receita Total / Número de Vendas
   * Exemplo: R$ 12.000 / 30 vendas = R$ 400
   */
  async calculateAvgTicket(input: KPICalculationInput): Promise<AvgTicketResult> {
    const avgTicket = await this.repository.getAverageTicket(input);

    return {
      value: Number(avgTicket.toFixed(2)),
      label: 'Avg Ticket',
      unit: 'R$',
    };
  }

  /**
   * Calcular TODOS os KPIs de uma vez
   */
  async calculateAllKPIs(input: KPICalculationInput): Promise<AllKPIsResult> {
    const startTime = Date.now();

    // Parallelizar cálculos
    const [roas, roi, cac, cpa, ltv, margin, conversionRate, avgTicket] = await Promise.all([
      this.calculateROAS(input),
      this.calculateROI(input),
      this.calculateCAC(input),
      this.calculateCPA(input),
      this.calculateLTV(input),
      this.calculateMargin(input),
      this.calculateConversionRate(input),
      this.calculateAvgTicket(input),
    ]);

    // Obter valores brutos
    const totalRevenue = await this.repository.getTotalRevenue(input);
    const totalSpend = await this.repository.getTotalInvestment(input);
    const totalProfit = await this.repository.getTotalProfit(input);
    const totalCost = await this.repository.getTotalCost(input);
    const totalSales = await this.repository.countCompletedSales(input);
    const lostSales = await this.repository.countLostSales(input);

    const result: AllKPIsResult = {
      roas,
      roi,
      cac,
      cpa,
      ltv,
      margin,
      conversionRate,
      avgTicket,

      totalRevenue: totalRevenue.toNumber(),
      totalSpend: totalSpend.toNumber(),
      totalProfit: totalProfit.toNumber(),
      totalCost: totalCost.toNumber(),
      totalSales,
      totalLeads: totalSales + lostSales,
      completedSales: totalSales,
      lostSales,

      period: {
        startDate: input.startDate,
        endDate: input.endDate,
        label: this.formatPeriodLabel(input.startDate, input.endDate),
      },

      segmentation: input.campaignId || input.productId || input.attendantId ? {
        campaignId: input.campaignId,
        productId: input.productId,
        attendantId: input.attendantId,
        channel: input.channel,
      } : undefined,

      calculatedAt: new Date(),
    };

    const duration = Date.now() - startTime;

    this.logger.info('KPIs calculated', {
      companyId: input.companyId,
      roas: roas.value,
      roi: roi.value,
      margin: margin.value,
      duration,
    });

    this.eventBus.emit('kpi:calculated', {
      companyId: input.companyId,
      metrics: result,
    });

    return result;
  }

  /**
   * Comparar KPIs entre dois períodos
   */
  async compareKPIs(
    input1: KPICalculationInput,
    input2: KPICalculationInput
  ): Promise<KPIComparison> {
    const [current, previous] = await Promise.all([
      this.calculateAllKPIs(input1),
      this.calculateAllKPIs(input2),
    ]);

    return {
      current,
      previous,
      changes: {
        roas: {
          value: current.roas.value - previous.roas.value,
          percent: this.calculatePercent(previous.roas.value, current.roas.value),
        },
        roi: {
          value: current.roi.value - previous.roi.value,
          percent: this.calculatePercent(previous.roi.value, current.roi.value),
        },
        cac: {
          value: current.cac.value - previous.cac.value,
          percent: this.calculatePercent(previous.cac.value, current.cac.value),
        },
        margin: {
          value: current.margin.value - previous.margin.value,
          percent: this.calculatePercent(previous.margin.value, current.margin.value),
        },
        conversionRate: {
          value: current.conversionRate.value - previous.conversionRate.value,
          percent: this.calculatePercent(
            previous.conversionRate.value,
            current.conversionRate.value
          ),
        },
      },
    };
  }

  /**
   * Detectar tendências e anomalias
   */
  async detectTrends(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<KPITrend[]> {
    // Dividir período em duas metades para comparar
    const midDate = new Date(startDate);
    midDate.setDate(midDate.getDate() + Math.floor((endDate.getTime() - startDate.getTime()) / (2 * 24 * 60 * 60 * 1000)));

    const input1: KPICalculationInput = {
      companyId,
      startDate: midDate,
      endDate,
    };

    const input2: KPICalculationInput = {
      companyId,
      startDate,
      endDate: midDate,
    };

    const [current, previous] = await Promise.all([
      this.calculateAllKPIs(input1),
      this.calculateAllKPIs(input2),
    ]);

    const trends: KPITrend[] = [
      {
        metric: 'roas',
        currentValue: current.roas.value,
        previousValue: previous.roas.value,
        change: current.roas.value - previous.roas.value,
        changePercent: this.calculatePercent(previous.roas.value, current.roas.value),
        trend: calculateTrend(current.roas.value, previous.roas.value),
        insight: `ROAS ${current.roas.value > previous.roas.value ? 'aumentou' : 'diminuiu'} de ${previous.roas.value.toFixed(2)}x para ${current.roas.value.toFixed(2)}x`,
      },
      {
        metric: 'roi',
        currentValue: current.roi.value,
        previousValue: previous.roi.value,
        change: current.roi.value - previous.roi.value,
        changePercent: this.calculatePercent(previous.roi.value, current.roi.value),
        trend: calculateTrend(current.roi.value, previous.roi.value),
        insight: `ROI ${current.roi.value > previous.roi.value ? 'aumentou' : 'diminuiu'} ${Math.abs(this.calculatePercent(previous.roi.value, current.roi.value)).toFixed(1)}%`,
      },
      {
        metric: 'margin',
        currentValue: current.margin.value,
        previousValue: previous.margin.value,
        change: current.margin.value - previous.margin.value,
        changePercent: this.calculatePercent(previous.margin.value, current.margin.value),
        trend: calculateTrend(current.margin.value, previous.margin.value),
        insight: `Margem ${current.margin.value > previous.margin.value ? 'aumentou' : 'diminuiu'} para ${current.margin.value.toFixed(1)}%`,
      },
    ];

    return trends;
  }

  /**
   * Detectar anomalias
   */
  async detectAnomalies(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<KPIAnomaly[]> {
    const kpis = await this.calculateAllKPIs({
      companyId,
      startDate,
      endDate,
    });

    const anomalies: KPIAnomaly[] = [];

    // Anomalia 1: ROAS muito baixo
    if (kpis.roas.value < 1) {
      anomalies.push({
        metric: 'roas',
        expectedValue: 2.5,
        actualValue: kpis.roas.value,
        deviation: ((2.5 - kpis.roas.value) / 2.5) * 100,
        severity: 'critical',
        message: `ROAS de ${kpis.roas.value.toFixed(2)}x está muito abaixo do esperado`,
        recommendation: 'Revisar direcionamento da campanha ou qualidade dos anúncios',
      });
    }

    // Anomalia 2: Conversão muito baixa
    if (kpis.conversionRate.value < 5) {
      anomalies.push({
        metric: 'conversionRate',
        expectedValue: 15,
        actualValue: kpis.conversionRate.value,
        deviation: ((15 - kpis.conversionRate.value) / 15) * 100,
        severity: 'high',
        message: `Taxa de conversão de ${kpis.conversionRate.value.toFixed(2)}% está abaixo do esperado`,
        recommendation: 'Otimizar funil de vendas ou qualificar melhor os leads',
      });
    }

    // Anomalia 3: Margem muito baixa
    if (kpis.margin.value < 20) {
      anomalies.push({
        metric: 'margin',
        expectedValue: 40,
        actualValue: kpis.margin.value,
        deviation: ((40 - kpis.margin.value) / 40) * 100,
        severity: 'medium',
        message: `Margem de lucro de ${kpis.margin.value.toFixed(2)}% está baixa`,
        recommendation: 'Revisar custos operacionais ou repricing de produtos',
      });
    }

    return anomalies;
  }

  /**
   * Helpers privados
   */

  private calculatePercent(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  private formatPeriodLabel(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString('pt-BR');
    const end = endDate.toLocaleDateString('pt-BR');
    return `${start} até ${end}`;
  }
}
