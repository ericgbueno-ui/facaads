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

const EMPTY_KPIS = {
  investment: { value: 0, delta: 0 },
  revenue: { value: 0, delta: 0 },
  roas: { value: 0, delta: 0 },
  leads: { value: 0, delta: 0 },
  sales: { value: 0, delta: 0 },
  conversionRate: { value: 0, delta: 0 },
};

const EMPTY_METRICS = {
  cpc: { value: 0, delta: 0 },
  ctr: { value: 0, delta: 0 },
  cpm: { value: 0, delta: 0 },
  ticket: { value: 0, delta: 0 },
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
  dataQuality: {
    revenueSource: string;
    mediaConversionValue: number;
    roasAvailable: boolean;
    rules: string[];
  };
  kpis: typeof EMPTY_KPIS;
  metrics: typeof EMPTY_METRICS;
  series: Array<{ date: string; receita: number; investimento: number }>;
  channels: Array<{ name: string; channel: string; value: number }>;
  campaigns: Array<{
    name: string;
    channel: string;
    invest: number;
    leads: number;
    sales: number;
    revenue: number;
    roas: number | null;
    cpa: number | null;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/dashboard/overview?days=30")
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Dados indisponíveis");
        return json;
      })
      .then((json) => {
        if (!cancelled && json?.ok) setData(json);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Dados indisponíveis");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const live = data !== null;
  const safeData = data ?? null;
  const kpiValues = safeData?.kpis ?? EMPTY_KPIS;
  const metricValues = safeData?.metrics ?? EMPTY_METRICS;
  const series = safeData?.series ?? [];

  const channels = useMemo(() => {
    const source = safeData?.channels ?? [];
    if (source.length === 0) return [];
    return source.map((c) => ({
      name: c.name,
      value: c.value,
      color: CHANNEL_COLORS[c.channel] || "#64748B",
    }));
  }, [safeData]);

  const companies = useMemo(() => {
    const source = safeData?.companies ?? [];
    if (source.length === 0) return [];
    return source.map((c) => ({
      name: c.name,
      segment: c.segment,
      revenue: brl(c.revenue),
      delta: c.delta,
    }));
  }, [safeData]);

  const campaigns = useMemo(() => {
    const source = safeData?.campaigns ?? [];
    if (source.length === 0) return [];
    return source.map((c) => ({
      name: c.name,
      channel: c.channel.charAt(0) + c.channel.slice(1).toLowerCase(),
      channelColor: CHANNEL_COLORS[c.channel] || "#64748B",
      invest: brl(c.invest),
      leads: c.leads,
      sales: c.sales,
      revenue: brl(c.revenue),
      roas: c.roas === null ? "—" : num(c.roas, 2),
      cpa: c.cpa === null ? "—" : brl(c.cpa),
    }));
  }, [safeData]);

  const funnelSource = safeData?.funnel ?? [];
  const funnel = funnelSource;
  const funnelMax = Math.max(...funnel.map((f) => f.value), 1);
  const funnelColors = ["#2563eb", "#22c55e", "#eab308", "#f97316", "#ef4444"];

  const activities = useMemo(() => {
    const source = safeData?.activities ?? [];
    if (source.length === 0) return [];
    return source.map((a) => ({
      type: a.type,
      title: a.title,
      detail: a.detail,
      time: relativeTime(a.at),
    }));
  }, [safeData]);

  const receitaSpark = series.map((s) => s.receita);
  const investSpark = series.map((s) => s.investimento);
  const roasSpark = series.map((s) => (s.investimento > 0 ? s.receita / s.investimento : 0));

  const kpis = [
    { label: "Investimento", value: brl(kpiValues.investment.value), delta: kpiValues.investment.delta, icon: DollarSign, color: "#eab308", spark: investSpark },
    { label: "Receita", value: brl(kpiValues.revenue.value), delta: kpiValues.revenue.delta, icon: Wallet, color: "#22c55e", spark: receitaSpark },
    { label: "ROAS", value: safeData?.dataQuality.roasAvailable ? num(kpiValues.roas.value, 2) : "—", delta: kpiValues.roas.delta, icon: Share2, color: "#a855f7", spark: roasSpark },
    { label: "Leads", value: String(kpiValues.leads.value), delta: kpiValues.leads.delta, icon: Users, color: "#3b82f6", spark: receitaSpark },
    { label: "Vendas", value: String(kpiValues.sales.value), delta: kpiValues.sales.delta, icon: ShoppingCart, color: "#22c55e", spark: receitaSpark },
    { label: "Taxa de Conversão", value: `${num(kpiValues.conversionRate.value)}%`, delta: kpiValues.conversionRate.delta, icon: Target, color: "#a855f7", spark: roasSpark },
  ];

  const bottomMetrics = [
    { label: "CPC Médio", value: brl(metricValues.cpc.value), delta: metricValues.cpc.delta, icon: MousePointerClick, color: "#3b82f6", spark: investSpark },
    { label: "CTR Médio", value: `${num(metricValues.ctr.value, 2)}%`, delta: metricValues.ctr.delta, icon: Percent, color: "#22c55e", spark: receitaSpark },
    { label: "CPM Médio", value: brl(metricValues.cpm.value), delta: metricValues.cpm.delta, icon: MonitorPlay, color: "#eab308", spark: investSpark },
    { label: "Tempo Médio de Resposta", value: "—", delta: 0, icon: Clock3, color: "#ec4899", spark: roasSpark },
    { label: "Ticket Médio", value: brl(metricValues.ticket.value), delta: metricValues.ticket.delta, icon: Receipt, color: "#f97316", spark: receitaSpark },
    { label: "LTV Médio", value: "—", delta: 0, icon: Gem, color: "#a855f7", spark: receitaSpark },
  ];

  return (
    <div className="space-y-6">
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          {error} Nenhum dado demonstrativo foi exibido.
        </div>
      )}
      {!loading && live && !data?.hasData && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3 text-xs text-blue-300">
          Nenhum dado real registrado neste período. Os indicadores permanecem zerados.
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
