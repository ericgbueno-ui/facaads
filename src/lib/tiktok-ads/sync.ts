import { prisma } from "@/lib/prisma";

const TIKTOK_API_VERSION = "v1.3";
const TIKTOK_API_BASE = "https://business-api.tiktok.com/open_api";

interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  campaign_status: string;
}

interface TikTokMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_value: number;
}

export async function fetchTikTokCampaigns(
  accessToken: string,
  advertiserId: string
): Promise<TikTokCampaign[]> {
  try {
    const response = await fetch(
      `${TIKTOK_API_BASE}/${TIKTOK_API_VERSION}/campaign/get?` +
      `advertiser_id=${advertiserId}&fields=campaign_id,campaign_name,campaign_status`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("TikTok API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.data?.list || [];
  } catch (err) {
    console.error("Failed to fetch TikTok campaigns:", err);
    return [];
  }
}

export async function fetchCampaignMetrics(
  accessToken: string,
  advertiserId: string,
  campaignId: string,
  dateStart: string,
  dateEnd: string
): Promise<TikTokMetrics | null> {
  try {
    const response = await fetch(
      `${TIKTOK_API_BASE}/${TIKTOK_API_VERSION}/analytics/campaign/?` +
      `advertiser_id=${advertiserId}&` +
      `campaign_ids=[${campaignId}]&` +
      `start_date=${dateStart}&end_date=${dateEnd}&` +
      `fields=spend,impressions,clicks,conversions,conversion_value`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.data?.list || data.data.list.length === 0) return null;

    const metrics = data.data.list[0];
    return {
      spend: parseFloat(metrics.spend || "0"),
      impressions: parseInt(metrics.impressions || "0"),
      clicks: parseInt(metrics.clicks || "0"),
      conversions: parseInt(metrics.conversions || "0"),
      conversion_value: parseFloat(metrics.conversion_value || "0"),
    };
  } catch (err) {
    console.error("Failed to fetch TikTok campaign metrics:", err);
    return null;
  }
}

export async function syncTikTokAdsCampaigns(
  userId: string,
  advertiserId: string,
  accessToken: string
) {
  try {
    const campaigns = await fetchTikTokCampaigns(accessToken, advertiserId);

    if (campaigns.length === 0) {
      console.log(`No campaigns found for TikTok advertiser ${advertiserId}`);
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
          where: { externalId: campaign.campaign_id },
          update: {
            name: campaign.campaign_name,
            status: campaign.campaign_status,
          },
          create: {
            externalId: campaign.campaign_id,
            name: campaign.campaign_name,
            status: campaign.campaign_status,
            adAccountId: advertiserId,
          },
        });

        const metrics = await fetchCampaignMetrics(
          accessToken,
          advertiserId,
          campaign.campaign_id,
          dateStart,
          dateEnd
        );

        if (metrics) {
          await prisma.metricSnapshot.create({
            data: {
              campaignId: dbCampaign.id,
              date: new Date(),
              spend: metrics.spend,
              impressions: metrics.impressions,
              clicks: metrics.clicks,
              conversions: metrics.conversions,
              conversionValue: metrics.conversion_value,
            },
          });

          synced++;
        }
      } catch (err) {
        console.error(`Error syncing TikTok campaign ${campaign.campaign_id}:`, err);
        errors++;
      }
    }

    await prisma.adAccount.update({
      where: { externalId: advertiserId },
      data: { lastSyncedAt: new Date() },
    });

    return { synced, errors };
  } catch (err) {
    console.error("Failed to sync TikTok campaigns:", err);
    return { synced: 0, errors: 1 };
  }
}
