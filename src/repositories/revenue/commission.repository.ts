import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { RevenueCommission } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateCommissionInput {
  companyId: string;
  saleId: string;
  attendantId?: string;
  attendantName?: string;
  commissionType: 'fixed' | 'percentage';
  commissionAmount: number;
  status?: 'pending' | 'calculated' | 'paid';
  paidAt?: Date;
}

export interface UpdateCommissionInput {
  status?: 'pending' | 'calculated' | 'paid';
  commissionAmount?: number;
  paidAt?: Date;
}

export interface CommissionFilterInput {
  companyId: string;
  status?: 'pending' | 'calculated' | 'paid';
  attendantId?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

export class CommissionRepository {
  /**
   * Criar comissão
   */
  async create(input: CreateCommissionInput): Promise<RevenueCommission> {
    return prisma.revenueCommission.create({
      data: {
        companyId: input.companyId,
        saleId: input.saleId,
        attendantId: input.attendantId,
        attendantName: input.attendantName,
        commissionType: input.commissionType,
        commissionAmount: new Prisma.Decimal(input.commissionAmount),
        status: input.status || 'pending',
        paidAt: input.paidAt,
      },
    });
  }

  /**
   * Obter comissão por ID
   */
  async findById(id: string, companyId: string): Promise<RevenueCommission | null> {
    return prisma.revenueCommission.findFirst({
      where: { id, companyId },
      include: { sale: true },
    });
  }

  /**
   * Listar comissões com filtros
   */
  async findMany(filter: CommissionFilterInput): Promise<RevenueCommission[]> {
    const where: Prisma.RevenueCommissionWhereInput = {
      companyId: filter.companyId,
    };

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.attendantId) {
      where.attendantId = filter.attendantId;
    }

    if (filter.startDate && filter.endDate) {
      where.createdAt = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }

    return prisma.revenueCommission.findMany({
      where,
      skip: filter.skip || 0,
      take: filter.take || 100,
      orderBy: {
        createdAt: 'desc',
      },
      include: { sale: true },
    });
  }

  /**
   * Contar comissões por status
   */
  async countByStatus(companyId: string, status: 'pending' | 'calculated' | 'paid'): Promise<number> {
    return prisma.revenueCommission.count({
      where: { companyId, status },
    });
  }

  /**
   * Atualizar comissão
   */
  async update(id: string, input: UpdateCommissionInput): Promise<RevenueCommission> {
    const data: Prisma.RevenueCommissionUpdateInput = {};

    if (input.status) data.status = input.status;
    if (input.commissionAmount) data.commissionAmount = new Prisma.Decimal(input.commissionAmount);
    if (input.paidAt) data.paidAt = input.paidAt;

    return prisma.revenueCommission.update({
      where: { id },
      data,
      include: { sale: true },
    });
  }

  /**
   * Deletar comissão
   */
  async delete(id: string, companyId: string): Promise<void> {
    await prisma.revenueCommission.deleteMany({
      where: { id, companyId },
    });
  }

  /**
   * Obter comissões pendentes
   */
  async getPending(companyId: string): Promise<RevenueCommission[]> {
    return prisma.revenueCommission.findMany({
      where: {
        companyId,
        status: 'pending',
      },
      include: { sale: true },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Obter comissões por vendedor
   */
  async getByAttendant(
    companyId: string,
    attendantId: string,
    status?: 'pending' | 'calculated' | 'paid'
  ): Promise<RevenueCommission[]> {
    const where: Prisma.RevenueCommissionWhereInput = {
      companyId,
      attendantId,
    };

    if (status) {
      where.status = status;
    }

    return prisma.revenueCommission.findMany({
      where,
      include: { sale: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Soma de comissões (total)
   */
  async sumByAttendant(
    companyId: string,
    attendantId: string,
    status?: 'pending' | 'calculated' | 'paid'
  ): Promise<Decimal> {
    const where: Prisma.RevenueCommissionWhereInput = {
      companyId,
      attendantId,
    };

    if (status) {
      where.status = status;
    }

    const result = await prisma.revenueCommission.aggregate({
      where,
      _sum: {
        commissionAmount: true,
      },
    });

    return result._sum.commissionAmount || new Decimal(0);
  }

  /**
   * Suma total de comissões por período
   */
  async sumByPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
    status?: 'pending' | 'calculated' | 'paid'
  ): Promise<Decimal> {
    const where: Prisma.RevenueCommissionWhereInput = {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (status) {
      where.status = status;
    }

    const result = await prisma.revenueCommission.aggregate({
      where,
      _sum: {
        commissionAmount: true,
      },
    });

    return result._sum.commissionAmount || new Decimal(0);
  }

  /**
   * Top vendedores por comissão
   */
  async getTopAttendantsByCommission(
    companyId: string,
    limit: number = 10
  ): Promise<Array<{ attendantId: string; attendantName: string; total: Decimal; count: number }>> {
    const result = await prisma.revenueCommission.groupBy({
      by: ['attendantId', 'attendantName'],
      where: { companyId },
      _sum: {
        commissionAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          commissionAmount: 'desc',
        },
      },
      take: limit,
    });

    return result
      .filter((r) => r.attendantId)
      .map((r) => ({
        attendantId: r.attendantId!,
        attendantName: r.attendantName || 'Unknown',
        total: r._sum.commissionAmount || new Decimal(0),
        count: r._count.id,
      }));
  }

  /**
   * Marcar múltiplas comissões como pagas
   */
  async markAsPaid(commissionIds: string[], paidAt: Date): Promise<Prisma.BatchPayload> {
    return prisma.revenueCommission.updateMany({
      where: {
        id: { in: commissionIds },
      },
      data: {
        status: 'paid',
        paidAt,
      },
    });
  }

  /**
   * Marcar múltiplas comissões como calculadas
   */
  async markAsCalculated(commissionIds: string[]): Promise<Prisma.BatchPayload> {
    return prisma.revenueCommission.updateMany({
      where: {
        id: { in: commissionIds },
      },
      data: {
        status: 'calculated',
      },
    });
  }

  /**
   * Obter comissão por venda
   */
  async findBySaleId(saleId: string, companyId: string): Promise<RevenueCommission | null> {
    return prisma.revenueCommission.findFirst({
      where: {
        saleId,
        companyId,
      },
      include: { sale: true },
    });
  }
}
