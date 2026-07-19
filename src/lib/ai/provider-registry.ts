import { AIProvider, AIProviderType } from './types';

export class AIProviderRegistry {
  private providers: Map<AIProviderType, AIProvider> = new Map();

  register(provider: AIProvider): void {
    const type = provider.getType();
    if (this.providers.has(type)) {
      throw new Error(`AI provider ${type} already registered`);
    }

    this.providers.set(type, provider);
    console.log(`✅ AI provider registered: ${type}`);
  }

  get(type?: AIProviderType): AIProvider | null {
    if (type) {
      return this.providers.get(type) ?? null;
    }

    return this.getDefault();
  }

  getDefault(): AIProvider | null {
    return this.providers.values().next().value ?? null;
  }

  list(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }
}

const registry = new AIProviderRegistry();

export function getAIProviderRegistry() {
  return registry;
}

export function registerAIProvider(provider: AIProvider) {
  registry.register(provider);
}

export function getAIProvider(type?: AIProviderType): AIProvider | null {
  return registry.get(type);
}
