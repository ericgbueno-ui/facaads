export interface DailyCampaignMetric {
  externalCampaignId: string;
  campaignName: string;
  objective?: string;
  date: string; // YYYY-MM-DD
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue?: number;
  raw?: unknown;
}

export interface AdAccountRef {
  externalAccountId: string;
  name: string;
  loginCustomerId?: string;
}
