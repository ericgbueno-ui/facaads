/**
 * TIPOS GERAIS DE INTEGRAÇÃO
 */

import { ProviderType, ProviderStatus, SyncResult } from './provider';
import { IntegrationEvent } from './events';

export interface IntegrationLog {
  id: string;
  connectionId: string;
  companyId: string;
  provider: ProviderType;
  userId?: string;
  action: 'connect' | 'disconnect' | 'sync' | 'webhook' | 'refresh' | 'validate';
  resource: string;
  status: 'success' | 'failure' | 'pending';
  duration: number; // milliseconds
  itemsProcessed: number;
  itemsFailed: number;
  error?: string;
  errorCode?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface IntegrationStatistics {
  provider: ProviderType;
  totalConnections: number;
  activeConnections: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  avgSyncTime: number;
  lastSyncTime?: Date;
  totalEvents: number;
  totalErrors: number;
  errorRate: number;
}

export interface IntegrationHealth {
  provider: ProviderType;
  status: 'healthy' | 'degraded' | 'unhealthy';
  connections: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  syncs: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  errors: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  lastChecked: Date;
}

export interface SyncSchedule {
  provider: ProviderType;
  connectionId: string;
  interval: 'hourly' | 'daily' | 'weekly' | 'custom';
  intervalMinutes?: number;
  lastRun?: Date;
  nextRun?: Date;
  enabled: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

export interface WebhookEndpoint {
  id: string;
  provider: ProviderType;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  verifySignature: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  provider: ProviderType;
  event: string;
  status: 'received' | 'processing' | 'processed' | 'failed';
  statusCode?: number;
  payload: Record<string, any>;
  response?: string;
  error?: string;
  retries: number;
  timestamp: Date;
}

export interface RateLimitConfig {
  provider: ProviderType;
  requestsPerSecond?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  burstSize?: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface IntegrationConfig {
  id: string;
  provider: ProviderType;
  enabled: boolean;
  oauthEnabled: boolean;
  webhooksEnabled: boolean;
  autoSync: boolean;
  autoSyncInterval: number; // minutos
  dataRetention: number; // dias
  maxConnections?: number;
  rateLimit: RateLimitConfig;
  retry: RetryPolicy;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationMetadata {
  provider: ProviderType;
  version: string;
  apiVersion: string;
  supportedEvents: string[];
  rateLimit: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
  webhookUrl?: string;
  documentation?: string;
}

export interface IntegrationPermissions {
  can_view: boolean;
  can_connect: boolean;
  can_disconnect: boolean;
  can_sync: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_manage_webhooks: boolean;
  can_view_logs: boolean;
}
