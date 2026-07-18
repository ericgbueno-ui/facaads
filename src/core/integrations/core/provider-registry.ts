/**
 * PROVIDER REGISTRY
 * Gerencia o registro de todos os providers disponíveis
 * Permite adicionar novos providers sem alterar a arquitetura
 */

import { IProvider, ProviderType } from '../types';

export interface RegisteredProvider {
  type: ProviderType;
  name: string;
  version: string;
  provider: IProvider;
  enabled: boolean;
  createdAt: Date;
}

export class ProviderRegistry {
  private providers: Map<ProviderType, RegisteredProvider> = new Map();

  /**
   * Registra um novo provider
   */
  register(provider: IProvider): void {
    const type = provider.getType();

    if (this.providers.has(type)) {
      throw new Error(`Provider ${type} já está registrado`);
    }

    this.providers.set(type, {
      type,
      name: provider.getName(),
      version: provider.getVersion(),
      provider,
      enabled: true,
      createdAt: new Date(),
    });

    console.log(`✅ Provider ${type} registrado com sucesso`);
  }

  /**
   * Retorna um provider pelo tipo
   */
  get(type: ProviderType): IProvider | null {
    const registered = this.providers.get(type);
    if (!registered || !registered.enabled) {
      return null;
    }
    return registered.provider;
  }

  /**
   * Verifica se um provider existe e está ativado
   */
  has(type: ProviderType): boolean {
    const registered = this.providers.get(type);
    return registered ? registered.enabled : false;
  }

  /**
   * Lista todos os providers registrados
   */
  listAll(): RegisteredProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Lista apenas providers ativados
   */
  listEnabled(): RegisteredProvider[] {
    return this.listAll().filter((p) => p.enabled);
  }

  /**
   * Ativa um provider
   */
  enable(type: ProviderType): void {
    const registered = this.providers.get(type);
    if (registered) {
      registered.enabled = true;
      console.log(`✅ Provider ${type} ativado`);
    }
  }

  /**
   * Desativa um provider
   */
  disable(type: ProviderType): void {
    const registered = this.providers.get(type);
    if (registered) {
      registered.enabled = false;
      console.log(`❌ Provider ${type} desativado`);
    }
  }

  /**
   * Retorna informações de um provider
   */
  getInfo(type: ProviderType): RegisteredProvider | null {
    return this.providers.get(type) || null;
  }

  /**
   * Conta providers registrados
   */
  count(): number {
    return this.providers.size;
  }

  /**
   * Conta providers ativados
   */
  countEnabled(): number {
    return this.listEnabled().length;
  }

  /**
   * Limpa o registro (para testes)
   */
  clear(): void {
    this.providers.clear();
  }

  /**
   * Exporta configuração para logging
   */
  export(): Record<string, any> {
    return {
      total: this.count(),
      enabled: this.countEnabled(),
      providers: Array.from(this.providers.values()).map((p) => ({
        type: p.type,
        name: p.name,
        version: p.version,
        enabled: p.enabled,
      })),
    };
  }
}

/**
 * Singleton global
 */
let registryInstance: ProviderRegistry | null = null;

export function getProviderRegistry(): ProviderRegistry {
  if (!registryInstance) {
    registryInstance = new ProviderRegistry();
  }
  return registryInstance;
}

export function createProviderRegistry(): ProviderRegistry {
  return new ProviderRegistry();
}
