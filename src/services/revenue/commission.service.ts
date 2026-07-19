import { CommissionRepository, CreateCommissionInput } from '@/repositories/revenue/commission.repository';
import {
  CreateCommissionDTO,
  CommissionResponse,
  CommissionSummary,
  AttendantCommissionStats,
  CommissionReport,
  CommissionPaymentRequest,
  CommissionPaymentResult,
  CommissionStatus,
  mapCommissionToResponse,
  calculateCommission,
} from '@/types/revenue/commission.types';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { Decimal } from '@prisma/client/runtime/library';

export class CommissionService {
  private repository: CommissionRepository;
  private eventBus: EventBus;
  private logger: Logger;

  constructor(eventBus: EventBus, logger: Logger) {
    this.repository = new CommissionRepository();
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Criar comissão
   */
  async createCommission(dto: CreateCommissionDTO): Promise<CommissionResponse> {
    const input: CreateCommissionInput = {
      companyId: dto.companyId,
      saleId: dto.saleId,
      attendantId: dto.attendantId,
      attendantName: dto.attendantName,
      commissionType: dto.commissionType,
      commissionAmount: dto.commissionAmount,
      status: 'pending',
    };

    const commission = await this.repository.create(input);

    this.eventBus.emit('commission:created', {
      commissionId: commission.id,
      companyId: commission.companyId,
      attendantId: commission.attendantId,
      amount: commission.commissionAmount.toNumber(),
    });

    return mapCommissionToResponse(commission);
  }

  /**
   * Obter comissão por ID
   */
  async getCommission(commissionId: string, companyId: string): Promise<CommissionResponse> {
    const commission = await this.repository.findById(commissionId, companyId);

    if (!commission) {
      throw new Error(`Commission not found: ${commissionId}`);
    }

    return mapCommissionToResponse(commission);
  }

  /**
   * Marcar como calculada
   */
  async markAsCalculated(commissionId: string, companyId: string): Promise<CommissionResponse> {
    const commission = await this.repository.findById(commissionId, companyId);

    if (!commission) {
      throw new Error(`Commission not found: ${commissionId}`);
    }

    const updated = await this.repository.update(commissionId, {
      status: 'calculated',
    });

    this.eventBus.emit('commission:calculated', {
      commissionId: updated.id,
      companyId: updated.companyId,
      amount: updated.commissionAmount.toNumber(),
    });

    return mapCommissionToResponse(updated);
  }

  /**
   * Marcar como paga
   */
  async markAsPaid(commissionId: string, companyId: string, paidAt?: Date): Promise<CommissionResponse> {
    const commission = await this.repository.findById(commissionId, companyId);

    if (!commission) {
      throw new Error(`Commission not found: ${commissionId}`);
    }

    const updated = await this.repository.update(commissionId, {
      status: 'paid',
      paidAt: paidAt || new Date(),
    });

    this.eventBus.emit('commission:paid', {
      commissionId: updated.id,
      companyId: updated.companyId,
      attendantId: updated.attendantId,
      amount: updated.commissionAmount.toNumber(),
      paidAt: updated.paidAt,
    });

    return mapCommissionToResponse(updated);
  }

  /**
   * Obter comissões pendentes (não calculadas)
   */
  async getPending(companyId: string): Promise<CommissionResponse[]> {
    const commissions = await this.repository.getPending(companyId);
    return commissions.map(mapCommissionToResponse);
  }

  /**
   * Obter comissões de um vendedor
   */
  async getByAttendant(
    companyId: string,
    attendantId: string,
    status?: CommissionStatus
  ): Promise<CommissionResponse[]> {
    const commissions = await this.repository.getByAttendant(companyId, attendantId, status);
    return commissions.map(mapCommissionToResponse);
  }

  /**
   * Obter suma de comissões de um vendedor
   */
  async getSumByAttendant(
    companyId: string,
    attendantId: string,
    status?: CommissionStatus
  ): Promise<number> {
    const sum = await this.repository.sumByAttendant(companyId, attendantId, status);
    return sum.toNumber();
  }

  /**
   * Obter suma de comissões por período
   */
  async getSumByPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
    status?: CommissionStatus
  ): Promise<number> {
    const sum = await this.repository.sumByPeriod(companyId, startDate, endDate, status);
    return sum.toNumber();
  }

  /**
   * Obter resumo de comissões
   */
  async getSummary(companyId: string, startDate?: Date, endDate?: Date): Promise<CommissionSummary> {
    let pending = 0;
    let calculated = 0;
    let paid = 0;

    if (startDate && endDate) {
      pending = (await this.repository.sumByPeriod(companyId, startDate, endDate, 'pending')).toNumber();
      calculated = (await this.repository.sumByPeriod(companyId, startDate, endDate, 'calculated')).toNumber();
      paid = (await this.repository.sumByPeriod(companyId, startDate, endDate, 'paid')).toNumber();
    } else {
      pending = (await this.repository.sumByAttendant(companyId, '', 'pending')).toNumber();
      calculated = (await this.repository.sumByAttendant(companyId, '', 'calculated')).toNumber();
      paid = (await this.repository.sumByAttendant(companyId, '', 'paid')).toNumber();
    }

    return {
      total: pending + calculated + paid,
      pending,
      calculated,
      paid,
      count: 0, // TODO: implementar count
    };
  }

  /**
   * Obter top vendedores por comissão
   */
  async getTopEarners(companyId: string, limit: number = 10): Promise<AttendantCommissionStats[]> {
    const topEarners = await this.repository.getTopAttendantsByCommission(companyId, limit);

    return topEarners.map((earner) => ({
      attendantId: earner.attendantId,
      attendantName: earner.attendantName,
      totalEarned: earner.total.toNumber(),
      totalPending: 0, // TODO: calcular separadamente
      totalCalculated: 0,
      totalPaid: 0,
      commissionCount: earner.count,
      avgCommission: earner.total.toNumber() / earner.count,
    }));
  }

  /**
   * Gerar relatório de comissões
   */
  async generateReport(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CommissionReport> {
    const summary = await this.getSummary(companyId, startDate, endDate);
    const topEarners = await this.getTopEarners(companyId);

    const byAttendant: AttendantCommissionStats[] = topEarners.map((earner, index) => ({
      ...earner,
      totalPending: 0, // TODO: calcular por período
      totalCalculated: 0,
      totalPaid: 0,
    }));

    return {
      period: { startDate, endDate },
      summary,
      byAttendant,
      topEarners: topEarners.map((earner, index) => ({
        attendantId: earner.attendantId,
        attendantName: earner.attendantName,
        totalEarned: earner.totalEarned,
        rank: index + 1,
      })),
    };
  }

  /**
   * Processar pagamento de comissões
   */
  async processPayment(request: CommissionPaymentRequest): Promise<CommissionPaymentResult> {
    try {
      const pending = await this.repository.getPending(request.companyId);

      if (pending.length === 0) {
        return {
          success: true,
          commissionsPaid: 0,
          totalAmountPaid: 0,
          paymentDate: request.paymentDate,
          message: 'Nenhuma comissão pendente para pagar',
        };
      }

      // Filtrar por attendants se especificado
      let commissionsToPay = pending;
      if (request.attendantIds && request.attendantIds.length > 0) {
        commissionsToPay = pending.filter((c) =>
          request.attendantIds?.includes(c.attendantId || '')
        );
      }

      const commissionIds = commissionsToPay.map((c) => c.id);
      const totalAmount = commissionsToPay.reduce((sum, c) => sum + c.commissionAmount.toNumber(), 0);

      // Marcar como pagas
      await this.repository.markAsPaid(commissionIds, request.paymentDate);

      this.eventBus.emit('commission:batch_paid', {
        companyId: request.companyId,
        count: commissionIds.length,
        totalAmount,
        paymentDate: request.paymentDate,
      });

      this.logger.info('Commissions paid', {
        companyId: request.companyId,
        count: commissionIds.length,
        totalAmount,
      });

      return {
        success: true,
        commissionsPaid: commissionIds.length,
        totalAmountPaid: totalAmount,
        paymentDate: request.paymentDate,
        message: `${commissionIds.length} comissões pagas no total de R$ ${totalAmount.toFixed(2)}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';

      this.logger.error('Commission payment failed', {
        companyId: request.companyId,
        error: message,
      });

      return {
        success: false,
        commissionsPaid: 0,
        totalAmountPaid: 0,
        paymentDate: request.paymentDate,
        message: `Erro ao processar pagamento: ${message}`,
      };
    }
  }

  /**
   * Calcular comissão de uma venda
   */
  calculateCommissionAmount(
    saleAmount: number,
    commissionType: 'fixed' | 'percentage',
    rate?: number
  ): number {
    if (commissionType === 'percentage') {
      if (!rate) throw new Error('Commission rate required');
      return (saleAmount * rate) / 100;
    } else {
      if (!rate) throw new Error('Fixed amount required');
      return rate;
    }
  }

  /**
   * Obter comissão de uma venda específica
   */
  async getCommissionBySaleId(saleId: string, companyId: string): Promise<CommissionResponse | null> {
    const commission = await this.repository.findBySaleId(saleId, companyId);

    if (!commission) {
      return null;
    }

    return mapCommissionToResponse(commission);
  }
}
