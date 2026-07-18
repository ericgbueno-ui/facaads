/**
 * TIPOS DE EVENTOS DE INTEGRAÇÃO
 * Eventos que os providers podem emitir
 */

import { ProviderType } from './provider';

export type IntegrationEventType =
  | 'ACCOUNT_CONNECTED'
  | 'ACCOUNT_DISCONNECTED'
  | 'ACCOUNT_EXPIRED'
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'CAMPAIGN_SYNCED'
  | 'CAMPAIGNS_SYNCED'
  | 'METRICS_SYNCED'
  | 'CONVERSIONS_SYNCED'
  | 'LEADS_SYNCED'
  | 'CREATIVE_SYNCED'
  | 'BUDGET_CHANGED'
  | 'SPEND_UPDATED'
  | 'CONVERSION_RECEIVED'
  | 'LEAD_RECEIVED'
  | 'WEBHOOK_RECEIVED'
  | 'ERROR_OCCURRED'
  | 'RATE_LIMITED'
  | 'RETRY_ATTEMPTED';

export interface IntegrationEvent {
  id: string;
  type: IntegrationEventType;
  provider: ProviderType;
  connectionId: string;
  companyId: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error';
}

export interface EventSubscriber {
  id: string;
  eventType: IntegrationEventType;
  handler: (event: IntegrationEvent) => Promise<void>;
  provider?: ProviderType;
  companyId?: string;
}

// Eventos específicos com dados tipados

export interface AccountConnectedEvent extends IntegrationEvent {
  type: 'ACCOUNT_CONNECTED';
  data: {
    externalAccountId: string;
    accountName: string;
    accountType?: string;
  };
}

export interface SyncCompletedEvent extends IntegrationEvent {
  type: 'SYNC_COMPLETED';
  data: {
    itemsSynced: number;
    itemsFailed: number;
    durationMs: number;
    syncType: 'campaigns' | 'metrics' | 'conversions' | 'leads' | 'full';
  };
}

export interface MetricsSyncedEvent extends IntegrationEvent {
  type: 'METRICS_SYNCED';
  data: {
    campaignId: string;
    date: string;
    metrics: {
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
      conversionValue: number;
    };
  };
}

export interface ConversionReceivedEvent extends IntegrationEvent {
  type: 'CONVERSION_RECEIVED';
  data: {
    externalConversionId?: string;
    amount: number;
    currency: string;
    source: string;
    metadata?: Record<string, any>;
  };
}

export interface ErrorOccurredEvent extends IntegrationEvent {
  type: 'ERROR_OCCURRED';
  data: {
    error: string;
    code?: string;
    retryable: boolean;
    retryCount?: number;
  };
}

export interface RateLimitedEvent extends IntegrationEvent {
  type: 'RATE_LIMITED';
  data: {
    retryAfter: number;
    limit: number;
    remaining: number;
  };
}
