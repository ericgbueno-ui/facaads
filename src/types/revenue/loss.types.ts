import { RevenueLossReason } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type LossReasonType = 'PRECO' | 'CONCORRENTE' | 'SEM_INTERESSE' | 'SEM_RETORNO' | 'SEM_ESTOQUE' | 'PRAZO' | 'OUTRO';

export interface CreateLossReasonDTO {
  companyId: string;
  reason: LossReasonType;
  description?: string;
  displayOrder?: number;
}

export interface LossReasonResponse {
  id: string;
  companyId: string;
  reason: LossReasonType;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LossByReasonStats {
  reason: LossReasonType;
  description?: string;
  count: number;
  totalValueLost: number;
  percent: number;
}

export interface LossAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalLosses: number;
    totalValueLost: number;
    lossRate: number; // %
  };
  byReason: LossByReasonStats[];
  topReason: LossByReasonStats | null;
}

export interface LossAnomalyAlert {
  type: 'high_loss_rate' | 'unusual_reason' | 'value_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  data: {
    currentValue: number;
    expectedValue?: number;
    deviation?: number;
  };
}

export const LOSS_REASONS = {
  PRECO: 'Preço',
  CONCORRENTE: 'Concorrência',
  SEM_INTERESSE: 'Sem Interesse',
  SEM_RETORNO: 'Sem Retorno',
  SEM_ESTOQUE: 'Sem Estoque',
  PRAZO: 'Prazo',
  OUTRO: 'Outro',
} as const;

export const mapLossReasonToResponse = (reason: RevenueLossReason): LossReasonResponse => {
  return {
    id: reason.id,
    companyId: reason.companyId,
    reason: reason.reason as LossReasonType,
    description: reason.description ?? undefined,
    displayOrder: reason.displayOrder,
    isActive: reason.isActive,
    createdAt: reason.createdAt,
    updatedAt: reason.updatedAt,
  };
};
