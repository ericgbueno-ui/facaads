import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  AIProviderRequest,
  AIProviderResponse,
  AIProviderType,
} from '../types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class AnthropicProvider implements AIProvider {
  getType(): AIProviderType {
    return 'ANTHROPIC';
  }

  getName(): string {
    return 'Anthropic Claude';
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    const model = request.model || 'claude-opus-4-8';
    const maxTokens = request.maxTokens ?? 1024;

    const messages = [] as Array<{ role: string; content: string }>;
    if (request.systemMessage) {
      messages.push({ role: 'system', content: request.systemMessage });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: request.temperature ?? 0.3,
      messages,
    });

    const text = response.content?.[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage?.output_tokens ?? 0;

    return {
      text,
      model,
      tokensUsed,
      raw: response,
    };
  }
}
