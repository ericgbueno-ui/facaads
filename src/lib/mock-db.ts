// Mock Database - Simula BD sem necessidade de conexão real
// Usado para desenvolvimento/teste quando o banco não está disponível

import { CHANNELS } from "./dashboard/sample-data";

export const mockCompanies = [
  {
    id: "caminhos-gramado",
    name: "Caminhos do Sul Gramado",
    segment: "Turismo",
    responsibleName: "Roberto Silva",
    phone: "(54) 99999-0001",
    city: "Gramado",
    state: "RS",
    website: "www.caminhosdsul.com.br",
    instagram: "@caminhosdosulgramado",
    facebook: "Caminhos do Sul",
  },
  {
    id: "multi-trip",
    name: "Multi Trip Viagens",
    segment: "Turismo",
    responsibleName: "Juliana Costa",
    phone: "(51) 98888-0002",
    city: "Porto Alegre",
    state: "RS",
    website: "www.multitrip.com.br",
    instagram: "@multitrip",
    facebook: "MultiTrip",
  },
  {
    id: "colchoes-brasil",
    name: "Colchões Brasil Premium",
    segment: "Mobiliário",
    responsibleName: "Marcos Ferreira",
    phone: "(11) 97777-0003",
    city: "São Paulo",
    state: "SP",
    website: "www.colchoesbrasilpremium.com.br",
    instagram: "@colchoesbrasilpremium",
  },
];

export const mockAdAccounts = [
  {
    id: "meta-1",
    channel: "META",
    name: "Meta Ads - Caminhos do Sul",
    externalAccountId: "1501790135057764",
    companyId: "caminhos-gramado",
  },
  {
    id: "google-1",
    channel: "GOOGLE",
    name: "Google Ads - Caminhos do Sul",
    externalAccountId: "7481234567",
    companyId: "caminhos-gramado",
  },
  {
    id: "tiktok-1",
    channel: "TIKTOK",
    name: "TikTok Ads - Caminhos do Sul",
    externalAccountId: "1234567890123456",
    companyId: "caminhos-gramado",
  },
  {
    id: "shopee-1",
    channel: "SHOPEE",
    name: "Shopee Ads - Caminhos do Sul",
    externalAccountId: "987654321",
    companyId: "caminhos-gramado",
  },
];

export const mockCampaigns = [
  {
    id: "camp-1",
    name: "Transfer POA - Gramado",
    adAccountId: "meta-1",
    objective: "CONVERSIONS",
    companyId: "caminhos-gramado",
  },
  {
    id: "camp-2",
    name: "City Tour Gramado",
    adAccountId: "meta-1",
    objective: "CONVERSIONS",
    companyId: "caminhos-gramado",
  },
  {
    id: "camp-3",
    name: "Busca - Hotéis Gramado",
    adAccountId: "google-1",
    objective: "CONVERSIONS",
    companyId: "caminhos-gramado",
  },
  {
    id: "camp-4",
    name: "Descoberta - Turismo Gramado",
    adAccountId: "tiktok-1",
    objective: "CONVERSIONS",
    companyId: "caminhos-gramado",
  },
  {
    id: "camp-5",
    name: "Voucher Hospedagem",
    adAccountId: "shopee-1",
    objective: "CONVERSIONS",
    companyId: "caminhos-gramado",
  },
];

export const mockMetrics = CHANNELS.flatMap((channel) =>
  channel.creatives.map((creative) => ({
    campaignId: `camp-${CHANNELS.indexOf(channel) + 1}`,
    channel: channel.key,
    spend: creative.spend,
    impressions: creative.impressions,
    clicks: creative.clicks,
    conversions: creative.sales,
    conversionValue: creative.revenue,
  }))
);

export const mockDashboardData = {
  hasData: true,
  kpis: {
    investment: { value: 19150.85, delta: 18.6 },
    revenue: { value: 63190, delta: 32.4 },
    roas: { value: 3.30, delta: 22.1 },
    leads: { value: 901, delta: 15.7 },
    sales: { value: 118, delta: 19.4 },
    conversionRate: { value: 13.1, delta: 6.3 },
  },
  metrics: {
    cpc: { value: 0.68, delta: -6.4 },
    ctr: { value: 2.44, delta: 8.1 },
    cpm: { value: 16.63, delta: -4.2 },
    ticket: { value: 595.42, delta: 14.3 },
  },
  series: [
    { date: "19/06", receita: 18400, investimento: 4600 },
    { date: "22/06", receita: 21600, investimento: 5350 },
    { date: "26/06", receita: 19800, investimento: 5100 },
    { date: "30/06", receita: 24800, investimento: 5950 },
    { date: "04/07", receita: 22800, investimento: 5750 },
    { date: "08/07", receita: 28900, investimento: 6650 },
    { date: "12/07", receita: 34600, investimento: 7200 },
    { date: "16/07", receita: 41200, investimento: 7900 },
  ],
  channels: [
    { name: "Meta Ads", channel: "META", value: 60 },
    { name: "Google Ads", channel: "GOOGLE", value: 40 },
  ],
  companies: [
    { name: "Caminhos do Sul Gramado", segment: "Turismo", revenue: 28560, delta: 28.4 },
    { name: "Multi Trip Viagens", segment: "Turismo", revenue: 18750, delta: 22.1 },
  ],
  campaigns: [
    // Caminhos do Sul - Meta Ads
    {
      name: "Transfer POA - Gramado",
      channel: "META",
      invest: 3200,
      leads: 128,
      sales: 18,
      revenue: 11240,
      roas: 3.51,
      cpa: 177.78,
    },
    {
      name: "City Tour Gramado",
      channel: "META",
      invest: 2400,
      leads: 156,
      sales: 14,
      revenue: 8680,
      roas: 3.62,
      cpa: 171.43,
    },
    {
      name: "Hotéis 5 Estrelas",
      channel: "META",
      invest: 1850,
      leads: 98,
      sales: 11,
      revenue: 6480,
      roas: 3.50,
      cpa: 168.18,
    },
    {
      name: "Experiência Snowland",
      channel: "META",
      invest: 1300,
      leads: 30,
      sales: 5,
      revenue: 2160,
      roas: 1.66,
      cpa: 260.00,
    },
    // Multi Trip - Meta Ads
    {
      name: "Pacotes América do Sul",
      channel: "META",
      invest: 2850,
      leads: 145,
      sales: 22,
      revenue: 13520,
      roas: 4.74,
      cpa: 129.55,
    },
    {
      name: "Viagens Internacionais",
      channel: "META",
      invest: 2100,
      leads: 98,
      sales: 16,
      revenue: 9840,
      roas: 4.69,
      cpa: 131.25,
    },
    // Multi Trip - Google Ads
    {
      name: "Busca - Pacotes Turísticos",
      channel: "GOOGLE",
      invest: 2150,
      leads: 164,
      sales: 19,
      revenue: 11760,
      roas: 5.47,
      cpa: 113.16,
    },
    {
      name: "Display - Destinos Populares",
      channel: "GOOGLE",
      invest: 1650,
      leads: 112,
      sales: 13,
      revenue: 7630,
      roas: 4.62,
      cpa: 126.92,
    },
  ],
  funnel: [
    { label: "Leads", value: 901 },
    { label: "Orçamentos", value: 540 },
    { label: "Negociação", value: 378 },
    { label: "Vendas", value: 118 },
    { label: "Pós Venda", value: 44 },
  ],
  activities: [
    {
      type: "conversation",
      title: "Nova conversa iniciada",
      detail: "Multi Trip Viagens - Pacote América do Sul",
      at: new Date().toISOString(),
    },
    {
      type: "sale",
      title: "Venda concluída",
      detail: "Caminhos do Sul - Transfer POA realizado",
      at: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      type: "lead",
      title: "Novo lead recebido",
      detail: "Multi Trip - Interesse em Viagens Internacionais",
      at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      type: "order",
      title: "Novo pedido realizado",
      detail: "Caminhos do Sul - Hospedagem 5 Estrelas",
      at: new Date(Date.now() - 25 * 60000).toISOString(),
    },
  ],
};
