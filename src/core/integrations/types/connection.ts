/**
 * TIPOS PARA GERENCIAMENTO DE CONEXÕES
 */

import { ProviderType, ProviderStatus } from './provider';

export interface CreateConnectionInput {
  type: ProviderType;
  companyId: string;
  externalAccountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateConnectionInput {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  status?: ProviderStatus;
  metadata?: Record<string, any>;
}

export interface ConnectionFilter {
  companyId?: string;
  type?: ProviderType;
  status?: ProviderStatus;
  externalAccountId?: string;
}

export interface ConnectionStats {
  total: number;
  connected: number;
  disconnected: number;
  syncing: number;
  error: number;
  expired: number;
}

export interface ConnectionHealthReport {
  connectionId: string;
  type: ProviderType;
  status: ProviderStatus;
  lastSync?: Date;
  nextSync?: Date;
  errorRate: number;
  successRate: number;
  avgSyncTime: number;
}
