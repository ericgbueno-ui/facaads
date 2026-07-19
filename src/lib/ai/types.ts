export type AIProviderType = 'ANTHROPIC';

export interface AIProviderRequest {
  systemMessage?: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProviderResponse {
  text: string;
  model: string;
  tokensUsed: number;
  raw: any;
}

export interface AIProvider {
  getType(): AIProviderType;
  getName(): string;
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
}

export interface LeadMessage {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  source: 'google' | 'instagram' | 'website' | 'email' | 'whatsapp';
}

export interface AIResponse {
  response: string;
  actionType: 'send_response' | 'redirect_whatsapp' | 'assign_human' | 'schedule_demo';
  qualificationScore: number;
  suggestedFollowUp?: string;
  confidence: number;
}

export interface AnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  purchaseLikelihood: number;
  hasObjection: boolean;
  objections: string[];
  suggestedResponse: string;
  nextAction: 'send_offer' | 'more_info' | 'callback' | 'wait' | 'follow_up';
  summary: string;
  keywords: string[];
}
