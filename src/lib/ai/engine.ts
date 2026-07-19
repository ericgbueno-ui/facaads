import { prisma } from '@/lib/prisma';
import { RevenueService } from '@/services/revenue/revenue.service';
import { ForecastService } from '@/services/revenue/forecast.service';
import { getEventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { registerAIProvider, getAIProvider } from './provider-registry';
import { AnthropicProvider } from './providers/anthropic-provider';
import {
  buildLeadResponsePrompt,
  buildWhatsAppConversationPrompt,
  buildWhatsAppMessagePrompt,
  buildRevenueInsightPrompt,
} from './prompt-manager';
import { AnalysisResult, AIResponse, LeadMessage } from './types';

const eventBus = getEventBus();
const logger = new Logger();
const revenueService = new RevenueService(eventBus, logger);
const forecastService = new ForecastService(eventBus, logger);

const anthropicProvider = new AnthropicProvider();
registerAIProvider(anthropicProvider);

function getProvider() {
  const provider = getAIProvider();
  if (!provider) {
    throw new Error('Nenhum provedor de IA registrado');
  }
  return provider;
}

export async function generateLeadResponse(
  companyId: string,
  lead: LeadMessage
): Promise<AIResponse | null> {
  const provider = getProvider();
  const knowledge = await prisma.companyKnowledge.findUnique({
    where: { companyId },
  });

  const { system, prompt } = buildLeadResponsePrompt(knowledge, lead);
  const response = await provider.generate({ systemMessage: system, prompt, maxTokens: 1024 });

  const parsed = parseLeadResponse(response.text);

  await prisma.leadInteraction.create({
    data: {
      companyId,
      sourceType: lead.source,
      leadEmail: lead.email,
      leadPhone: lead.phone,
      leadName: lead.name,
      messageReceived: lead.message,
      aiResponse: parsed.response,
      actionTaken: parsed.actionType,
      qualificationScore: parsed.qualificationScore,
      resultType: 'lead_response',
    },
  });

  return parsed;
}

export async function analyzeConversation(
  conversationId: string,
  leadId: string
): Promise<AnalysisResult | null> {
  const provider = getProvider();
  const messages = await prisma.whatsAppMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  if (messages.length === 0) {
    return null;
  }

  const prompt = buildWhatsAppConversationPrompt(
    messages.map((m) => ({ role: m.role, content: m.content }))
  );
  const response = await provider.generate({ prompt, maxTokens: 1024 });
  const analysis = parseConversationAnalysis(response.text);

  await prisma.aIAnalysis.create({
    data: {
      companyId: (await prisma.whatsAppConversation.findUnique({ where: { id: conversationId }, select: { companyId: true } }))?.companyId || '',
      conversationId,
      leadId,
      type: 'conversation_summary',
      result: analysis as any,
      confidence: 0.85,
      model: response.model,
      tokensUsed: response.tokensUsed,
    },
  });

  await updateLeadWithAnalysis(leadId, analysis);
  return analysis;
}

export async function analyzeMessage(
  messageId: string,
  content: string,
  conversationId: string
): Promise<Partial<AnalysisResult> | null> {
  const provider = getProvider();
  const prompt = buildWhatsAppMessagePrompt(content);
  const response = await provider.generate({ prompt, maxTokens: 512 });
  const analysis = JSON.parse(response.text) as Partial<AnalysisResult>;

  await prisma.aIAnalysis.create({
    data: {
      companyId: (await prisma.whatsAppConversation.findUnique({ where: { id: conversationId }, select: { companyId: true } }))?.companyId || '',
      conversationId,
      type: 'message_sentiment',
      result: analysis as any,
      confidence: 0.8,
      model: response.model,
      tokensUsed: response.tokensUsed,
    },
  });

  return analysis;
}

export async function generateRevenueInsight(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  const provider = getProvider();
  const knowledge = await prisma.companyKnowledge.findUnique({ where: { companyId } });
  const trends = await revenueService.detectTrends(companyId, startDate, endDate);
  const anomalies = await revenueService.detectAnomalies(companyId, startDate, endDate);
  const prompt = buildRevenueInsightPrompt(knowledge, trends, anomalies);

  const response = await provider.generate({ prompt, maxTokens: 1024, temperature: 0.3 });

  return {
    summary: response.text,
    model: response.model,
    tokensUsed: response.tokensUsed,
  };
}

function parseLeadResponse(text: string): AIResponse {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in lead response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      response: parsed.response || text,
      actionType: parsed.actionType || 'assign_human',
      qualificationScore: Math.min(100, Math.max(0, parsed.qualificationScore || 0)),
      suggestedFollowUp: parsed.suggestedFollowUp,
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.8)),
    };
  } catch (error) {
    logger.error('Error parsing lead response', error);
    return {
      response: text,
      actionType: 'assign_human',
      qualificationScore: 50,
      confidence: 0.5,
    };
  }
}

function parseConversationAnalysis(text: string): AnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in conversation analysis');
  }
  return JSON.parse(jsonMatch[0]) as AnalysisResult;
}

async function updateLeadWithAnalysis(leadId: string, analysis: AnalysisResult) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { stageId: true, pipelineId: true },
    });

    if (!lead) return;

    let newStageId = lead.stageId;

    if (analysis.purchaseLikelihood >= 80) {
      const negotiationStage = await prisma.cRMStage.findFirst({
        where: {
          pipelineId: lead.pipelineId,
          name: { contains: 'Negociação' },
        },
      });
      if (negotiationStage) newStageId = negotiationStage.id;
    } else if (analysis.purchaseLikelihood >= 50) {
      const quoteStage = await prisma.cRMStage.findFirst({
        where: {
          pipelineId: lead.pipelineId,
          name: { contains: 'Orçamento' },
        },
      });
      if (quoteStage) newStageId = quoteStage.id;
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        stageId: newStageId,
        customFields: {
          sentiment: analysis.sentiment,
          purchaseLikelihood: analysis.purchaseLikelihood,
          objections: analysis.objections,
          lastAnalysis: new Date(),
        },
      },
    });
  } catch (error) {
    logger.error('Erro ao atualizar lead com análise', error);
  }
}
