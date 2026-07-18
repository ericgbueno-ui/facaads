/**
 * EVENT BUS
 * Sistema de eventos para comunicação entre componentes
 * Desacopla providers, services e controllers
 */

import { IntegrationEvent } from '../types';

type EventHandler = (data: any) => void | Promise<void>;

export interface EventSubscription {
  event: string;
  handler: EventHandler;
}

export class EventBus {
  private subscribers: Map<string, EventHandler[]> = new Map();
  private eventHistory: IntegrationEvent[] = [];
  private maxHistorySize: number = 1000;

  /**
   * Subscreve a um evento
   */
  on(event: string, handler: EventHandler): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(handler);
  }

  /**
   * Subscreve a um evento apenas uma vez
   */
  once(event: string, handler: EventHandler): void {
    const wrapper: EventHandler = async (data) => {
      await handler(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Desinscreve de um evento
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(event);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Desinscreve todos os handlers de um evento
   */
  removeAll(event?: string): void {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }

  /**
   * Emite um evento
   */
  async emit(event: string, data: any): Promise<void> {
    const handlers = this.subscribers.get(event);

    if (!handlers || handlers.length === 0) {
      console.warn(`Nenhum subscriber para evento: ${event}`);
      return;
    }

    // Adiciona ao histórico
    this.addToHistory({
      id: `${Date.now()}_${Math.random()}`,
      type: event as any,
      provider: data.type || 'system',
      connectionId: data.connectionId || '',
      companyId: data.companyId || '',
      data,
      timestamp: new Date(),
      severity: 'info',
    });

    // Executa handlers em paralelo (com Promise.all para capturar erros)
    const results = handlers.map((handler) =>
      Promise.resolve()
        .then(() => handler(data))
        .catch((error) => {
          console.error(`Erro em subscriber de ${event}:`, error);
        })
    );

    await Promise.all(results);
  }

  /**
   * Emite um evento e aguarda a resposta
   */
  async emitAsync(event: string, data: any): Promise<any[]> {
    const handlers = this.subscribers.get(event);

    if (!handlers || handlers.length === 0) {
      return [];
    }

    return Promise.all(handlers.map((handler) => handler(data)));
  }

  /**
   * Lista eventos disponíveis
   */
  listEvents(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Conta subscribers de um evento
   */
  subscriberCount(event: string): number {
    return this.subscribers.get(event)?.length || 0;
  }

  /**
   * Retorna histórico de eventos
   */
  getHistory(limit: number = 100): IntegrationEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Limpa histórico
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Pesquisa no histórico
   */
  searchHistory(filter: {
    event?: string;
    provider?: string;
    companyId?: string;
    since?: Date;
  }): IntegrationEvent[] {
    return this.eventHistory.filter((event) => {
      if (filter.event && event.type !== filter.event) return false;
      if (filter.provider && event.provider !== filter.provider) return false;
      if (filter.companyId && event.companyId !== filter.companyId) return false;
      if (filter.since && event.timestamp < filter.since) return false;
      return true;
    });
  }

  /**
   * Adiciona evento ao histórico
   */
  private addToHistory(event: IntegrationEvent): void {
    this.eventHistory.push(event);

    // Limita tamanho do histórico
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Exporta estatísticas
   */
  getStats() {
    return {
      events: this.listEvents(),
      subscribers: Array.from(this.subscribers.entries()).reduce(
        (acc, [event, handlers]) => {
          acc[event] = handlers.length;
          return acc;
        },
        {} as Record<string, number>
      ),
      historySize: this.eventHistory.length,
      maxHistorySize: this.maxHistorySize,
    };
  }

  /**
   * Define tamanho máximo do histórico
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    if (this.eventHistory.length > size) {
      this.eventHistory = this.eventHistory.slice(-size);
    }
  }
}

/**
 * Singleton global
 */
let eventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
  }
  return eventBusInstance;
}

export function createEventBus(): EventBus {
  return new EventBus();
}
