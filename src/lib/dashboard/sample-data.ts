// Dados de demonstração para as 5 visões do painel.
// Estrutura pronta para ser substituída por dados reais (Meta/Google/TikTok/Shopee).

export type CreativeFormat = "VID" | "IMG" | "CAR" | "COL";

export interface Creative {
  format: CreativeFormat;
  copy: string;       // ex.: "COPY A", "TEXTO 1"
  spend: number;      // gasto R$
  impressions: number;
  clicks: number;
  msgs: number;       // conversas iniciadas no WhatsApp
  sales: number;
  revenue: number;
}

export interface ChannelData {
  key: "META" | "GOOGLE" | "TIKTOK" | "SHOPEE";
  name: string;
  color: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  msgs: number;       // conversas WhatsApp
  leads: number;      // negociação
  sales: number;
  revenue: number;
  creatives: Creative[];
}

export const FORMAT_LABEL: Record<CreativeFormat, string> = {
  VID: "Vídeo",
  IMG: "Imagem",
  CAR: "Carrossel",
  COL: "Coleção",
};

export const CHANNELS: ChannelData[] = [
  {
    key: "META", name: "Meta Ads", color: "#2563eb",
    spend: 4820.5, impressions: 312450, reach: 184300, clicks: 6120, msgs: 852, leads: 236, sales: 19, revenue: 11240,
    creatives: [
      { format: "VID", copy: "COPY A", spend: 1680, impressions: 128000, clicks: 2650, msgs: 372, sales: 9, revenue: 5320 },
      { format: "IMG", copy: "COPY A", spend: 1120, impressions: 82000, clicks: 1480, msgs: 198, sales: 4, revenue: 2360 },
      { format: "CAR", copy: "TEXTO 1", spend: 1290, impressions: 74000, clicks: 1360, msgs: 214, sales: 5, revenue: 2960 },
      { format: "COL", copy: "TEXTO 2", spend: 730.5, impressions: 28450, clicks: 630, msgs: 68, sales: 1, revenue: 600 },
    ],
  },
  {
    key: "GOOGLE", name: "Google Ads", color: "#10b981",
    spend: 2140, impressions: 96500, reach: 71200, clicks: 2380, msgs: 91, leads: 58, sales: 5, revenue: 3120,
    creatives: [
      { format: "VID", copy: "YT BUMPER", spend: 640, impressions: 41000, clicks: 720, msgs: 34, sales: 2, revenue: 1240 },
      { format: "IMG", copy: "DISPLAY A", spend: 720, impressions: 33500, clicks: 910, msgs: 31, sales: 2, revenue: 1180 },
      { format: "CAR", copy: "PMAX", spend: 780, impressions: 22000, clicks: 750, msgs: 26, sales: 1, revenue: 700 },
    ],
  },
  {
    key: "TIKTOK", name: "TikTok Ads", color: "#0ea5e9",
    spend: 980, impressions: 141000, reach: 98700, clicks: 3200, msgs: 47, leads: 22, sales: 2, revenue: 980,
    creatives: [
      { format: "VID", copy: "UGC 1", spend: 620, impressions: 98000, clicks: 2200, msgs: 33, sales: 2, revenue: 980 },
      { format: "VID", copy: "UGC 2", spend: 360, impressions: 43000, clicks: 1000, msgs: 14, sales: 0, revenue: 0 },
    ],
  },
  {
    key: "SHOPEE", name: "Shopee Ads", color: "#f97316",
    spend: 540, impressions: 62000, reach: 40100, clicks: 1450, msgs: 0, leads: 0, sales: 8, revenue: 1980,
    creatives: [
      { format: "IMG", copy: "PRODUTO A", spend: 300, impressions: 38000, clicks: 900, msgs: 0, sales: 5, revenue: 1240 },
      { format: "IMG", copy: "PRODUTO B", spend: 240, impressions: 24000, clicks: 550, msgs: 0, sales: 3, revenue: 740 },
    ],
  },
];

// Métricas derivadas (Impressões, Alcance, CTR, CPC, CPM, CPA)
export function metrics(c: { spend: number; impressions: number; reach: number; clicks: number; sales: number; revenue: number }) {
  const ctr = c.impressions ? (c.clicks / c.impressions) * 100 : 0;
  const cpc = c.clicks ? c.spend / c.clicks : 0;
  const cpm = c.impressions ? (c.spend / c.impressions) * 1000 : 0;
  const cpa = c.sales ? c.spend / c.sales : 0;
  const roas = c.spend ? c.revenue / c.spend : 0;
  return { ctr, cpc, cpm, cpa, roas };
}

export function creativeMetrics(cr: Creative) {
  const ctr = cr.impressions ? (cr.clicks / cr.impressions) * 100 : 0;
  const cpc = cr.clicks ? cr.spend / cr.clicks : 0;
  const cpa = cr.sales ? cr.spend / cr.sales : 0;
  const roas = cr.spend ? cr.revenue / cr.spend : 0;
  return { ctr, cpc, cpa, roas };
}
