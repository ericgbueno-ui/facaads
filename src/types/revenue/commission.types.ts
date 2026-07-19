import { RevenueCommission } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type CommissionStatus = 'pending' | 'calculated' | 'paid';
export type CommissionType = 'fixed' | 'percentage';

export interface CreateCommissionDTO {
  companyId: string;
  saleId: string;
  attendantId?: string;
  attendantName?: string;
  commissionType: CommissionType;
  commissionAmount: number;
  notes?: string;
}

export interface CommissionResponse {
  id: string;
  companyId: string;
  saleId: string;
  attendantId?: string;
  attendantName?: string;
  commissionType: CommissionType;
  commissionAmount: number;
  status: CommissionStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionSummary {
  total: number;
  pending: number;
  calculated: number;
  paid: number;
  count: number;
}

export interface AttendantCommissionStats {
  attendantId: string;
  attendantName: string;
  totalEarned: number;
  totalPending: number;
  totalCalculated: number;
  totalPaid: number;
  commissionCount: number;
  avgCommission: number;
  lastPaidDate?: Date;
}

export interface CommissionReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: CommissionSummary;
  byAttendant: AttendantCommissionStats[];
  topEarners: Array<{
    attendantId: string;
    attendantName: string;
    totalEarned: number;
    rank: number;
  }>;
}

export interface CommissionPaymentRequest {
  companyId: string;
  attendantIds?: string[];
  status?: CommissionStatus;
  paymentDate: Date;
  notes?: string;
}

export interface CommissionPaymentResult {
  success: boolean;
  commissionsPaid: number;
  totalAmountPaid: number;
  paymentDate: Date;
  message: string;
}

export interface CommissionCalculationInput {
  saleAmount: number;
  commissionType: CommissionType;
  commissionRate?: number; // percentage
  fixedAmount?: number; // fixed amount
}

export const mapCommissionToResponse = (commission: RevenueCommission): CommissionResponse => {
  return {
    id: commission.id,
    companyId: commission.companyId,
    saleId: commission.saleId,
    attendantId: commission.attendantId ?? undefined,
    attendantName: commission.attendantName ?? undefined,
    commissionType: commission.commissionType as CommissionType,
    commissionAmount: commission.commissionAmount.toNumber(),
    status: commission.status as CommissionStatus,
    paidAt: commission.paidAt ?? undefined,
    createdAt: commission.createdAt,
    updatedAt: commission.updatedAt,
  };
};

export const calculateCommission = (input: CommissionCalculationInput): number => {
  if (input.commissionType === 'percentage') {
    if (!input.commissionRate) throw new Error('Commission rate required for percentage');
    return (input.saleAmount * input.commissionRate) / 100;
  } else {
    if (!input.fixedAmount) throw new Error('Fixed amount required for fixed commission');
    return input.fixedAmount;
  }
};
