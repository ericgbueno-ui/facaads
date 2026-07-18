import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWebhookToken } from "@/lib/whatsapp/auth";

export const dynamic = "force-dynamic";

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || "seu_token_aqui";

/**
 * GET /api/webhooks/whatsapp
 * Validação inicial do webhook (Meta requisita)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Verificação do webhook
    if (mode === "subscribe" && token) {
      if (validateWebhookToken(token, WEBHOOK_VERIFY_TOKEN)) {
        return new NextResponse(challenge, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Token inválido" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Requisição inválida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro na validação do webhook:", error);
    return NextResponse.json(
      { error: "Erro ao validar webhook" },
      { status: 500 }
    );
  }
}

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string };
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
    }>;
  }>;
}

/**
 * POST /api/webhooks/whatsapp
 * Recebe mensagens do WhatsApp Business API
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WhatsAppWebhookPayload;

    // Validar estrutura
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json(
        { error: "Objeto inválido" },
        { status: 400 }
      );
    }

    // Processar cada entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        // Processar mensagens
        if (value.messages) {
          await processMessages(value, value.messages);
        }

        // Processar status (entregue, lido, etc)
        if (value.statuses) {
          await processStatuses(value.metadata.phone_number_id, value.statuses);
        }
      }
    }

    // Retornar 200 para Meta não retentar
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao processar webhook WhatsApp:", error);
    // Retornar 200 mesmo em erro para não retentar
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

/**
 * Processar mensagens recebidas
 */
async function processMessages(
  metadata: any,
  messages: WhatsAppMessage[]
) {
  for (const message of messages) {
    try {
      // Encontrar integração pela phone_number_id
      const integration = await prisma.companyIntegration.findFirst({
        where: {
          type: "whatsapp",
          config: {
            path: ["phoneNumberId"],
            equals: metadata.phone_number_id,
          },
        },
        select: {
          companyId: true,
          config: true,
        },
      });

      if (!integration) {
        console.warn(
          `Integração WhatsApp não encontrada para: ${metadata.phone_number_id}`
        );
        continue;
      }

      const companyId = integration.companyId;
      const phoneNumber = message.from;

      // Encontrar ou criar conversa
      let conversation = await prisma.whatsAppConversation.findUnique({
        where: {
          companyId_phoneNumber: {
            companyId,
            phoneNumber,
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.whatsAppConversation.create({
          data: {
            companyId,
            phoneNumber,
            status: "open",
          },
        });

        // Encontrar ou criar lead associado
        const existingLead = await prisma.lead.findFirst({
          where: {
            companyId,
            whatsapp: phoneNumber,
          },
        });

        if (!existingLead) {
          // Obter pipeline padrão
          const pipeline = await prisma.cRMPipeline.findFirst({
            where: { companyId, isDefault: true },
          });

          if (pipeline) {
            const firstStage = await prisma.cRMStage.findFirst({
              where: { pipelineId: pipeline.id },
              orderBy: { order: "asc" },
            });

            if (firstStage) {
              await prisma.lead.create({
                data: {
                  companyId,
                  name: `Cliente ${phoneNumber.slice(-4)}`,
                  whatsapp: phoneNumber,
                  source: "whatsapp",
                  pipelineId: pipeline.id,
                  stageId: firstStage.id,
                },
              });
            }
          }
        }
      }

      // Salvar mensagem
      const messageContent = message.text?.body || `[${message.type}]`;

      const savedMessage = await prisma.whatsAppMessage.create({
        data: {
          conversationId: conversation.id,
          role: "user",
          content: messageContent,
          externalId: message.id,
          type: message.type,
          createdAt: new Date(parseInt(message.timestamp) * 1000),
        },
      });

      // Atualizar conversa
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      // Enfileirar para análise de IA
      // TODO: Implementar fila (Bull/Redis)
      console.log(`Mensagem recebida: ${conversation.id} - ${savedMessage.id}`);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    }
  }
}

/**
 * Processar status de mensagens
 */
async function processStatuses(phoneNumberId: string, statuses: any[]) {
  for (const status of statuses) {
    try {
      // Atualizar status da mensagem se necessário
      console.log(`Status atualizado: ${status.id} -> ${status.status}`);
    } catch (error) {
      console.error("Erro ao processar status:", error);
    }
  }
}
