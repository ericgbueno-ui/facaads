import { AnalysisResult, AIResponse, LeadMessage } from './types';

export function buildCompanyKnowledgeContext(knowledge: any): string {
  if (!knowledge) {
    return 'Nenhum dado de conhecimento da empresa disponível.';
  }

  const sections: string[] = [];

  if (knowledge.websiteUrl) {
    sections.push(`Website: ${knowledge.websiteUrl}`);
  }
  if (knowledge.instagramHandle) {
    sections.push(`Instagram: @${knowledge.instagramHandle}`);
  }
  if (knowledge.websiteContent) {
    sections.push(`Website content: ${knowledge.websiteContent}`);
  }
  if (knowledge.products && Array.isArray(knowledge.products)) {
    sections.push(`Produtos: ${JSON.stringify(knowledge.products)}`);
  }
  if (knowledge.services && Array.isArray(knowledge.services)) {
    sections.push(`Serviços: ${JSON.stringify(knowledge.services)}`);
  }
  if (knowledge.mission) {
    sections.push(`Missão: ${knowledge.mission}`);
  }
  if (knowledge.values) {
    sections.push(`Valores: ${JSON.stringify(knowledge.values)}`);
  }
  if (knowledge.history) {
    sections.push(`História: ${knowledge.history}`);
  }
  if (knowledge.businessHours) {
    sections.push(`Horários: ${JSON.stringify(knowledge.businessHours)}`);
  }
  if (knowledge.phone) {
    sections.push(`Telefone: ${knowledge.phone}`);
  }
  if (knowledge.email) {
    sections.push(`Email: ${knowledge.email}`);
  }

  return sections.join('\n');
}

export function buildLeadResponsePrompt(
  knowledge: any,
  lead: LeadMessage
): { system: string; prompt: string } {
  const system = `Você é um assistente de vendas experiente da empresa.
Use o conhecimento disponível da empresa para orientar respostas, qualificações e próximas ações.`;

  const prompt = `CONHECIMENTO DA EMPRESA:
${buildCompanyKnowledgeContext(knowledge)}

NOVO LEAD:
Nome: ${lead.name ?? 'Desconhecido'}
Email: ${lead.email ?? 'Não informado'}
Telefone: ${lead.phone ?? 'Não informado'}
Origem: ${lead.source}

MENSAGEM:
${lead.message}

Responda apenas com JSON válido com a seguinte estrutura:
${JSON.stringify(
    {
      response: 'texto de resposta em português',
      actionType: 'send_response|redirect_whatsapp|assign_human|schedule_demo',
      qualificationScore: 0,
      suggestedFollowUp: 'se houver',
      confidence: 0.0,
    },
    null,
    2
  )}
`; 

  return { system, prompt };
}

export function buildWhatsAppConversationPrompt(messages: Array<{ role: string; content: string }>) {
  const conversation = messages
    .map((message) => `${message.role === 'user' ? 'Cliente' : 'Empresa'}: ${message.content}`)
    .join('\n');

  return `Analise esta conversa de WhatsApp entre vendedor e cliente:

${conversation}

Responda apenas com JSON válido, sem explicações, com a estrutura:
${JSON.stringify(
    {
      sentiment: 'positive|neutral|negative',
      purchaseLikelihood: 0,
      hasObjection: false,
      objections: ['string'],
      suggestedResponse: 'resposta breve em português',
      nextAction: 'send_offer|more_info|callback|wait|follow_up',
      summary: 'resumo breve',
      keywords: ['palavra1', 'palavra2'],
    },
    null,
    2
  )}`;
}

export function buildWhatsAppMessagePrompt(content: string) {
  return `Analise esta mensagem de WhatsApp e retorne apenas JSON válido com a seguinte estrutura:
${JSON.stringify(
    {
      sentiment: 'positive|neutral|negative',
      hasObjection: false,
      objectionType: 'price|time|quality|delivery|payment|null',
      suggestedResponse: 'resposta breve em português',
      keywords: ['palavra1', 'palavra2'],
    },
    null,
    2
  )}

Mensagem: ${content}`;
}

export function buildRevenueInsightPrompt(
  knowledge: any,
  trends: Array<Record<string, any>>,
  anomalies: Array<Record<string, any>>
) {
  return `Use o contexto da empresa e dados de receita para gerar um resumo acionável e recomendações.

CONHECIMENTO DA EMPRESA:
${buildCompanyKnowledgeContext(knowledge)}

TENDÊNCIAS:
${JSON.stringify(trends, null, 2)}

ANOMALIAS:
${JSON.stringify(anomalies, null, 2)}

Responda com um texto em português contendo:
- resumo da situação atual
- principais riscos identificados
- sugestões táticas para melhorar vendas e ROAS
- recomendações de próximos passos
`;
}
