import { LossRepository, CreateLossReasonInput } from '@/repositories/revenue/loss.repository';
import {
  CreateLossReasonDTO,
  LossReasonResponse,
  LossAnalysis,
  LossAnomalyAlert,
  mapLossReasonToResponse,
} from '@/types/revenue/loss.types';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';

export class LossService {
  private repository: LossRepository;
  private eventBus: EventBus;
  private logger: Logger;

  constructor(eventBus: EventBus, logger: Logger) {
    this.repository = new LossRepository();
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Criar motivo de perda
   */
  async createReason(dto: CreateLossReasonDTO): Promise<LossReasonResponse> {
    const input: CreateLossReasonInput = {
      companyId: dto.companyId,
      reason: dto.reason,
      description: dto.description,
      displayOrder: dto.displayOrder,
    };

    const reason = await this.repository.createReason(input);

    this.eventBus.emit('loss:reason_created', {
      companyId: dto.companyId,
      reasonId: reason.id,
      reason: reason.reason,
    });

    return mapLossReasonToResponse(reason);
  }

  /**
   * Obter motivo de perda
   */
  async getReason(reasonId: string, companyId: string): Promise<LossReasonResponse> {
    const reason = await this.repository.findById(reasonId, companyId);

    if (!reason) {
      throw new Error(`Loss reason not found: ${reasonId}`);
    }

    return mapLossReasonToResponse(reason);
  }

  /**
   * Listar motivos ativos
   */
  async getActiveReasons(companyId: string): Promise<LossReasonResponse[]> {
    const reasons = await this.repository.findActive(companyId);
    return reasons.map(mapLossReasonToResponse);
  }

  /**
   * Gerar análise completa de perdas
   */
  async analyzeLosses(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<LossAnalysis> {
    const [lossRate, totalValueLost, lossesByReason, totalLosses] = await Promise.all([
      this.repository.getLossRate(companyId, startDate, endDate),
      this.repository.getTotalValueLost(companyId, startDate, endDate),
      this.repository.getLossesByPeriod(companyId, startDate, endDate),
      this.repository.countByReason(companyId, ''),
    ]);

    const byReasonStats = lossesByReason.map((loss) => ({
      reason: loss.reason,
      description: loss.reason,
      count: loss.count,
      totalValueLost: loss.total.toNumber(),
      percent: (loss.count / Math.max(1, totalLosses)) * 100,
    }));

    return {
      period: { startDate, endDate },
      summary: {
        totalLosses,
        totalValueLost: totalValueLost.toNumber(),
        lossRate,
      },
      byReason: byReasonStats,
      topReason: byReasonStats[0] || null,
    };
  }

  /**
   * Detectar anomalias em perdas
   */
  async detectAnomalies(
    companyId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    previousPeriodStart: Date,
    previousPeriodEnd: Date
  ): Promise<LossAnomalyAlert[]> {
    const alerts: LossAnomalyAlert[] = [];

    const [currentAnalysis, previousAnalysis] = await Promise.all([
      this.analyzeLosses(companyId, currentPeriodStart, currentPeriodEnd),
      this.analyzeLosses(companyId, previousPeriodStart, previousPeriodEnd),
    ]);

    // Anomalia 1: Taxa de perda muito alta
    if (currentAnalysis.summary.lossRate > 50) {
      alerts.push({
        type: 'high_loss_rate',
        severity: currentAnalysis.summary.lossRate > 70 ? 'critical' : 'high',
        message: `Taxa de perda de ${currentAnalysis.summary.lossRate.toFixed(1)}% está muito alta`,
        recommendation: 'Revisar qualidade do atendimento e processo de negociação',
        data: {
          currentValue: currentAnalysis.summary.lossRate,
          expectedValue: 20,
          deviation: currentAnalysis.summary.lossRate - 20,
        },
      });
    }

    // Anomalia 2: Aumento na taxa de perda
    const lossRateIncrease = currentAnalysis.summary.lossRate - previousAnalysis.summary.lossRate;
    if (lossRateIncrease > 15) {
      alerts.push({
        type: 'value_spike',
        severity: 'high',
        message: `Taxa de perda aumentou ${lossRateIncrease.toFixed(1)}% comparado ao período anterior`,
        recommendation: 'Investigar mudanças no atendimento ou competição',
        data: {
          currentValue: currentAnalysis.summary.lossRate,
          expectedValue: previousAnalysis.summary.lossRate,
          deviation: lossRateIncrease,
        },
      });
    }

    // Anomalia 3: Motivo de perda incomum
    if (
      currentAnalysis.topReason &&
      previousAnalysis.topReason &&
      currentAnalysis.topReason.reason !== previousAnalysis.topReason.reason
    ) {
      alerts.push({
        type: 'unusual_reason',
        severity: 'medium',
        message: `Principal motivo de perda mudou de "${previousAnalysis.topReason.reason}" para "${currentAnalysis.topReason.reason}"`,
        recommendation: 'Analisar causa da mudança de motivo de perda',
        data: {
          currentValue: currentAnalysis.topReason.count,
        },
      });
    }

    return alerts;
  }

  /**
   * Obter perdas por motivo
   */
  async getLossesByReason(companyId: string, startDate: Date, endDate: Date) {
    return this.repository.getLossesByPeriod(companyId, startDate, endDate);
  }

  /**
   * Obter taxa de perda
   */
  async getLossRate(companyId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.repository.getLossRate(companyId, startDate, endDate);
  }

  /**
   * Obter valor total perdido
   */
  async getTotalValueLost(companyId: string, startDate: Date, endDate: Date): Promise<number> {
    const value = await this.repository.getTotalValueLost(companyId, startDate, endDate);
    return value.toNumber();
  }

  /**
   * Obter top motivos de perda
   */
  async getTopReasons(companyId: string, limit: number = 5): Promise<LossReasonResponse[]> {
    const reasons = await this.repository.getTopReasons(companyId, limit);
    return reasons.map(mapLossReasonToResponse);
  }
}
