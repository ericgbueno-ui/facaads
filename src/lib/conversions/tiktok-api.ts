/**
 * TikTok Conversions API
 * Docs: https://business-api.tiktok.com/marketing_api_docs?id=1701890900352001
 */

interface TikTokConversionData {
  value: number;
  eventTime: Date;
  metadata?: Record<string, any>;
  campaignId?: string;
}

interface TikTokConversionResponse {
  externalEventId: string;
}

/**
 * Envia um evento de conversão offline via TikTok Conversions API
 * TODO: Implementar com TikTok Business API autenticado
 */
export async function sendTikTokConversion(
  data: TikTokConversionData
): Promise<TikTokConversionResponse> {
  // Por enquanto apenas simular
  const externalEventId = `tt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  console.log(
    `[TikTok] Conversão simulada: ${data.value} BRL em ${data.eventTime.toISOString()}`
  );

  return {
    externalEventId,
  };
}
