/**
 * INTEGRATION CORE
 * Hub central de todas as integrações
 * Orquestra providers, conexões, sincronização e eventos
 */

import { IProvider, ProviderType, ProviderConnection, SyncResult, SyncOptions } from '../types';
import { ProviderRegistry, getProviderRegistry } from './provider-registry';
import { ConnectionManager, getConnectionManager } from './connection-manager';
import { TokenManager, getTokenManager } from './token-manager';
import { EventBus } from '../services/event-bus';

export class IntegrationCore {
  private registry: ProviderRegistry;
  private connectionManager: ConnectionManager;
  private tokenManager: TokenManager;
  private eventBus: EventBus;

  constructor(eventBus?: EventBus) {
    this.registry = getProviderRegistry();
    this.connectionManager = getConnectionManager();
    this.tokenManager = getTokenManager();
    this.eventBus = eventBus || new EventBus();
  }

  // === PROVIDERS ===

  /**
   * Registra um novo provider
   */
  registerProvider(provider: IProvider): void {
    this.registry.register(provider);
    console.log(`✅ Provider ${provider.getType()} registrado no Integration Core`);
  }

  /**
   * Obtém um provider
   */
  getProvider(type: ProviderType): IProvider | null {
    return this.registry.get(type);
  }

  /**
   * Lista providers disponíveis
   */
  listProviders() {
    return this.registry.listEnabled();
  }

  /**
   * Ativa/desativa um provider
   */
  enableProvider(type: ProviderType): void {
    this.registry.enable(type);
  }

  disableProvider(type: ProviderType): void {
    this.registry.disable(type);
  }

  // === CONEXÕES ===

  /**
   * Cria uma nova conexão
   */
  async createConnection(input: any): Promise<ProviderConnection> {
    const connection = await this.connectionManager.createConnection(input);

    // Emite evento
    this.eventBus.emit('ACCOUNT_CONNECTED', {
      connectionId: connection.id,
      type: connection.type,
      companyId: connection.companyId,
      externalAccountId: connection.externalAccountId,
    });

    return connection;
  }

  /**
   * Obtém uma conexão
   */
  async getConnection(connectionId: string): Promise<ProviderConnection | null> {
    return this.connectionManager.getConnection(connectionId);
  }

  /**
   * Lista conexões de uma empresa
   */
  async listCompanyConnections(companyId: string, type?: ProviderType) {
    return this.connectionManager.listCompanyConnections(companyId, type);
  }

  /**
   * Desconecta uma conexão
   */
  async disconnect(connectionId: string): Promise<void> {
    const connection = await this.getConnection(connectionId);
    if (!connection) throw new Error('Conexão não encontrada');

    const provider = this.getProvider(connection.type);
    if (!provider) throw new Error(`Provider ${connection.type} não encontrado`);

    await provider.disconnect(connectionId);
    await this.connectionManager.deleteConnection(connectionId);

    // Emite evento
    this.eventBus.emit('ACCOUNT_DISCONNECTED', {
      connectionId,
      type: connection.type,
      companyId: connection.companyId,
    });
  }

  // === SINCRONIZAÇÃO ===

  /**
   * Sincroniza dados de uma conexão
   */
  async sync(connectionId: string, options?: SyncOptions): Promise<SyncResult> {
    const connection = await this.getConnection(connectionId);
    if (!connection) throw new Error('Conexão não encontrada');

    const provider = this.getProvider(connection.type);
    if (!provider) throw new Error(`Provider ${connection.type} não encontrado`);

    try {
      // Emite evento de início
      this.eventBus.emit('SYNC_STARTED', {
        connectionId,
        type: connection.type,
        companyId: connection.companyId,
      });

      // Executa sincronização
      const result = await provider.sync(connectionId, options);

      // Marca como sincronizada
      await this.connectionManager.markAsSynced(connectionId);

      // Emite evento de sucesso
      this.eventBus.emit('SYNC_COMPLETED', {
        connectionId,
        type: connection.type,
        companyId: connection.companyId,
        result,
      });

      return result;
    } catch (error) {
      // Marca como erro
      await this.connectionManager.markAsError(connectionId, (error as Error).message);

      // Emite evento de erro
      this.eventBus.emit('SYNC_FAILED', {
        connectionId,
        type: connection.type,
        companyId: connection.companyId,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Atualiza token de uma conexão
   */
  async refreshToken(connectionId: string): Promise<void> {
    const connection = await this.getConnection(connectionId);
    if (!connection) throw new Error('Conexão não encontrada');

    const provider = this.getProvider(connection.type);
    if (!provider) throw new Error(`Provider ${connection.type} não encontrado`);

    await provider.refresh(connectionId);
  }

  // === WEBHOOKS ===

  /**
   * Processa webhook
   */
  async webhook(type: ProviderType, payload: any): Promise<void> {
    const provider = this.getProvider(type);
    if (!provider) throw new Error(`Provider ${type} não encontrado`);

    try {
      // Valida assinatura
      if (!provider.validateWebhook(payload)) {
        throw new Error('Assinatura de webhook inválida');
      }

      // Processa webhook
      await provider.webhook(payload);

      // Emite evento
      this.eventBus.emit('WEBHOOK_RECEIVED', {
        type,
        event: payload.event,
        data: payload.data,
      });
    } catch (error) {
      this.eventBus.emit('ERROR_OCCURRED', {
        type,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  // === HEALTH CHECK ===

  /**
   * Verifica saúde de um provider
   */
  async checkProviderHealth(type: ProviderType) {
    const provider = this.getProvider(type);
    if (!provider) throw new Error(`Provider ${type} não encontrado`);

    return provider.health();
  }

  /**
   * Verifica saúde de uma conexão
   */
  async checkConnectionHealth(connectionId: string) {
    const connection = await this.getConnection(connectionId);
    if (!connection) throw new Error('Conexão não encontrada');

    const provider = this.getProvider(connection.type);
    if (!provider) throw new Error(`Provider ${connection.type} não encontrado`);

    return provider.status(connectionId);
  }

  // === VALIDAÇÃO ===

  /**
   * Valida uma conexão
   */
  async validate(connectionId: string) {
    const connection = await this.getConnection(connectionId);
    if (!connection) throw new Error('Conexão não encontrada');

    const provider = this.getProvider(connection.type);
    if (!provider) throw new Error(`Provider ${connection.type} não encontrado`);

    return provider.validate(connectionId);
  }

  // === EVENTOS ===

  /**
   * Subscreve a eventos
   */
  on(event: string, handler: (data: any) => void) {
    this.eventBus.on(event, handler);
  }

  /**
   * Desinscreve de eventos
   */
  off(event: string, handler: (data: any) => void) {
    this.eventBus.off(event, handler);
  }

  /**
   * Emite evento customizado
   */
  emit(event: string, data: any) {
    this.eventBus.emit(event, data);
  }

  // === INFORMAÇÕES ===

  /**
   * Retorna status do sistema
   */
  getStatus() {
    return {
      providers: this.registry.export(),
      timestamp: new Date(),
    };
  }
}

/**
 * Singleton global
 */
let coreInstance: IntegrationCore | null = null;

export function getIntegrationCore(): IntegrationCore {
  if (!coreInstance) {
    coreInstance = new IntegrationCore();
  }
  return coreInstance;
}

export function initIntegrationCore(eventBus?: EventBus): IntegrationCore {
  coreInstance = new IntegrationCore(eventBus);
  return coreInstance;
}
