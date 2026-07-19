import { SaleRepository, CreateSaleInput, UpdateSaleInput, SaleFilterInput } from '@/repositories/revenue/sale.repository';
import {
  CreateSaleDTO,
  UpdateSaleDTO,
  CompleteSaleDTO,
  LoseSaleDTO,
  SaleResponse,
  SaleListResponse,
  SaleMetrics,
  mapSaleToResponse,
  SALE_STATUSES,
} from '@/types/revenue/sale.types';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { Decimal } from '@prisma/client/runtime/library';

export class SaleService {
  private repository: SaleRepository;
  private eventBus: EventBus;
  private logger: Logger;

  constructor(eventBus: EventBus, logger: Logger) {
    this.repository = new SaleRepository();
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Criar nova venda
   */
  async createSale(dto: CreateSaleDTO): Promise<SaleResponse> {
    const input: CreateSaleInput = {
      companyId: dto.companyId,
      clientName: dto.clientName,
      clientPhone: dto.clientPhone,
      clientEmail: dto.clientEmail,
      totalAmount: dto.totalAmount,
      products: JSON.parse(JSON.stringify(dto.products)),
      attendantId: dto.attendantId,
      attendantName: dto.attendantName,
      leadId: dto.leadId,
      campaignId: dto.campaignId,
      saleSourceId: dto.saleSourceId,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
      customFields: dto.customFields ? JSON.parse(JSON.stringify(dto.customFields)) : null,
    };

    const sale = await this.repository.create(input);

    this.eventBus.emit('sale:created', {
      saleId: sale.id,
      companyId: sale.companyId,
      clientName: sale.clientName,
      totalAmount: sale.totalAmount.toNumber(),
      status: sale.status,
    });

    this.logger.info('Sale created', {
      saleId: sale.id,
      companyId: sale.companyId,
      totalAmount: sale.totalAmount.toNumber(),
    });

    return mapSaleToResponse(sale);
  }

  /**
   * Obter venda por ID
   */
  async getSale(saleId: string, companyId: string): Promise<SaleResponse> {
    const sale = await this.repository.findById(saleId, companyId);

    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    return mapSaleToResponse(sale);
  }

  /**
   * Listar vendas com filtros
   */
  async listSales(
    companyId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      attendantId?: string;
      campaignId?: string;
      saleSourceId?: string;
      paymentStatus?: string;
      page?: number;
      pageSize?: number;
    }
  ): Promise<SaleListResponse> {
    const pageSize = filters?.pageSize || 50;
    const page = filters?.page || 1;
    const skip = (page - 1) * pageSize;

    const filterInput: SaleFilterInput = {
      companyId,
      status: filters?.status,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      attendantId: filters?.attendantId,
      campaignId: filters?.campaignId,
      saleSourceId: filters?.saleSourceId,
      paymentStatus: filters?.paymentStatus,
      skip,
      take: pageSize,
    };

    const [sales, total] = await Promise.all([
      this.repository.findMany(filterInput),
      this.repository.count({ companyId, status: filters?.status }),
    ]);

    return {
      items: sales.map(mapSaleToResponse),
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total,
    };
  }

  /**
   * Atualizar venda
   */
  async updateSale(saleId: string, companyId: string, dto: UpdateSaleDTO): Promise<SaleResponse> {
    const sale = await this.repository.findById(saleId, companyId);

    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    const updateInput: UpdateSaleInput = {
      status: dto.status,
      clientName: dto.clientName,
      clientPhone: dto.clientPhone,
      clientEmail: dto.clientEmail,
      totalAmount: dto.totalAmount,
      products: dto.products ? JSON.parse(JSON.stringify(dto.products)) : undefined,
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentStatus,
      paymentDate: dto.paymentDate,
      totalCost: dto.totalCost,
      advertisingCost: dto.advertisingCost,
      otherCosts: dto.otherCosts,
      notes: dto.notes,
      customFields: dto.customFields ? JSON.parse(JSON.stringify(dto.customFields)) : undefined,
    };

    const updated = await this.repository.update(saleId, updateInput);

    this.eventBus.emit('sale:updated', {
      saleId: updated.id,
      companyId: updated.companyId,
      changes: updateInput,
    });

    return mapSaleToResponse(updated);
  }

  /**
   * Deletar venda
   */
  async deleteSale(saleId: string, companyId: string): Promise<void> {
    const sale = await this.repository.findById(saleId, companyId);

    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    await this.repository.delete(saleId, companyId);

    this.eventBus.emit('sale:deleted', {
      saleId,
      companyId,
    });

    this.logger.info('Sale deleted', { saleId, companyId });
  }

  /**
   * Marcar venda como concluída
   */
  async completeSale(saleId: string, companyId: string, dto: CompleteSaleDTO): Promise<SaleResponse> {
    const sale = await this.repository.findById(saleId, companyId);

    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    // Calcular lucro
    const totalCost = (dto.totalCost || 0) + (dto.advertisingCost || 0) + (dto.otherCosts || 0);
    const profitAmount = dto.totalAmount - totalCost;
    const profitMargin = (profitAmount / dto.totalAmount) * 100;

    const updated = await this.repository.update(saleId, {
      status: 'VENDA_REALIZADA',
      totalAmount: dto.totalAmount,
      products: JSON.parse(JSON.stringify(dto.products)),
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate,
      totalCost: dto.totalCost,
      advertisingCost: dto.advertisingCost,
      otherCosts: dto.otherCosts,
      profitAmount,
      profitMargin,
      notes: dto.notes,
      completedAt: new Date(),
    });

    this.eventBus.emit('sale:completed', {
      saleId: updated.id,
      companyId: updated.companyId,
      totalAmount: updated.totalAmount.toNumber(),
      profitAmount,
    });

    return mapSaleToResponse(updated);
  }

  /**
   * Marcar venda como perdida
   */
  async loseSale(saleId: string, companyId: string, dto: LoseSaleDTO): Promise<SaleResponse> {
    const sale = await this.repository.findById(saleId, companyId);

    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    const updated = await this.repository.update(saleId, {
      status: 'VENDA_PERDIDA',
      lossReasonId: dto.lossReasonId,
      lossNotes: dto.lossNotes,
      valueLost: dto.valueLost || sale.totalAmount.toNumber(),
    });

    this.eventBus.emit('sale:lost', {
      saleId: updated.id,
      companyId: updated.companyId,
      lossReasonId: dto.lossReasonId,
      valueLost: dto.valueLost || sale.totalAmount.toNumber(),
    });

    return mapSaleToResponse(updated);
  }

  /**
   * Cancelar venda
   */
  async cancelSale(saleId: string, companyId: string, reason?: string): Promise<SaleResponse> {
    const sale = await this.repository.findById(saleId, companyId);

    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    const updated = await this.repository.update(saleId, {
      status: 'CANCELADO',
      notes: reason ? `Cancelada: ${reason}` : 'Cancelada',
      canceledAt: new Date(),
    });

    this.eventBus.emit('sale:canceled', {
      saleId: updated.id,
      companyId: updated.companyId,
      reason,
    });

    return mapSaleToResponse(updated);
  }

  /**
   * Obter métricas de vendas
   */
  async getMetrics(companyId: string, startDate: Date, endDate: Date): Promise<SaleMetrics> {
    const sales = await this.repository.findByDateRange(companyId, startDate, endDate);

    const completedSales = sales.filter((s) => s.status === 'VENDA_REALIZADA');
    const lostSales = sales.filter((s) => s.status === 'VENDA_PERDIDA');

    const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount.toNumber(), 0);
    const totalCost = completedSales.reduce((sum, s) => sum + (s.totalCost?.toNumber() || 0), 0);
    const totalProfit = completedSales.reduce((sum, s) => sum + (s.profitAmount?.toNumber() || 0), 0);
    const avgTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
    const conversionRate = sales.length > 0 ? (completedSales.length / sales.length) * 100 : 0;

    return {
      totalSales: sales.length,
      totalRevenue,
      totalCost,
      totalProfit,
      avgTicket,
      completedCount: completedSales.length,
      lostCount: lostSales.length,
      conversionRate,
    };
  }

  /**
   * Buscar vendas por período
   */
  async getSalesByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SaleResponse[]> {
    const sales = await this.repository.findByDateRange(companyId, startDate, endDate);
    return sales.map(mapSaleToResponse);
  }

  /**
   * Buscar vendas por vendedor
   */
  async getSalesByAttendant(companyId: string, attendantId: string): Promise<SaleResponse[]> {
    const sales = await this.repository.findMany({
      companyId,
      attendantId,
      take: 1000,
    });
    return sales.map(mapSaleToResponse);
  }

  /**
   * Buscar vendas por campanha
   */
  async getSalesByCampaign(companyId: string, campaignId: string): Promise<SaleResponse[]> {
    const sales = await this.repository.findMany({
      companyId,
      campaignId,
      take: 1000,
    });
    return sales.map(mapSaleToResponse);
  }

  /**
   * Buscar vendas por status
   */
  async getSalesByStatus(companyId: string, status: string): Promise<SaleResponse[]> {
    const sales = await this.repository.findMany({
      companyId,
      status,
      take: 1000,
    });
    return sales.map(mapSaleToResponse);
  }
}
