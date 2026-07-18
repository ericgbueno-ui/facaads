/**
 * CONNECTION MANAGER
 * Gerencia conexões entre empresas e provedores
 * Reutiliza o modelo AdAccount existente do Prisma
 */

import { prisma } from '@/lib/prisma';
import {
  ProviderConnection,
  ProviderType,
  ProviderStatus as ProviderStatusEnum,
  CreateConnectionInput,
  UpdateConnectionInput,
  ConnectionStats,
} from '../types';
import { getTokenManager } from './token-manager';

export class ConnectionManager {
  /**
   * Cria uma nova conexão
   */
  async createConnection(input: CreateConnectionInput): Promise<ProviderConnection> {
    const tokenManager = getTokenManager();

    // Criptografa os tokens
    const encryptedAccessToken = tokenManager.encryptToken(input.accessToken);
    const encryptedRefreshToken = input.refreshToken
      ? tokenManager.encryptToken(input.refreshToken)
      : null;

    // Cria a conexão usando o modelo AdAccount existente
    const connection = await prisma.adAccount.create({
      data: {
        channel: input.type,
        externalAccountId: input.externalAccountId,
        accessToken: JSON.stringify(encryptedAccessToken),
        refreshToken: encryptedRefreshToken ? JSON.stringify(encryptedRefreshToken) : null,
        companyId: input.companyId,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.mapToProviderConnection(connection);
  }

  /**
   * Recupera uma conexão
   */
  async getConnection(connectionId: string): Promise<ProviderConnection | null> {
    const connection = await prisma.adAccount.findUnique({
      where: { id: connectionId },
    });

    if (!connection) return null;

    return this.mapToProviderConnection(connection);
  }

  /**
   * Lista conexões de uma empresa
   */
  async listCompanyConnections(
    companyId: string,
    type?: ProviderType
  ): Promise<ProviderConnection[]> {
    const connections = await prisma.adAccount.findMany({
      where: {
        companyId,
        ...(type && { channel: type }),
      },
    });

    return connections.map((c) => this.mapToProviderConnection(c));
  }

  /**
   * Lista todas as conexões de um tipo
   */
  async listConnectionsByType(type: ProviderType): Promise<ProviderConnection[]> {
    const connections = await prisma.adAccount.findMany({
      where: { channel: type },
    });

    return connections.map((c) => this.mapToProviderConnection(c));
  }

  /**
   * Atualiza uma conexão
   */
  async updateConnection(
    connectionId: string,
    input: UpdateConnectionInput
  ): Promise<ProviderConnection> {
    const tokenManager = getTokenManager();

    const updateData: any = {};

    if (input.accessToken) {
      const encryptedAccessToken = tokenManager.encryptToken(input.accessToken);
      updateData.accessToken = JSON.stringify(encryptedAccessToken);
    }

    if (input.refreshToken) {
      const encryptedRefreshToken = tokenManager.encryptToken(input.refreshToken);
      updateData.refreshToken = JSON.stringify(encryptedRefreshToken);
    }

    if (input.status) {
      updateData.lastSyncedAt = new Date();
    }

    if (input.metadata) {
      updateData.metadata = input.metadata;
    }

    updateData.updatedAt = new Date();

    const connection = await prisma.adAccount.update({
      where: { id: connectionId },
      data: updateData,
    });

    return this.mapToProviderConnection(connection);
  }

  /**
   * Deleta uma conexão
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await prisma.adAccount.delete({
      where: { id: connectionId },
    });
  }

  /**
   * Marca uma conexão como sincronizada
   */
  async markAsSynced(connectionId: string): Promise<void> {
    await prisma.adAccount.update({
      where: { id: connectionId },
      data: { lastSyncedAt: new Date() },
    });
  }

  /**
   * Marca uma conexão com erro
   */
  async markAsError(connectionId: string, error: string): Promise<void> {
    // Implementar quando adicionar campos de error ao modelo
    console.error(`Connection ${connectionId} error:`, error);
  }

  /**
   * Verifica se um token está prestes a expirar
   */
  async getExpiringConnections(daysBeforeExpiry: number = 7): Promise<ProviderConnection[]> {
    const connections = await prisma.adAccount.findMany({
      where: {
        refreshToken: { not: null },
      },
    });

    const tokenManager = getTokenManager();

    return connections
      .map((c) => this.mapToProviderConnection(c))
      .filter((conn) => {
        if (!conn.expiresAt) return false;
        const daysUntilExpiry =
          (conn.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= daysBeforeExpiry && daysUntilExpiry > 0;
      });
  }

  /**
   * Estatísticas de conexões
   */
  async getStats(companyId?: string): Promise<ConnectionStats> {
    const where = companyId ? { companyId } : {};

    const total = await prisma.adAccount.count({ where });
    const byType = await prisma.adAccount.groupBy({
      by: ['channel'],
      where,
      _count: true,
    });

    return {
      total,
      connected: total, // Ajustar quando adicionar status field
      disconnected: 0,
      syncing: 0,
      error: 0,
      expired: 0,
    };
  }

  /**
   * Mapeia modelo Prisma para ProviderConnection
   */
  private mapToProviderConnection(adAccount: any): ProviderConnection {
    const tokenManager = getTokenManager();

    let accessToken = '';
    let refreshToken: string | undefined;

    try {
      if (adAccount.accessToken) {
        const encrypted = JSON.parse(adAccount.accessToken);
        accessToken = tokenManager.decryptToken(encrypted);
      }

      if (adAccount.refreshToken) {
        const encrypted = JSON.parse(adAccount.refreshToken);
        refreshToken = tokenManager.decryptToken(encrypted);
      }
    } catch (error) {
      console.error('Erro ao descriptografar tokens:', error);
    }

    return {
      id: adAccount.id,
      type: adAccount.channel,
      companyId: adAccount.companyId,
      externalAccountId: adAccount.externalAccountId,
      accessToken,
      refreshToken,
      status: 'connected',
      lastSyncedAt: adAccount.lastSyncedAt,
      metadata: adAccount.metadata,
      createdAt: adAccount.createdAt,
      updatedAt: adAccount.updatedAt,
    };
  }
}

/**
 * Singleton global
 */
let connectionManagerInstance: ConnectionManager | null = null;

export function getConnectionManager(): ConnectionManager {
  if (!connectionManagerInstance) {
    connectionManagerInstance = new ConnectionManager();
  }
  return connectionManagerInstance;
}
