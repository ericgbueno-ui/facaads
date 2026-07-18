/**
 * INTERFACE BASE DE TODOS OS PROVIDERS
 * Todos os provedores de integração devem implementar essa interface
 * Garante um contrato consistente entre Meta, Google, TikTok, Shopee, etc
 */

export type ProviderType = 'META' | 'GOOGLE' | 'TIKTOK' | 'SHOPEE' | 'LINKEDIN' | 'PINTEREST' | 'MERCADO_LIVRE' | 'YOUTUBE';

export type ProviderStatus = 'connected' | 'disconnected' | 'syncing' | 'error' | 'expired' | 'pending_auth';

export interface ProviderConfig {
  type: ProviderType;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  apiVersion?: string;
  baseUrl?: string;
}

export interface ProviderConnection {
  id: string;
  type: ProviderType;
  companyId: string;
  externalAccountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  status: ProviderStatus;
  lastSyncedAt?: Date;
  lastErrorAt?: Date;
  lastError?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  itemsFailed: number;
  itemsSkipped: number;
  duration: number; // milliseconds
  startedAt: Date;
  completedAt: Date;
  nextSyncAt?: Date;
  error?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  responseTime: number;
  timestamp: Date;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ProviderStatus {
  connected: boolean;
  lastSync?: Date;
  syncing: boolean;
  error?: string;
  errorCount: number;
  successCount: number;
}

/**
 * INTERFACE UNIVERSAL DE PROVIDER
 * Todos os providers devem implementar exatamente esses métodos
 */
export interface IProvider {
  // Identificação
  getType(): ProviderType;
  getName(): string;
  getVersion(): string;

  // Autenticação
  connect(credentials: any): Promise<ProviderConnection>;
  disconnect(connectionId: string): Promise<void>;
  refresh(connectionId: string): Promise<void>;
  validate(connectionId: string): Promise<ValidationResult>;

  // Sincronização
  sync(connectionId: string, options?: SyncOptions): Promise<SyncResult>;
  syncAccounts?(connectionId: string): Promise<void>;
  syncCampaigns?(connectionId: string): Promise<void>;
  syncAds?(connectionId: string): Promise<void>;
  syncMetrics?(connectionId: string): Promise<void>;
  syncConversions?(connectionId: string): Promise<void>;

  // Webhooks
  webhook(payload: WebhookPayload): Promise<void>;
  validateWebhook(payload: WebhookPayload): boolean;
  getWebhookSecret(): string;

  // Status
  health(): Promise<HealthCheckResult>;
  status(connectionId: string): Promise<ProviderStatus>;

  // Utilitários
  getAccounts(connectionId: string): Promise<any[]>;
  getCampaigns(connectionId: string, accountId?: string): Promise<any[]>;
  getMetrics(connectionId: string, filters?: MetricFilters): Promise<any[]>;
}

export interface SyncOptions {
  fullSync?: boolean;
  daysBack?: number;
  accountId?: string;
  campaignId?: string;
}

export interface MetricFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  campaignId?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface ProviderEvent {
  type: ProviderType;
  eventName: string;
  connectionId: string;
  companyId: string;
  data: any;
  timestamp: Date;
}
