import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic();

interface AnalysisResult {
  sentiment: "positive" | "neutral" | "negative";
  purchaseLikelihood: number; // 0-100
  hasObjection: boolean;
  objections: string[];
  suggestedResponse: string;
  nextAction: "send_offer" | "more_info" | "callback" | "wait" | "follow_up";
  summary: string;
  keywords: string[];
}

/**
 * Analisar conversa de WhatsApp com Claude
 */
export async function analyzeConversation(
  conversationId: string,
  leadId: string
): Promise<AnalysisResult | null> {
  try {
    // Buscar mensagens da conversa
    const messages = await prisma.whatsAppMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20, // Últimas 20 mensagens
    });

    if (messages.length === 0) {
      return null;
    }

    // Formatar conversa para prompt
    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Cliente" : "Empresa"}: ${m.content}`)
      .join("\n");

    // Prompt de análise
    const prompt = `Analise esta conversa de WhatsApp entre um vendedor e um cliente potencial:

${conversationText}

Retorne APENAS um JSON válido (sem markdown, sem explicações) com a seguinte estrutura:
{
  "sentiment": "positive" ou "neutral" ou "negative",
  "purchaseLikelihood": número de 0 a 100,
  "hasObjection": true ou false,
  "objections": ["lista", "de", "objeções"],
  "suggestedResponse": "sugestão breve de resposta em português",
  "nextAction": "send_offer" ou "more_info" ou "callback" ou "wait" ou "follow_up",
  "summary": "resumo breve da conversa em português",
  "keywords": ["palavra1", "palavra2", "palavra3"]
}

Regras importantes:
- purchaseLikelihood: 0-30% (não interessado), 30-60% (interessado), 60-85% (bem interessado), 85-100% (muito propenso)
- sentiment: positivo (usa palavras boas, interesse), neutro (questionador, indeciso), negativo (reclamações, desinteresse)
- objections: lista comum: "price", "time", "quality", "delivery", "payment", "warranty"
- nextAction: baseado no estado da conversa (fazer oferta, informar mais, agendar, aguardar, acompanhar)
- Responda APENAS com o JSON, sem nenhuma outra texto`;

    // Chamar Claude
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extrair resposta
    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON
    const analysis = JSON.parse(responseText) as AnalysisResult;

    // Salvar análise no DB
    await prisma.aIAnalysis.create({
      data: {
        conversationId,
        leadId,
        type: "conversation_summary",
        result: analysis as any,
        confidence: 0.85,
        model: "claude-opus-4-8",
        tokensUsed: response.usage.output_tokens,
      },
    });

    // Atualizar lead com informações da análise
    await updateLeadWithAnalysis(leadId, analysis);

    return analysis;
  } catch (error) {
    console.error("Erro ao analisar conversa:", error);
    return null;
  }
}

/**
 * Analisar mensagem individual
 */
export async function analyzeMessage(
  messageId: string,
  content: string,
  conversationId: string
): Promise<Partial<AnalysisResult> | null> {
  try {
    const prompt = `Analise esta mensagem de uma conversa de WhatsApp:

Mensagem: "${content}"

Retorne APENAS um JSON com:
{
  "sentiment": "positive" ou "neutral" ou "negative",
  "hasObjection": true ou false,
  "objectionType": "price" ou "time" ou "quality" ou "delivery" ou "payment" ou null,
  "suggestedResponse": "sugestão de resposta em português",
  "keywords": ["palavra1", "palavra2"]
}`;

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";
    const analysis = JSON.parse(responseText);

    // Salvar análise
    await prisma.aIAnalysis.create({
      data: {
        conversationId,
        type: "message_sentiment",
        result: analysis,
        confidence: 0.8,
        model: "claude-opus-4-8",
        tokensUsed: response.usage.output_tokens,
      },
    });

    return analysis;
  } catch (error) {
    console.error("Erro ao analisar mensagem:", error);
    return null;
  }
}

/**
 * Atualizar lead com dados da análise
 */
async function updateLeadWithAnalysis(
  leadId: string,
  analysis: AnalysisResult
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { stageId: true, pipelineId: true },
    });

    if (!lead) return;

    // Determinar estágio com base na análise
    let newStageId = lead.stageId;

    if (analysis.purchaseLikelihood >= 80) {
      // Cliente muito propenso a comprar - avançar para "Negociação"
      const negotiationStage = await prisma.cRMStage.findFirst({
        where: {
          pipelineId: lead.pipelineId,
          name: { contains: "Negociação" },
        },
      });
      if (negotiationStage) newStageId = negotiationStage.id;
    } else if (analysis.purchaseLikelihood >= 50) {
      // Interessado - avançar para "Orçamento"
      const quoteStage = await prisma.cRMStage.findFirst({
        where: {
          pipelineId: lead.pipelineId,
          name: { contains: "Orçamento" },
        },
      });
      if (quoteStage) newStageId = quoteStage.id;
    }

    // Atualizar lead
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
    console.error("Erro ao atualizar lead:", error);
  }
}
