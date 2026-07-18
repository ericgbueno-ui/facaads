"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  ChevronDown,
  Clock3,
  DollarSign,
  FileBarChart,
  Gem,
  MessageCircle,
  MonitorPlay,
  MousePointerClick,
  Package,
  Percent,
  Receipt,
  Share2,
  ShoppingCart,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";

/* ------------------------------- formatters ------------------------------- */

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number, d = 1) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const CHANNEL_COLORS: Record<string, string> = {
  META: "#2563eb",
  GOOGLE: "#22c55e",
  TIKTOK: "#ec4899",
  SHOPEE: "#f97316",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

/* ------------------------------- demo data -------------------------------- */

const demoSeries = [
  { date: "18/06", receita: 82000, investimento: 21000 },
  { date: "22/06", receita: 96000, investimento: 24500 },
  { date: "26/06", receita: 88000, investimento: 23000 },
  { date: "30/06", receita: 112000, investimento: 27500 },
  { date: "04/07", receita: 104000, investimento: 26000 },
  { date: "08/07", receita: 132000, investimento: 30500 },
  { date: "12/07", receita: 158000, investimento: 33000 },
  { date: "16/07", receita: 189000, investimento: 36500 },
];

const demoChannels = [
  { name: "Meta Ads", value: 42, color: "#3B82F6" },
  { name: "Google Ads", value: 24, color: "#22C55E" },
  { name: "TikTok Ads", value: 16, color: "#EC4899" },
  { name: "Shopee Ads", value: 9, color: "#F97316" },
  { name: "Outros", value: 9, color: "#64748B" },
];

const demoCompanies = [
  { name: "Caminhos do Sul Gramado", segment: "Turismo", revenue: "R$ 87.300,00", delta: 28.4 },
  { name: "Colchões Brasil", segment: "Colchões", revenue: "R$ 56.780,00", delta: 19.7 },
  { name: "Sacolas & Cia", segment: "Sacolas Personalizadas", revenue: "R$ 24.960,00", delta: 13.2 },
  { name: "Clínica Viva Bem", segment: "Clínica", revenue: "R$ 11.500,00", delta: -3.2 },
  { name: "Imobille Imóveis", segment: "Imobiliária", revenue: "R$ 6.000,00", delta: 8.1 },
];

const demoCampaigns = [
  { name: "Transfer POA - Gramado", channel: "Meta", channelColor: "#3B82F6", invest: "R$ 4.850,00", leads: 128, sales: 48, revenue: "R$ 38.400,00", roas: "7,92", cpa: "R$ 37,89" },
  { name: "City Tour Gramado", channel: "Google", channelColor: "#22C55E", invest: "R$ 3.240,00", leads: 86, sales: 26, revenue: "R$ 21.840,00", roas: "6,74", cpa: "R$ 37,67" },
  { name: "Snowland - TikTok", channel: "TikTok", channelColor: "#EC4899", invest: "R$ 2.680,00", leads: 112, sales: 15, revenue: "R$ 12.750,00", roas: "4,76", cpa: "R$ 23,92" },
  { name: "Sacolas Kraft - Shopee", channel: "Shopee", channelColor: "#F97316", invest: "R$ 1.950,00", leads: 64, sales: 22, revenue: "R$ 17.160,00", roas: "8,80", cpa: "R$ 30,47" },
  { name: "Colchão Queen - Meta", channel: "Meta", channelColor: "#3B82F6", invest: "R$ 2.150,00", leads: 74, sales: 18, revenue: "R$ 15.320,00", roas: "7,13", cpa: "R$ 29,05" },
];

const demoFunnel = [
  { label: "Leads", value: 654 },
  { label: "Orçamentos", value: 412 },
  { label: "Negociação", value: 287 },
  { label: "Vendas", value: 213 },
  { label: "Pós Venda", value: 74 },
];

const demoActivities = [
  { type: "conversation", title: "Nova conversa iniciada", detail: "Caminhos do Sul Gramado", time: "Agora" },
  { type: "sale", title: "Venda concluída", detail: "Colchões Brasil", time: "5 min" },
  { type: "order", title: "Novo pedido na Shopee", detail: "Sacolas & Cia", time: "15 min" },
  { type: "report", title: "Relatório gerado", detail: "Relatório Semanal", time: "30 min" },
  { type: "insight", title: "Insight gerado pela IA", detail: "Caminhos do Sul Gramado", time: "1 h" },
];

const demoKpis = {
  investment: { value: 24850, delta: 18.6 },
  revenue: { value: 18540, delta: 32.4 },
  roas: { value: 7.51, delta: 22.1 },
  leads: { value: 654, delta: 15.7 },
  sales: { value: 213, delta: 19.4 },
  conversionRate: { value: 32.6, delta: 6.3 },
};

const demoMetrics = {
  cpc: { value: 1.32, delta: -6.4 },
  ctr: { value: 2.38, delta: 8.1 },
  cpm: { value: 18.75, delta: -4.2 },
  ticket: { value: 874.32, delta: 14.3 },
};

const ACTIVITY_ICONS: Record<string, { icon: typeof MessageCircle; color: string; bg: string }> = {
  conversation: { icon: MessageCircle, color: "text-green-400", bg: "bg-green-500/10" },
  sale: { icon: BadgeCheck, color: "text-blue-400", bg: "bg-blue-500/10" },
  lead: { icon: Users, color: "text-amber-400", bg: "bg-amber-500/10" },
  order: { icon: Package, color: "text-orange-400", bg: "bg-orange-500/10" },
  report: { icon: FileBarChart, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  insight: { icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
};

/* ------------------------------- primitives ------------------------------- */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div className="h-8" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / range) * 24}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Delta({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`text-xs font-semibold ${positive ? "text-green-400" : "text-red-400"}`}>
      {positive ? "▲" : "▼"} {positive ? "+" : ""}
      {num(value)}%<span className="ml-1 font-normal text-slate-500">vs período anterior</span>
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,rgba(12,17,32,0.96),rgba(9,14,27,0.96))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] ${className}`}
    >
      {children}
    </div>
  );
}

function CardTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-slate-100">{children}</h3>
      {action}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#131a2c",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#e2e8f0",
};

/* ------------------------------- component -------------------------------- */

interface OverviewData {
  hasData: boolean;
  kpis: typeof demoKpis;
  metrics: typeof demoMetrics;
  series: Array<{ date: string; receita: number; investimento: number }>;
  channels: Array<{ name: string; channel: string; value: number }>;
  campaigns: Array<{
    name: string;
    channel: string;
    invest: number;
    leads: number;
    sales: number;
    revenue: number;
    roas: number;
    cpa: number;
  }>;
  companies: Array<{ name: string; segment: string; revenue: number; delta: number }>;
  funnel: Array<{ label: string; value: number }>;
  activities: Array<{ type: string; title: string; detail: string; at: string }>;
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  color,
  spark,
}: {
  label: string;
  value: string;
  delta: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
  spark: number[];
}) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1a` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-white">{value}</p>
      <div className="mt-1">
        <Delta value={delta} />
      </div>
      <div className="mt-3">
        <Sparkline data={spark} color={color} />
      </div>
    </Card>
  );
}

export function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/dashboard/overview?days=30")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.ok && json.hasData) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const live = data !== null;
  const safeData = data ?? null;
  const kpiValues = safeData?.kpis ?? demoKpis;
  const metricValues = safeData?.metrics ?? demoMetrics;
  const series = (safeData?.series?.length ?? 0) > 1 && safeData?.series ? safeData.series : demoSeries;

  const channels = useMemo(() => {
    const source = safeData?.channels ?? [];
    if (!live || source.length === 0) return demoChannels;
    return source.map((c) => ({
      name: c.name,
      value: c.value,
      color: CHANNEL_COLORS[c.channel] || "#64748B",
    }));
  }, [live, safeData]);

  const companies = useMemo(() => {
    const source = safeData?.companies ?? [];
    if (!live || source.length === 0) return demoCompanies;
    return source.map((c) => ({
      name: c.name,
      segment: c.segment,
      revenue: brl(c.revenue),
      delta: c.delta,
    }));
  }, [live, safeData]);

  const campaigns = useMemo(() => {
    const source = safeData?.campaigns ?? [];
    if (!live || source.length === 0) return demoCampaigns;
    return source.map((c) => ({
      name: c.name,
      channel: c.channel.charAt(0) + c.channel.slice(1).toLowerCase(),
      channelColor: CHANNEL_COLORS[c.channel] || "#64748B",
      invest: brl(c.invest),
      leads: c.leads,
      sales: c.sales,
      revenue: brl(c.revenue),
      roas: num(c.roas, 2),
      cpa: brl(c.cpa),
    }));
  }, [live, safeData]);

  const funnelSource = safeData?.funnel ?? [];
  const funnel = live && funnelSource.some((f) => f.value > 0) ? funnelSource : demoFunnel;
  const funnelMax = Math.max(...funnel.map((f) => f.value), 1);
  const funnelColors = ["#2563eb", "#22c55e", "#eab308", "#f97316", "#ef4444"];

  const activities = useMemo(() => {
    const source = safeData?.activities ?? [];
    if (!live || source.length === 0) return demoActivities;
    return source.map((a) => ({
      type: a.type,
      title: a.title,
      detail: a.detail,
      time: relativeTime(a.at),
    }));
  }, [live, safeData]);

  const receitaSpark = series.map((s) => s.receita);
  const investSpark = series.map((s) => s.investimento);
  const roasSpark = series.map((s) => (s.investimento > 0 ? s.receita / s.investimento : 0));

  const kpis = [
    { label: "Investimento", value: brl(kpiValues.investment.value), delta: kpiValues.investment.delta, icon: DollarSign, color: "#eab308", spark: investSpark },
    { label: "Receita", value: brl(kpiValues.revenue.value), delta: kpiValues.revenue.delta, icon: Wallet, color: "#22c55e", spark: receitaSpark },
    { label: "ROAS", value: num(kpiValues.roas.value, 2), delta: kpiValues.roas.delta, icon: Share2, color: "#a855f7", spark: roasSpark },
    { label: "Leads", value: String(kpiValues.leads.value), delta: kpiValues.leads.delta, icon: Users, color: "#3b82f6", spark: receitaSpark },
    { label: "Vendas", value: String(kpiValues.sales.value), delta: kpiValues.sales.delta, icon: ShoppingCart, color: "#22c55e", spark: receitaSpark },
    { label: "Taxa de Conversão", value: `${num(kpiValues.conversionRate.value)}%`, delta: kpiValues.conversionRate.delta, icon: Target, color: "#a855f7", spark: roasSpark },
  ];

  const bottomMetrics = [
    { label: "CPC Médio", value: brl(metricValues.cpc.value), delta: metricValues.cpc.delta, icon: MousePointerClick, color: "#3b82f6", spark: investSpark },
    { label: "CTR Médio", value: `${num(metricValues.ctr.value, 2)}%`, delta: metricValues.ctr.delta, icon: Percent, color: "#22c55e", spark: receitaSpark },
    { label: "CPM Médio", value: brl(metricValues.cpm.value), delta: metricValues.cpm.delta, icon: MonitorPlay, color: "#eab308", spark: investSpark },
    { label: "Tempo Médio de Resposta", value: live ? "—" : "2m 18s", delta: live ? 0 : -12.6, icon: Clock3, color: "#ec4899", spark: roasSpark },
    { label: "Ticket Médio", value: brl(metricValues.ticket.value), delta: metricValues.ticket.delta, icon: Receipt, color: "#f97316", spark: receitaSpark },
    { label: "LTV Médio", value: live ? "—" : "R$ 2.134,50", delta: live ? 0 : 17.8, icon: Gem, color: "#a855f7", spark: receitaSpark },
  ];

  return (
    <div className="space-y-6">
      {!loading && !live && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          Exibindo dados de demonstração. Conecte suas contas e registre vendas para liberar métricas reais.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr_1fr]">
        <Card className="min-h-[360px]">
          <CardTitle
            action={
              <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08]">
                Últimos 30 dias
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            }
          >
            Receita vs Investimento
          </CardTitle>
          <div className="mb-3 flex items-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Receita
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Investimento
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `R$ ${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  brl(value),
                  name === "receita" ? "Receita" : "Investimento",
                ]}
              />
              <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={2.2} dot={{ fill: "#22c55e", r: 3 }} />
              <Line type="monotone" dataKey="investimento" stroke="#eab308" strokeWidth={2.2} dot={{ fill: "#eab308", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="min-h-[360px]">
          <CardTitle
            action={
              <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08]">
                Ver detalhes
              </button>
            }
          >
            Performance por Canal
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="h-[210px] w-1/2 min-w-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channels}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {channels.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2.5">
              {channels.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold text-slate-100">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="min-h-[360px]">
          <CardTitle
            action={
              <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08]">
                Receita
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            }
          >
            Empresas em Destaque
          </CardTitle>
          <ul className="space-y-3">
            {companies.map((c) => (
              <li key={c.name} className="flex items-center gap-3 rounded-xl px-1 py-1.5 hover:bg-white/[0.03]">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[11px] font-bold text-slate-200">
                  {c.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">{c.name}</span>
                  <span className="block text-[11px] text-slate-500">{c.segment}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold text-white">{c.revenue}</span>
                  <span className={`block text-[11px] font-semibold ${c.delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {c.delta >= 0 ? "▲" : "▼"} {c.delta >= 0 ? "+" : ""}
                    {num(c.delta)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-medium text-slate-300 hover:bg-white/[0.07]">
            Ver todas as empresas
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr_1fr]">
        <Card className="min-h-[340px]">
          <CardTitle>Desempenho das Campanhas</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500">
                  <th className="pb-2 pr-3 font-medium">Campanha</th>
                  <th className="pb-2 pr-3 font-medium">Canal</th>
                  <th className="pb-2 pr-3 font-medium">Investimento</th>
                  <th className="pb-2 pr-3 font-medium">Leads</th>
                  <th className="pb-2 pr-3 font-medium">Vendas</th>
                  <th className="pb-2 pr-3 font-medium">Receita</th>
                  <th className="pb-2 pr-3 font-medium">ROAS</th>
                  <th className="pb-2 font-medium">CPA</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {campaigns.map((c) => (
                  <tr key={c.name} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-slate-100">{c.name}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                        style={{ backgroundColor: c.channelColor }}
                      >
                        {c.channel[0]}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">{c.invest}</td>
                    <td className="py-2.5 pr-3">{c.leads}</td>
                    <td className="py-2.5 pr-3">{c.sales}</td>
                    <td className="py-2.5 pr-3">{c.revenue}</td>
                    <td className="py-2.5 pr-3 font-semibold text-green-400">{c.roas}</td>
                    <td className="py-2.5">{c.cpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-medium text-slate-300 hover:bg-white/[0.07]">
            Ver todas as campanhas
          </button>
        </Card>

        <Card className="min-h-[340px]">
          <CardTitle>Funil de Vendas (Geral)</CardTitle>
          <div className="space-y-2.5 pt-2">
            {funnel.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex-1">
                  <div
                    className="mx-auto flex h-10 items-center justify-center rounded-md text-sm font-bold text-white shadow-lg"
                    style={{
                      width: `${Math.max((step.value / funnelMax) * 100, 24)}%`,
                      backgroundColor: funnelColors[i % funnelColors.length],
                    }}
                  >
                    {step.value}
                  </div>
                </div>
                <span className="w-24 flex-shrink-0 text-xs text-slate-400">{step.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-h-[340px]">
          <CardTitle>Atividades Recentes</CardTitle>
          <ul className="space-y-3">
            {activities.map((a, i) => {
              const ic = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.report;
              return (
                <li key={`${a.title}-${i}`} className="flex items-center gap-3 rounded-xl px-1 py-1.5 hover:bg-white/[0.03]">
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${ic.bg}`}>
                    <ic.icon className={`h-4 w-4 ${ic.color}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">{a.title}</span>
                    <span className="block text-[11px] text-slate-500">{a.detail}</span>
                  </span>
                  <span className="flex-shrink-0 text-[11px] text-slate-500">{a.time}</span>
                </li>
              );
            })}
          </ul>
          <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-medium text-slate-300 hover:bg-white/[0.07]">
            Ver todas
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
        {bottomMetrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </div>
    </div>
  );
}
