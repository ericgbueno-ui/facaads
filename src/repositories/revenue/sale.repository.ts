import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { RevenueSale } from '@prisma/client';

export interface CreateSaleInput {
  companyId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  totalAmount: number;
  products: Prisma.InputJsonValue;
  attendantId?: string;
  attendantName?: string;
  leadId?: string;
  campaignId?: string;
  saleSourceId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalCost?: number;
  advertisingCost?: number;
  otherCosts?: number;
  notes?: string;
  customFields?: Prisma.InputJsonValue;
  saleDate?: Date;
  saleTime?: string;
}

export interface UpdateSaleInput {
  status?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  totalAmount?: number;
  products?: Prisma.InputJsonValue;
  attendantId?: string;
  attendantName?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: Date;
  totalCost?: number;
  advertisingCost?: number;
  otherCosts?: number;
  profitAmount?: number;
  profitMargin?: number;
  lossReasonId?: string;
  lossNotes?: string;
  valueLost?: number;
  notes?: string;
  customFields?: Prisma.InputJsonValue;
  completedAt?: Date;
  canceledAt?: Date;
}

export interface SaleFilterInput {
  companyId: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  attendantId?: string;
  campaignId?: string;
  saleSourceId?: string;
  paymentStatus?: string;
  skip?: number;
  take?: number;
}

export class SaleRepository {
  async create(input: CreateSaleInput): Promise<RevenueSale> {
    return prisma.revenueSale.create({
      data: {
        companyId: input.companyId,
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        clientEmail: input.clientEmail,
        totalAmount: new Prisma.Decimal(input.totalAmount),
        products: input.products,
        attendantId: input.attendantId,
        attendantName: input.attendantName,
        leadId: input.leadId,
        campaignId: input.campaignId,
        saleSourceId: input.saleSourceId,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus || 'pending',
        totalCost: input.totalCost ? new Prisma.Decimal(input.totalCost) : null,
        advertisingCost: input.advertisingCost ? new Prisma.Decimal(input.advertisingCost) : null,
        otherCosts: input.otherCosts ? new Prisma.Decimal(input.otherCosts) : null,
        notes: input.notes,
        customFields: input.customFields,
        saleDate: input.saleDate || new Date(),
        saleTime: input.saleTime,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<RevenueSale | null> {
    return prisma.revenueSale.findFirst({
      where: {
        id,
        companyId,
      },
    });
  }

  async findMany(filter: SaleFilterInput): Promise<RevenueSale[]> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: filter.companyId,
    };

    if (filter.status) {
      where.status = filter.status as any;
    }

    if (filter.attendantId) {
      where.attendantId = filter.attendantId;
    }

    if (filter.campaignId) {
      where.campaignId = filter.campaignId;
    }

    if (filter.saleSourceId) {
      where.saleSourceId = filter.saleSourceId;
    }

    if (filter.paymentStatus) {
      where.paymentStatus = filter.paymentStatus;
    }

    if (filter.startDate && filter.endDate) {
      where.saleDate = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }

    return prisma.revenueSale.findMany({
      where,
      skip: filter.skip || 0,
      take: filter.take || 100,
      orderBy: {
        saleDate: 'desc',
      },
    });
  }

  async count(filter: SaleFilterInput): Promise<number> {
    const where: Prisma.RevenueSaleWhereInput = {
      companyId: filter.companyId,
    };

    if (filter.status) {
      where.status = filter.status as any;
    }

    if (filter.startDate && filter.endDate) {
      where.saleDate = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }

    return prisma.revenueSale.count({ where });
  }

  async update(id: string, input: UpdateSaleInput): Promise<RevenueSale> {
    const data: Prisma.RevenueSaleUpdateInput = {};

    if (input.status) data.status = input.status as any;
    if (input.clientName) data.clientName = input.clientName;
    if (input.clientPhone !== undefined) data.clientPhone = input.clientPhone;
    if (input.clientEmail !== undefined) data.clientEmail = input.clientEmail;
    if (input.totalAmount) data.totalAmount = new Prisma.Decimal(input.totalAmount);
    if (input.products) data.products = input.products;
    if (input.attendantId) data.attendantId = input.attendantId;
    if (input.attendantName) data.attendantName = input.attendantName;
    if (input.paymentMethod) data.paymentMethod = input.paymentMethod;
    if (input.paymentStatus) data.paymentStatus = input.paymentStatus;
    if (input.paymentDate) data.paymentDate = input.paymentDate;
    if (input.totalCost) data.totalCost = new Prisma.Decimal(input.totalCost);
    if (input.advertisingCost) data.advertisingCost = new Prisma.Decimal(input.advertisingCost);
    if (input.otherCosts) data.otherCosts = new Prisma.Decimal(input.otherCosts);
    if (input.profitAmount) data.profitAmount = new Prisma.Decimal(input.profitAmount);
    if (input.profitMargin) data.profitMargin = new Prisma.Decimal(input.profitMargin);
    if (input.lossReasonId !== undefined) data.lossReasonId = input.lossReasonId;
    if (input.lossNotes !== undefined) data.lossNotes = input.lossNotes;
    if (input.valueLost !== undefined) data.valueLost = input.valueLost ? new Prisma.Decimal(input.valueLost) : null;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.customFields) data.customFields = input.customFields;
    if (input.completedAt) data.completedAt = input.completedAt;
    if (input.canceledAt) data.canceledAt = input.canceledAt;

    return prisma.revenueSale.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, companyId: string): Promise<void> {
    await prisma.revenueSale.deleteMany({
      where: {
        id,
        companyId,
      },
    });
  }

  async findByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RevenueSale[]> {
    return prisma.revenueSale.findMany({
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });
  }

  async sumByStatus(companyId: string, status: string): Promise<number> {
    const result = await prisma.revenueSale.aggregate({
      where: {
        companyId,
        status: status as any,
      },
      _sum: {
        totalAmount: true,
      },
    });

    return result._sum.totalAmount?.toNumber() || 0;
  }

  async sumByAttendant(companyId: string, attendantId: string): Promise<number> {
    const result = await prisma.revenueSale.aggregate({
      where: {
        companyId,
        attendantId,
      },
      _sum: {
        totalAmount: true,
      },
    });

    return result._sum.totalAmount?.toNumber() || 0;
  }

  async sumByCampaign(companyId: string, campaignId: string): Promise<number> {
    const result = await prisma.revenueSale.aggregate({
      where: {
        companyId,
        campaignId,
      },
      _sum: {
        totalAmount: true,
      },
    });

    return result._sum.totalAmount?.toNumber() || 0;
  }
}
