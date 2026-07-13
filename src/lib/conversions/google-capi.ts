/**
 * Google Ads Conversions API
 * Docs: https://developers.google.com/google-ads/api/docs/conversions/upload-conversions
 */

interface GoogleConversionData {
  value: number;
  eventTime: Date;
  metadata?: Record<string, any>;
  campaignId?: string;
}

interface GoogleConversionResponse {
  externalEventId: string;
}

/**
 * Envia uma conversão offline via Google Ads Conversions Upload API
 * TODO: Implementar com Google Ads API client autenticado
 */
export async function sendGoogleConversion(
  data: GoogleConversionData
): Promise<GoogleConversionResponse> {
  // Por enquanto apenas simular
  const externalEventId = `gads_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  console.log(
    `[Google Ads] Conversão simulada: ${data.value} BRL em ${data.eventTime.toISOString()}`
  );

  return {
    externalEventId,
  };
}
