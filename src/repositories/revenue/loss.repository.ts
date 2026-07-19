import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { RevenueLossReason } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateLossReasonInput {
  companyId: string;
  reason: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface LossFilterInput {
  companyId: string;
  reason?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

export class LossRepository {
  /**
   * Criar motivo de perda
   */
  async createReason(input: CreateLossReasonInput): Promise<RevenueLossReason> {
    return prisma.revenueLossReason.create({
      data: {
        companyId: input.companyId,
        reason: input.reason as any,
        description: input.description,
        displayOrder: input.displayOrder || 0,
        isActive: input.isActive !== false,
      },
    });
  }

  /**
   * Obter motivo de perda por ID
   */
  async findById(id: string, companyId: string): Promise<RevenueLossReason | null> {
    return prisma.revenueLossReason.findFirst({
      where: { id, companyId },
      include: {
        sales: { select: { id: true, valueLost: true } },
      },
    });
  }

  /**
   * Listar motivos de perda ativos
   */
  async findActive(companyId: string): Promise<RevenueLossReason[]> {
    return prisma.revenueLossReason.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  /**
   * Listar todos os motivos
   */
  async findMany(filter: LossFilterInput): Promise<RevenueLossReason[]> {
    return prisma.revenueLossReason.findMany({
      where: {
        companyId: filter.companyId,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      skip: filter.skip,
      take: filter.take,
    });
  }

  /**
   * Contar vendas perdidas por motivo
   */
  async countSalesByReason(companyId: string, reasonId: string): Promise<number> {
    return prisma.revenueSale.count({
      where: {
        companyId,
        lossReasonId: reasonId,
        status: 'VENDA_PERDIDA',
      },
    });
  }

  /**
   * Obter valor total perdido por motivo
   */
  async getSumByReason(companyId: string, reasonId: string): Promise<Decimal> {
    const result = await prisma.revenueSale.aggregate({
      where: {
        companyId,
        lossReasonId: reasonId,
        status: 'VENDA_PERDIDA',
      },
      _sum: {
        valueLost: true,
      },
    });

    return result._sum.valueLost || new Decimal(0);
  }

  /**
   * Obter todas as perdas por período
   */
  async getLossesByPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ reason: string; count: number; total: Decimal }>> {
    const losses = await prisma.revenueSale.groupBy({
      by: ['lossReasonId'],
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'VENDA_PERDIDA',
        lossReasonId: { not: null },
      },
      _sum: {
        valueLost: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Buscar nomes dos motivos
    const reasonIds = losses.map((l) => l.lossReasonId).filter(Boolean);
    const reasons = await prisma.revenueLossReason.findMany({
      where: {
        id: { in: reasonIds as string[] },
      },
    });

    const reasonMap = new Map(reasons.map((r) => [r.id, r.reason]));

    return losses.map((loss) => ({
      reason: reasonMap.get(loss.lossReasonId || '') || 'Unknown',
      count: loss._count.id,
      total: loss._sum.valueLost || new Decimal(0),
    }));
  }

  /**
   * Calcular taxa de perda (% de vendas perdidas)
   */
  async getLossRate(companyId: string, startDate: Date, endDate: Date): Promise<number> {
    const total = await prisma.revenueSale.count({
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['VENDA_REALIZADA', 'VENDA_PERDIDA'] },
      },
    });

    const lost = await prisma.revenueSale.count({
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'VENDA_PERDIDA',
      },
    });

    if (total === 0) return 0;
    return (lost / total) * 100;
  }

  /**
   * Obter valor total perdido por período
   */
  async getTotalValueLost(companyId: string, startDate: Date, endDate: Date): Promise<Decimal> {
    const result = await prisma.revenueSale.aggregate({
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'VENDA_PERDIDA',
      },
      _sum: {
        valueLost: true,
      },
    });

    return result._sum.valueLost || new Decimal(0);
  }

  /**
   * Atualizar motivo de perda
   */
  async update(
    id: string,
    data: Partial<CreateLossReasonInput>
  ): Promise<RevenueLossReason> {
    const updateData: Prisma.RevenueLossReasonUpdateInput = {};

    if (data.description !== undefined) updateData.description = data.description;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.revenueLossReason.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deletar motivo de perda
   */
  async delete(id: string, companyId: string): Promise<void> {
    await prisma.revenueLossReason.deleteMany({
      where: { id, companyId },
    });
  }

  /**
   * Top motivos de perda (mais frequentes)
   */
  async getTopReasons(companyId: string, limit: number = 10): Promise<RevenueLossReason[]> {
    const topReasonIds = await prisma.revenueSale.groupBy({
      by: ['lossReasonId'],
      where: {
        companyId,
        status: 'VENDA_PERDIDA',
        lossReasonId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const ids = topReasonIds
      .map((r) => r.lossReasonId)
      .filter(Boolean) as string[];

    return prisma.revenueLossReason.findMany({
      where: {
        id: { in: ids },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }
}
