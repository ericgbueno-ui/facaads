import { NextRequest, NextResponse } from "next/server";
import { AdChannel, ConversionSourceType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dispatchConversionEvent } from "@/lib/conversions/dispatch";

const ConversionSchema = z.object({
  channel: z.enum(["META", "GOOGLE", "TIKTOK", "SHOPEE"]),
  campaign_id: z.string().optional(),
  source_type: z.enum(["SHOPIFY", "CRM", "TYPEFORM", "API", "MANUAL", "OTHER"]),
  amount: z.number().positive().optional(),
  external_id: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

type ConversionPayload = z.infer<typeof ConversionSchema>;

/**
 * POST /api/webhooks/conversion
 *
 * Recebe eventos de conversão offline de qualquer origem (Shopify, CRM, Typeform, etc)
 * e os vincula a campanhas/canais para otimização do funil.
 *
 * Exemplo:
 * {
 *   "channel": "GOOGLE",
 *   "campaign_id": "campaign-123",
 *   "source_type": "SHOPIFY",
 *   "amount": 500.00,
 *   "external_id": "order-456",
 *   "metadata": { "email": "user@example.com", "phone": "+55 11 98765-4321" }
 * }
 */
export async function POST(req: NextRequest) {
  // Validar token simples (pode ser melhorado com API keys por origem)
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== process.env.CONVERSION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = ConversionSchema.parse(body);

    const event = await prisma.conversionEvent.create({
      data: {
        channel: data.channel as AdChannel,
        campaignId: data.campaign_id,
        sourceType: data.source_type as ConversionSourceType,
        amount: data.amount ? new Prisma.Decimal(data.amount) : null,
        externalId: data.external_id,
        metadata: data.metadata,
        pushBackStatus: "pending",
      },
    });

    // Disparar push-back assincrono
    dispatchConversionEvent(event.id).catch((err) => {
      console.error(`[conversion-webhook] falha ao despachar ${event.id}:`, err);
    });

    return NextResponse.json({ ok: true, event_id: event.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
