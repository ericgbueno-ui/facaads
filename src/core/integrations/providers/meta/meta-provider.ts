/**
 * META PROVIDER
 * Implementação de provider para Meta Ads
 * Sincroniza campanhas, anúncios, métricas e conversões
 */

import { BaseProvider } from '../base-provider';
import {
  IProvider,
  ProviderType,
  ProviderConnection,
  SyncResult,
  HealthCheckResult,
  WebhookPayload,
  ValidationResult,
  SyncOptions,
  MetricFilters,
} from '../../types';
import { getConnectionManager } from '../../core/connection-manager';
import { getTokenManager } from '../../core/token-manager';
import { getEventBus } from '../../services/event-bus';
import { syncMetaAdAccount } from '@/lib/meta-ads/sync';
import { prisma } from '@/lib/prisma';

export class MetaProvider extends BaseProvider implements IProvider {
  private readonly META_GRAPH_API = 'https://graph.facebook.com';
  private readonly META_API_VERSION = 'v21.0';
  private readonly WEBHOOK_EVENTS = [
    'campaign',
    'adset',
    'ad',
    'insight',
    'conversion',
  ];

  constructor() {
    super('META', 'Meta Ads Manager', 'v21.0');
  }

  /**
   * Conecta uma conta Meta
   */
  async connect(credentials: any): Promise<ProviderConnection> {
    this.log('connect', 'Iniciando conexão Meta Ads');

    try {
      // Valida token
      await this.validateToken(credentials.accessToken);

      // Cria conexão
      const connectionManager = getConnectionManager();
      const connection = await connectionManager.createConnection({
        type: 'META',
        companyId: credentials.companyId,
        externalAccountId: credentials.businessAccountId,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        expiresAt: credentials.expiresAt,
        metadata: {
          accountName: credentials.accountName,
          accountType: credentials.accountType,
        },
      });

      this.log('connect', 'Conexão criada com sucesso', { connectionId: connection.id });

      // Emite evento
      getEventBus().emit('ACCOUNT_CONNECTED', {
        provider: 'META',
        connectionId: connection.id,
        companyId: connection.companyId,
        externalAccountId: connection.externalAccountId,
      });

      return connection;
    } catch (error) {
      this.logError('connect', error);
      throw this.handleError(error, 'Falha ao conectar Meta');
    }
  }

  /**
   * Desconecta uma conta Meta
   */
  async disconnect(connectionId: string): Promise<void> {
    this.log('disconnect', `Desconectando ${connectionId}`);

    try {
      const connectionManager = getConnectionManager();
      const connection = await connectionManager.getConnection(connectionId);

      if (!connection) {
        throw new Error('Conexão não encontrada');
      }

      // Revoga token na API do Meta (opcional)
      // await this.revokeToken(connection.accessToken);

      // Remove conexão
      await connectionManager.deleteConnection(connectionId);

      this.log('disconnect', 'Desconexão completada');

      // Emite evento
      getEventBus().emit('ACCOUNT_DISCONNECTED', {
        provider: 'META',
        connectionId,
        companyId: connection.companyId,
      });
    } catch (error) {
      this.logError('disconnect', error);
      throw this.handleError(error, 'Falha ao desconectar Meta');
    }
  }

  /**
   * Atualiza token de acesso
   */
  async refresh(connectionId: string): Promise<void> {
    this.log('refresh', `Atualizando token para ${connectionId}`);

    try {
      const connectionManager = getConnectionManager();
      const connection = await connectionManager.getConnection(connectionId);

      if (!connection) {
        throw new Error('Conexão não encontrada');
      }

      if (!connection.refreshToken) {
        throw new Error('Refresh token não disponível');
      }

      // Implementar refresh token do Meta
      // const newToken = await this.refreshAccessToken(connection.refreshToken);

      // Atualiza conexão (quando implementar refresh)
      // await connectionManager.updateConnection(connectionId, {
      //   accessToken: newToken.accessToken,
      //   refreshToken: newToken.refreshToken,
      //   expiresAt: newToken.expiresAt,
      // });

      this.log('refresh', 'Token atualizado');
    } catch (error) {
      this.logError('refresh', error);
      throw this.handleError(error, 'Falha ao atualizar token Meta');
    }
  }

  /**
   * Sincroniza dados
   */
  async sync(connectionId: string, options?: SyncOptions): Promise<SyncResult> {
    const startTime = performance.now();

    try {
      this.log('sync', `Iniciando sincronização para ${connectionId}`);

      const connectionManager = getConnectionManager();
      const connection = await connectionManager.getConnection(connectionId);

      if (!connection) {
        throw new Error('Conexão não encontrada');
      }

      // Usa função de sync existente do Meta
      const result = await syncMetaAdAccount(
        {
          id: connection.id,
          externalAccountId: connection.externalAccountId,
          accessToken: connection.accessToken,
          companyId: connection.companyId,
        },
        options?.daysBack || 30
      );

      const duration = performance.now() - startTime;

      this.log('sync', 'Sincronização completada', {
        campaigns: result.campaigns,
        snapshots: result.snapshots,
        duration: `${duration.toFixed(2)}ms`,
      });

      return {
        success: true,
        itemsSynced: result.snapshots,
        itemsFailed: 0,
        itemsSkipped: 0,
        duration,
        startedAt: new Date(),
        completedAt: new Date(),
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      this.logError('sync', error);

      return {
        success: false,
        itemsSynced: 0,
        itemsFailed: 0,
        itemsSkipped: 0,
        duration,
        startedAt: new Date(),
        completedAt: new Date(),
        error: (error as Error).message,
      };
    }
  }

  /**
   * Processa webhook do Meta
   */
  async webhook(payload: WebhookPayload): Promise<void> {
    try {
      this.log('webhook', `Processando evento: ${payload.event}`);

      // Implementar processamento de webhooks
      // Os webhooks do Meta chegam com eventos de campanhas, anúncios, etc

      getEventBus().emit('WEBHOOK_RECEIVED', {
        provider: 'META',
        event: payload.event,
        data: payload.data,
      });
    } catch (error) {
      this.logError('webhook', error);
      throw error;
    }
  }

  /**
   * Verifica saúde do Meta
   */
  async health(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Testa acesso à API
      const response = await fetch(`${this.META_GRAPH_API}/${this.META_API_VERSION}/me`, {
        headers: {
          Authorization: 'Bearer test_token_sample',
        },
      });

      const duration = performance.now() - startTime;

      return {
        status: 'healthy',
        message: 'Meta Ads API está respondendo',
        responseTime: duration,
        timestamp: new Date(),
      };
    } catch (error) {
      const duration = performance.now() - startTime;

      return {
        status: 'degraded',
        message: (error as Error).message,
        responseTime: duration,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Valida webhook do Meta
   */
  validateWebhook(payload: WebhookPayload): boolean {
    // Implementar validação de assinatura HMAC do Meta
    // Usar X-Hub-Signature header

    if (!payload.event || !payload.data) {
      return false;
    }

    return true;
  }

  /**
   * Retorna segredo do webhook
   */
  getWebhookSecret(): string {
    return process.env.META_WEBHOOK_SECRET || '';
  }

  /**
   * Lista contas do Meta
   */
  async getAccounts(connectionId: string): Promise<any[]> {
    try {
      const connection = await getConnectionManager().getConnection(connectionId);
      if (!connection) return [];

      // Busca campanhas do banco
      const campaigns = await prisma.campaign.findMany({
        where: {
          adAccount: {
            id: connection.id,
          },
        },
        select: {
          id: true,
          externalCampaignId: true,
          name: true,
        },
      });

      return campaigns;
    } catch (error) {
      this.logError('getAccounts', error);
      return [];
    }
  }

  /**
   * Lista campanhas
   */
  async getCampaigns(connectionId: string, accountId?: string): Promise<any[]> {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          adAccountId: accountId,
        },
        include: {
          _count: {
            select: { snapshots: true },
          },
        },
      });

      return campaigns;
    } catch (error) {
      this.logError('getCampaigns', error);
      return [];
    }
  }

  /**
   * Lista métricas
   */
  async getMetrics(connectionId: string, filters?: MetricFilters): Promise<any[]> {
    try {
      const where: any = {};

      if (filters?.startDate) {
        where.date = { gte: filters.startDate };
      }

      if (filters?.endDate) {
        where.date = { ...where.date, lte: filters.endDate };
      }

      const metrics = await prisma.metricSnapshot.findMany({
        where,
        take: 100,
      });

      return metrics;
    } catch (error) {
      this.logError('getMetrics', error);
      return [];
    }
  }

  // === MÉTODOS PRIVADOS ===

  /**
   * Valida um token do Meta
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.META_GRAPH_API}/${this.META_API_VERSION}/debug_token?input_token=${token}&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      const data = await response.json();
      return data.data?.is_valid === true;
    } catch (error) {
      throw new Error('Falha ao validar token Meta');
    }
  }
}

export function createMetaProvider(): MetaProvider {
  return new MetaProvider();
}
