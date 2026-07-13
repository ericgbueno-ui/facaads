import type { DailyCampaignMetric } from "./types";

const API_VERSION = "v21";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET ou GOOGLE_ADS_REFRESH_TOKEN não configurados"
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao renovar token do Google Ads (${res.status}): ${await res.text()}`);
  }

  const json = (await res.json()) as GoogleTokenResponse;
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

interface GoogleAdsSearchRow {
  campaign: { id: string; name: string; advertisingChannelType?: string };
  segments: { date: string };
  metrics: {
    costMicros?: string;
    impressions?: string;
    clicks?: string;
    conversions?: string;
    conversionsValue?: string;
  };
}

interface GoogleAdsSearchResponse {
  results?: GoogleAdsSearchRow[];
  nextPageToken?: string;
}

export async function fetchGoogleAdsCampaignMetrics(params: {
  customerId: string; // sem hífens
  since: string; // YYYY-MM-DD
  until: string; // YYYY-MM-DD
}): Promise<DailyCampaignMetric[]> {
  const { customerId, since, until } = params;

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  if (!developerToken) {
    throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN não configurado");
  }

  const accessToken = await getAccessToken();

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.advertising_channel_type,
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${since}' AND '${until}'
  `.trim();

  const results: DailyCampaignMetric[] = [];
  let pageToken: string | undefined;

  do {
    const res = await fetch(
      `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:search`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          ...(loginCustomerId ? { "login-customer-id": loginCustomerId } : {}),
        },
        body: JSON.stringify({ query, pageToken }),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Google Ads API falhou (${res.status}) pro cliente ${customerId}: ${await res.text()}`
      );
    }

    const json = (await res.json()) as GoogleAdsSearchResponse;

    for (const row of json.results ?? []) {
      results.push({
        externalCampaignId: row.campaign.id,
        campaignName: row.campaign.name,
        objective: row.campaign.advertisingChannelType,
        date: row.segments.date,
        spend: Number(row.metrics.costMicros ?? 0) / 1_000_000,
        impressions: Number(row.metrics.impressions ?? 0),
        clicks: Number(row.metrics.clicks ?? 0),
        conversions: Number(row.metrics.conversions ?? 0),
        conversionValue: Number(row.metrics.conversionsValue ?? 0),
        raw: row,
      });
    }

    pageToken = json.nextPageToken;
  } while (pageToken);

  return results;
}
