import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic();

interface LeadMessage {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  source: "google" | "instagram" | "website" | "email" | "whatsapp";
}

interface AIResponse {
  response: string;
  actionType: "send_response" | "redirect_whatsapp" | "assign_human" | "schedule_demo";
  qualificationScore: number; // 0-100
  suggestedFollowUp?: string;
  confidence: number; // 0-1
}

/**
 * Gerar resposta automática usando IA
 */
export async function generateLeadResponse(
  companyId: string,
  lead: LeadMessage
): Promise<AIResponse | null> {
  try {
    // Buscar knowledge base da empresa
    const knowledge = await prisma.companyKnowledge.findUnique({
      where: { companyId },
    });

    if (!knowledge) {
      return null;
    }

    // Montar contexto para a IA
    const systemPrompt = buildSystemPrompt(knowledge);

    // Chamar Claude
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(lead),
        },
      ],
    });

    // Extrair resposta
    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse resposta estruturada
    const aiResponse = parseResponse(responseText);

    // Salvar interação
    await prisma.leadInteraction.create({
      data: {
        companyId,
        sourceType: lead.source,
        leadEmail: lead.email,
        leadPhone: lead.phone,
        leadName: lead.name,
        messageReceived: lead.message,
        aiResponse: aiResponse.response,
        actionTaken: aiResponse.actionType,
        qualificationScore: aiResponse.qualificationScore,
      },
    });

    return aiResponse;
  } catch (error) {
    console.error("Erro ao gerar resposta:", error);
    return null;
  }
}

/**
 * Construir system prompt com contexto da empresa
 */
function buildSystemPrompt(knowledge: any): string {
  return `Você é um assistente de vendas experiente da empresa.

CONHECIMENTO DA EMPRESA:
${JSON.stringify(knowledge, null, 2)}

INSTRUÇÕES CRÍTICAS:
1. Responda BASEADO NO CONHECIMENTO DA EMPRESA
2. Seja amigável, profissional e em português
3. Se pergunta simples (preço, horário) → responda direto
4. Se lead qualificado → redirecione para WhatsApp
5. Se pergunta técnica complexa → atribua para humano
6. Sempre termine com CTA (call-to-action)

RESPONDA EM JSON COM:
{
  "response": "sua resposta aqui",
  "actionType": "send_response|redirect_whatsapp|assign_human|schedule_demo",
  "qualificationScore": 0-100,
  "suggestedFollowUp": "se necessário",
  "confidence": 0-1
}`;
}

/**
 * Construir prompt do usuário
 */
function buildUserPrompt(lead: LeadMessage): string {
  return `NOVO LEAD:
Origem: ${lead.source}
Nome: ${lead.name || "Desconhecido"}
Email: ${lead.email || "Não fornecido"}
Telefone: ${lead.phone || "Não fornecido"}

MENSAGEM:
${lead.message}

Gere uma resposta automática em JSON.`;
}

/**
 * Parse da resposta JSON da IA
 */
function parseResponse(text: string): AIResponse {
  try {
    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      response: parsed.response || "",
      actionType: parsed.actionType || "send_response",
      qualificationScore: Math.min(100, Math.max(0, parsed.qualificationScore || 0)),
      suggestedFollowUp: parsed.suggestedFollowUp,
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.8)),
    };
  } catch (error) {
    console.error("Erro ao parsear resposta:", error);
    // Fallback
    return {
      response: text,
      actionType: "assign_human",
      qualificationScore: 50,
      confidence: 0.5,
    };
  }
}

/**
 * Determinar se deve redirecionar para WhatsApp
 */
export function shouldRedirectToWhatsApp(
  actionType: string,
  qualificationScore: number
): boolean {
  return actionType === "redirect_whatsapp" || qualificationScore >= 60;
}

/**
 * Gerar link WhatsApp
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}
