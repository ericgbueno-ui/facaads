import { RevenueSale, RevenueSaleStatus } from '@prisma/client';

export type SaleStatus = RevenueSaleStatus;

export const SALE_STATUSES = {
  NOVO: 'NOVO',
  EM_ATENDIMENTO: 'EM_ATENDIMENTO',
  AGUARDANDO: 'AGUARDANDO',
  VENDA_REALIZADA: 'VENDA_REALIZADA',
  VENDA_PERDIDA: 'VENDA_PERDIDA',
  CANCELADO: 'CANCELADO',
  POS_VENDA: 'POS_VENDA',
} as const;

export interface SaleProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateSaleDTO {
  companyId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  totalAmount: number;
  products: SaleProduct[];
  attendantId?: string;
  attendantName?: string;
  leadId?: string;
  campaignId?: string;
  saleSourceId?: string;
  paymentMethod?: string;
  notes?: string;
  customFields?: Record<string, any>;
}

export interface UpdateSaleDTO {
  status?: SaleStatus;
  clientName?: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
  totalAmount?: number;
  products?: SaleProduct[];
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: Date;
  totalCost?: number;
  advertisingCost?: number;
  otherCosts?: number;
  notes?: string;
  customFields?: Record<string, any>;
}

export interface CompleteSaleDTO {
  totalAmount: number;
  products: SaleProduct[];
  paymentMethod?: string;
  paymentDate?: Date;
  totalCost?: number;
  advertisingCost?: number;
  otherCosts?: number;
  notes?: string;
}

export interface LoseSaleDTO {
  lossReasonId: string;
  lossNotes?: string;
  valueLost?: number;
}

export interface SaleResponse {
  id: string;
  companyId: string;
  status: SaleStatus;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  totalAmount: number;
  products: SaleProduct[];
  attendantId?: string;
  attendantName?: string;
  paymentStatus: string;
  paymentDate?: Date;
  profitAmount?: number;
  profitMargin?: number;
  lossReasonId?: string;
  lossNotes?: string;
  notes?: string;
  saleDate: Date;
  completedAt?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleListResponse {
  items: SaleResponse[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SaleMetrics {
  totalSales: number;
  totalRevenue: number;
  totalCost?: number;
  totalProfit?: number;
  avgTicket?: number;
  completedCount: number;
  lostCount: number;
  conversionRate?: number;
}

export interface SaleTimelineEvent {
  id: string;
  eventType: string;
  eventDescription: string;
  previousValue?: string;
  newValue?: string;
  userId?: string;
  userEmail?: string;
  createdAt: Date;
}

export const mapSaleToResponse = (sale: RevenueSale): SaleResponse => {
  return {
    id: sale.id,
    companyId: sale.companyId,
    status: sale.status,
    clientName: sale.clientName,
    clientPhone: sale.clientPhone ?? undefined,
    clientEmail: sale.clientEmail ?? undefined,
    totalAmount: sale.totalAmount.toNumber(),
    products: (sale.products as unknown as SaleProduct[]) || [],
    attendantId: sale.attendantId ?? undefined,
    attendantName: sale.attendantName ?? undefined,
    paymentStatus: sale.paymentStatus,
    paymentDate: sale.paymentDate ?? undefined,
    profitAmount: sale.profitAmount?.toNumber() ?? undefined,
    profitMargin: sale.profitMargin?.toNumber() ?? undefined,
    lossReasonId: sale.lossReasonId ?? undefined,
    lossNotes: sale.lossNotes ?? undefined,
    notes: sale.notes ?? undefined,
    saleDate: sale.saleDate,
    completedAt: sale.completedAt ?? undefined,
    canceledAt: sale.canceledAt ?? undefined,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  };
};
