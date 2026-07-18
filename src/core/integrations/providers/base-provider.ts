/**
 * BASE PROVIDER - CLASSE ABSTRATA
 * Todos os providers devem estender essa classe
 * Implementa a interface IProvider e métodos comuns
 */

import {
  IProvider,
  ProviderType,
  ProviderConnection,
  SyncResult,
  HealthCheckResult,
  WebhookPayload,
  ValidationResult,
  ProviderStatus as ProviderStatusInterface,
  SyncOptions,
  MetricFilters,
} from '../types';

export abstract class BaseProvider implements IProvider {
  protected type: ProviderType;
  protected name: string;
  protected version: string = '1.0.0';
  protected apiVersion: string;

  constructor(type: ProviderType, name: string, apiVersion: string) {
    this.type = type;
    this.name = name;
    this.apiVersion = apiVersion;
  }

  // === MÉTODOS ABSTRATOS (devem ser implementados pelos providers) ===

  abstract connect(credentials: any): Promise<ProviderConnection>;
  abstract disconnect(connectionId: string): Promise<void>;
  abstract refresh(connectionId: string): Promise<void>;
  abstract sync(connectionId: string, options?: SyncOptions): Promise<SyncResult>;
  abstract webhook(payload: WebhookPayload): Promise<void>;
  abstract health(): Promise<HealthCheckResult>;
  abstract getAccounts(connectionId: string): Promise<any[]>;

  // === MÉTODOS CONCRETOS (implementação padrão) ===

  getType(): ProviderType {
    return this.type;
  }

  getName(): string {
    return this.name;
  }

  getVersion(): string {
    return this.version;
  }

  getApiVersion(): string {
    return this.apiVersion;
  }

  /**
   * Validação básica de conexão
   * Override em subclasses para validações específicas
   */
  async validate(connectionId: string): Promise<ValidationResult> {
    try {
      const health = await this.health();
      return {
        valid: health.status === 'healthy',
        errors: health.status === 'healthy' ? [] : [health.message],
      };
    } catch (error) {
      return {
        valid: false,
        errors: [(error as Error).message],
      };
    }
  }

  /**
   * Validação de webhook
   * IMPORTANTE: Override em subclasses com validação de signature
   */
  validateWebhook(payload: WebhookPayload): boolean {
    // Validação básica
    if (!payload.event || !payload.data || !payload.timestamp) {
      return false;
    }

    // Validação de assinatura deve ser implementada
    // em subclasses com os segredos específicos
    return true;
  }

  /**
   * Retorna o segredo do webhook
   * Override em subclasses
   */
  getWebhookSecret(): string {
    throw new Error('Método getWebhookSecret() deve ser implementado');
  }

  /**
   * Sincronização de campanhas (opcional)
   */
  async syncCampaigns?(connectionId: string): Promise<void> {
    console.log(`${this.name}: syncCampaigns não implementado`);
  }

  /**
   * Sincronização de anúncios (opcional)
   */
  async syncAds?(connectionId: string): Promise<void> {
    console.log(`${this.name}: syncAds não implementado`);
  }

  /**
   * Sincronização de métricas (opcional)
   */
  async syncMetrics?(connectionId: string): Promise<void> {
    console.log(`${this.name}: syncMetrics não implementado`);
  }

  /**
   * Sincronização de conversões (opcional)
   */
  async syncConversions?(connectionId: string): Promise<void> {
    console.log(`${this.name}: syncConversions não implementado`);
  }

  /**
   * Status da conexão
   * Override em subclasses para lógica específica
   */
  async status(connectionId: string): Promise<ProviderStatusInterface> {
    return {
      connected: true,
      syncing: false,
      error: undefined,
      errorCount: 0,
      successCount: 0,
    };
  }

  /**
   * Lista campanhas
   * Override em subclasses para implementação específica
   */
  async getCampaigns(connectionId: string, accountId?: string): Promise<any[]> {
    console.log(`${this.name}: getCampaigns não implementado`);
    return [];
  }

  /**
   * Lista métricas
   * Override em subclasses para implementação específica
   */
  async getMetrics(connectionId: string, filters?: MetricFilters): Promise<any[]> {
    console.log(`${this.name}: getMetrics não implementado`);
    return [];
  }

  // === UTILITÁRIOS PARA IMPLEMENTAÇÃO ===

  /**
   * Tratamento padronizado de erros
   */
  protected handleError(error: any, context: string): Error {
    console.error(`[${this.name}] ${context}:`, error);

    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error(`Erro desconhecido em ${context}`);
  }

  /**
   * Log de ação
   */
  protected log(action: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] ${action}: ${message}`, data || '');
  }

  /**
   * Log de erro
   */
  protected logError(action: string, error: any): void {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] [${this.name}] ERROR ${action}:`,
      error instanceof Error ? error.message : error
    );
  }

  /**
   * Calcula tempo de resposta
   */
  protected measurePerformance<T>(
    action: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve, reject) => {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        this.log(action, `completado em ${duration.toFixed(2)}ms`);
        resolve({ result, duration });
      } catch (error) {
        const duration = performance.now() - start;
        this.logError(action, error);
        reject(error);
      }
    });
  }

  /**
   * Retry automático com backoff exponencial
   */
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          const delayMs = initialDelayMs * Math.pow(2, attempt);
          this.log('retry', `Tentativa ${attempt + 1}/${maxRetries}, aguardando ${delayMs}ms`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error('Falha em todas as tentativas de retry');
  }

  /**
   * Valida se o token está expirado
   */
  protected isTokenExpired(expiresAt?: Date): boolean {
    if (!expiresAt) return false;
    return new Date() >= expiresAt;
  }

  /**
   * Normaliza dados da API
   */
  protected normalizeData<T>(data: any): T {
    return data as T;
  }
}
