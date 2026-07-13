import { AdChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendMetaPurchaseEvent } from "./meta-capi";
import { sendGoogleConversion } from "./google-capi";
import { sendTikTokConversion } from "./tiktok-api";

/**
 * Envia eventos de conversão offline (ConversionEvent) de volta para as plataformas de ads
 * pra otimização de lookalike/budget allocation.
 */
export async function dispatchConversionEvent(conversionEventId: string): Promise<void> {
  const event = await prisma.conversionEvent.findUniqueOrThrow({
    where: { id: conversionEventId },
  });

  try {
    if (event.channel === AdChannel.META) {
      // Enviar via Meta Conversions API
      const result = await sendMetaPurchaseEvent({
        value: Number(event.amount ?? 0),
        eventTime: event.createdAt,
        metadata: event.metadata as Record<string, any>,
      });

      await prisma.conversionEvent.update({
        where: { id: event.id },
        data: {
          pushBackStatus: "sent",
          externalId: result.externalEventId,
        },
      });
      return;
    }

    if (event.channel === AdChannel.GOOGLE) {
      // Enviar via Google Ads Conversions API
      const result = await sendGoogleConversion({
        value: Number(event.amount ?? 0),
        eventTime: event.createdAt,
        metadata: event.metadata as Record<string, any>,
        campaignId: event.campaignId ?? undefined,
      });

      await prisma.conversionEvent.update({
        where: { id: event.id },
        data: {
          pushBackStatus: "sent",
          externalId: result.externalEventId,
        },
      });
      return;
    }

    if (event.channel === AdChannel.TIKTOK) {
      // Enviar via TikTok Conversions API
      const result = await sendTikTokConversion({
        value: Number(event.amount ?? 0),
        eventTime: event.createdAt,
        metadata: event.metadata as Record<string, any>,
        campaignId: event.campaignId ?? undefined,
      });

      await prisma.conversionEvent.update({
        where: { id: event.id },
        data: {
          pushBackStatus: "sent",
          externalId: result.externalEventId,
        },
      });
      return;
    }

    if (event.channel === AdChannel.SHOPEE) {
      // TODO: Shopee Ads (confirmar se há API para offline conversions)
      await prisma.conversionEvent.update({
        where: { id: event.id },
        data: {
          pushBackStatus: "pending",
          pushBackError: "Shopee push-back não implementado ainda",
        },
      });
      return;
    }
  } catch (err) {
    await prisma.conversionEvent.update({
      where: { id: event.id },
      data: {
        pushBackStatus: "failed",
        pushBackError: (err as Error).message,
      },
    });
  }
}
