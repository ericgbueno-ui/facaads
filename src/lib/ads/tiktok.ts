import type { DailyCampaignMetric } from "./types";

const API_BASE = "https://business-api.tiktok.com/open_api/v1.3";

interface TikTokReportRow {
  dimensions: { campaign_id: string; campaign_name?: string; stat_time_day: string };
  metrics: {
    spend?: string;
    impressions?: string;
    clicks?: string;
    conversion?: string;
    total_complete_payment_rate?: string;
    conversion_value?: string;
  };
}

interface TikTokReportResponse {
  code: number;
  message: string;
  data?: {
    list: TikTokReportRow[];
    page_info: { page: number; total_page: number };
  };
}

export async function fetchTikTokCampaignMetrics(params: {
  advertiserId: string;
  since: string; // YYYY-MM-DD
  until: string; // YYYY-MM-DD
}): Promise<DailyCampaignMetric[]> {
  const { advertiserId, since, until } = params;

  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("TIKTOK_ACCESS_TOKEN não configurado");
  }

  const results: DailyCampaignMetric[] = [];
  let page = 1;

  for (;;) {
    const url = new URL(`${API_BASE}/report/integrated/get/`);
    url.searchParams.set("advertiser_id", advertiserId);
    url.searchParams.set("report_type", "BASIC");
    url.searchParams.set("data_level", "AUCTION_CAMPAIGN");
    url.searchParams.set("dimensions", JSON.stringify(["campaign_id", "stat_time_day"]));
    url.searchParams.set(
      "metrics",
      JSON.stringify(["spend", "impressions", "clicks", "conversion", "conversion_value"])
    );
    url.searchParams.set("start_date", since);
    url.searchParams.set("end_date", until);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "100");

    const res = await fetch(url.toString(), {
      headers: { "Access-Token": accessToken },
    });

    if (!res.ok) {
      throw new Error(
        `TikTok Ads API falhou (${res.status}) pro advertiser ${advertiserId}: ${await res.text()}`
      );
    }

    const json = (await res.json()) as TikTokReportResponse;

    if (json.code !== 0 || !json.data) {
      throw new Error(`TikTok Ads API retornou erro: ${json.message}`);
    }

    for (const row of json.data.list) {
      results.push({
        externalCampaignId: row.dimensions.campaign_id,
        campaignName: row.dimensions.campaign_name ?? row.dimensions.campaign_id,
        date: row.dimensions.stat_time_day.slice(0, 10),
        spend: Number(row.metrics.spend ?? 0),
        impressions: Number(row.metrics.impressions ?? 0),
        clicks: Number(row.metrics.clicks ?? 0),
        conversions: Number(row.metrics.conversion ?? 0),
        conversionValue: Number(row.metrics.conversion_value ?? 0),
        raw: row,
      });
    }

    if (page >= json.data.page_info.total_page) break;
    page += 1;
  }

  return results;
}
