import { prisma } from "@/lib/prisma";

interface WhatsAppConfig {
  phoneNumberId: string;
}

interface WhatsAppSendResponse {
  messages?: Array<{ id: string }>;
  error?: { message?: string };
}

export async function sendWhatsAppText(companyId: string, to: string, body: string) {
  const integration = await prisma.companyIntegration.findUnique({
    where: { companyId_type: { companyId, type: "whatsapp" } },
    select: { status: true, accessToken: true, config: true },
  });

  const config = integration?.config as WhatsAppConfig | null;
  if (integration?.status !== "connected" || !integration.accessToken || !config?.phoneNumberId) {
    throw new Error("WHATSAPP_NOT_CONFIGURED");
  }

  const response = await fetch(`https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${integration.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body } }),
  });
  const result = (await response.json()) as WhatsAppSendResponse;
  const externalId = result.messages?.[0]?.id;
  if (!response.ok || !externalId) {
    throw new Error(result.error?.message || `WHATSAPP_SEND_FAILED_${response.status}`);
  }

  return { externalId };
}
