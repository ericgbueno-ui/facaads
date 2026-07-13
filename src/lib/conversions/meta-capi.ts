/**
 * Meta Conversions API (CAPI) - Envia eventos de conversão offline para otimizar campanhas
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api/
 */

import { prisma } from "@/lib/prisma";

interface CapiEventData {
  value: number;
  eventTime: Date;
  metadata?: Record<string, any>;
  campaignId?: string; // Para buscar o AdAccount
}

interface CapiEventResponse {
  externalEventId: string;
}

interface CapiPayloadUser {
  phone?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/**
 * Envia um evento de compra (Purchase) via Meta CAPI
 * Usa o Meta Conversions API v21.0
 */
export async function sendMetaPurchaseEvent(
  data: CapiEventData
): Promise<CapiEventResponse> {
  // Buscar AdAccount para obter credentials
  let accessToken: string | null = null;
  let pixelId: string | null = null;

  if (data.campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
      include: { adAccount: true },
    });

    if (campaign?.adAccount) {
      // TODO: Buscar tokens do AdAccount (por enquanto usar mock)
      // accessToken = campaign.adAccount.metaAccessToken;
      // pixelId = campaign.adAccount.metaPixelId;
    }
  }

  // Se não temos credentials, apenas simular
  if (!accessToken || !pixelId) {
    const externalEventId = `capi_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    console.log(
      `[Meta CAPI] Evento simulado (sem credentials): ${data.value} BRL`
    );
    return { externalEventId };
  }

  // Construir payload CAPI
  const user_data: CapiPayloadUser = {};
  if (data.metadata?.email) user_data.email = data.metadata.email;
  if (data.metadata?.phone) user_data.phone = data.metadata.phone;
  if (data.metadata?.firstName) user_data.first_name = data.metadata.firstName;
  if (data.metadata?.lastName) user_data.last_name = data.metadata.lastName;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(data.eventTime.getTime() / 1000),
        event_source_url: data.metadata?.sourceUrl,
        user_data,
        custom_data: {
          value: data.value.toFixed(2),
          currency: "BRL",
        },
        external_id: data.metadata?.externalId,
      },
    ],
    access_token: accessToken,
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = (await response.json()) as any;

    if (!response.ok) {
      throw new Error(
        `Meta CAPI error: ${json.error?.message || response.statusText}`
      );
    }

    const externalEventId = json.events_received
      ? `capi_${json.fbtrace_id}`
      : `capi_${Date.now()}`;

    console.log(`[Meta CAPI] Evento enviado: ${externalEventId}`);
    return { externalEventId };
  } catch (err) {
    console.error("[Meta CAPI] Falha ao enviar evento:", err);
    throw err;
  }
}
