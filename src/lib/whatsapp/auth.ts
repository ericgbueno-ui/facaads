import { prisma } from "@/lib/prisma";

/**
 * Obter token de acesso do WhatsApp para uma empresa
 */
export async function getWhatsAppAccessToken(
  companyId: string
): Promise<string | null> {
  try {
    const integration = await prisma.companyIntegration.findUnique({
      where: {
        companyId_type: {
          companyId,
          type: "whatsapp",
        },
      },
      select: {
        accessToken: true,
        status: true,
      },
    });

    if (!integration || integration.status !== "connected") {
      return null;
    }

    // Em produção, descriptografar o token
    return integration.accessToken;
  } catch (error) {
    console.error("Erro ao obter token WhatsApp:", error);
    return null;
  }
}

/**
 * Salvar configuração do WhatsApp
 */
export async function saveWhatsAppConfig(
  companyId: string,
  config: {
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;
  }
) {
  try {
    const integration = await prisma.companyIntegration.upsert({
      where: {
        companyId_type: {
          companyId,
          type: "whatsapp",
        },
      },
      update: {
        accessToken: config.accessToken,
        config: {
          phoneNumberId: config.phoneNumberId,
          businessAccountId: config.businessAccountId,
        },
        status: "connected",
        connectedAt: new Date(),
      },
      create: {
        companyId,
        type: "whatsapp",
        name: "WhatsApp Business",
        accessToken: config.accessToken,
        config: {
          phoneNumberId: config.phoneNumberId,
          businessAccountId: config.businessAccountId,
        },
        status: "connected",
        connectedAt: new Date(),
      },
    });

    return integration;
  } catch (error) {
    console.error("Erro ao salvar config WhatsApp:", error);
    throw error;
  }
}

/**
 * Validar webhook token do WhatsApp
 */
export function validateWebhookToken(
  token: string,
  verifyToken: string
): boolean {
  return token === verifyToken;
}
