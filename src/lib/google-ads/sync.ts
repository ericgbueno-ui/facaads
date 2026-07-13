import { prisma } from "@/lib/prisma";

interface GoogleAdsCampaign {
  resourceName: string;
  id: string;
  name: string;
  status: string;
}

interface GoogleAdsMetrics {
  cost: string;
  impressions: string;
  clicks: string;
  conversions: string;
  conversionValue: string;
}

export async function fetchGoogleAdsCampaigns(
  customerId: string,
  refreshToken: string
): Promise<GoogleAdsCampaign[]> {
  try {
    // Get access token from refresh token
    const accessToken = await getGoogleAdsAccessToken(refreshToken);
    if (!accessToken) return [];

    const query = `
      SELECT campaign.id, campaign.name, campaign.status
      FROM campaign
      ORDER BY campaign.id
    `;

    const response = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      console.error("Google Ads API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    return (data.results || []).map((r: any) => ({
      resourceName: r.campaign.resourceName,
      id: r.campaign.id,
      name: r.campaign.name,
      status: r.campaign.status,
    }));
  } catch (err) {
    console.error("Failed to fetch Google Ads campaigns:", err);
    return [];
  }
}

export async function fetchCampaignMetrics(
  customerId: string,
  campaignId: string,
  refreshToken: string,
  dateStart: string,
  dateEnd: string
): Promise<GoogleAdsMetrics | null> {
  try {
    const accessToken = await getGoogleAdsAccessToken(refreshToken);
    if (!accessToken) return null;

    const query = `
      SELECT campaign.id, metrics.cost_micros, metrics.impressions,
             metrics.clicks, metrics.conversions, metrics.conversion_value
      FROM campaign
      WHERE campaign.id = '${campaignId}'
        AND segments.date BETWEEN '${dateStart}' AND '${dateEnd}'
    `;

    const response = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const metrics = data.results[0].metrics;
    return {
      cost: (parseInt(metrics.cost_micros || "0") / 1_000_000).toString(),
      impressions: metrics.impressions || "0",
      clicks: metrics.clicks || "0",
      conversions: metrics.conversions || "0",
      conversionValue: metrics.conversion_value || "0",
    };
  } catch (err) {
    console.error("Failed to fetch campaign metrics:", err);
    return null;
  }
}

async function getGoogleAdsAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.access_token || null;
  } catch (err) {
    console.error("Failed to get Google Ads access token:", err);
    return null;
  }
}

export async function syncGoogleAdsCampaigns(
  userId: string,
  customerId: string,
  refreshToken: string
) {
  try {
    const campaigns = await fetchGoogleAdsCampaigns(customerId, refreshToken);

    if (campaigns.length === 0) {
      console.log(`No campaigns found for Google Ads customer ${customerId}`);
      return { synced: 0, errors: 0 };
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dateStart = startDate.toISOString().split("T")[0];
    const dateEnd = endDate.toISOString().split("T")[0];

    let synced = 0;
    let errors = 0;

    for (const campaign of campaigns) {
      try {
        const dbCampaign = await prisma.campaign.upsert({
          where: { externalId: campaign.id },
          update: {
            name: campaign.name,
            status: campaign.status,
          },
          create: {
            externalId: campaign.id,
            name: campaign.name,
            status: campaign.status,
            adAccountId: customerId,
          },
        });

        const metrics = await fetchCampaignMetrics(
          customerId,
          campaign.id,
          refreshToken,
          dateStart,
          dateEnd
        );

        if (metrics) {
          await prisma.metricSnapshot.create({
            data: {
              campaignId: dbCampaign.id,
              date: new Date(),
              spend: parseFloat(metrics.cost),
              impressions: parseInt(metrics.impressions),
              clicks: parseInt(metrics.clicks),
              conversions: parseInt(metrics.conversions),
              conversionValue: parseFloat(metrics.conversionValue),
            },
          });

          synced++;
        }
      } catch (err) {
        console.error(`Error syncing Google Ads campaign ${campaign.id}:`, err);
        errors++;
      }
    }

    await prisma.adAccount.update({
      where: { externalId: customerId },
      data: { lastSyncedAt: new Date() },
    });

    return { synced, errors };
  } catch (err) {
    console.error("Failed to sync Google Ads campaigns:", err);
    return { synced: 0, errors: 1 };
  }
}
