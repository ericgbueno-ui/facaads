"use client";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Wallet,
  Share2,
  Users,
  ShoppingCart,
  Target,
  ChevronDown,
  MessageCircle,
  BadgeCheck,
  Package,
  FileBarChart,
  Sparkles,
  MousePointerClick,
  Percent,
  MonitorPlay,
  Clock3,
  Receipt,
  Gem,
} from "lucide-react";

/* ---------------------------------- data ---------------------------------- */

const revenueSeries = [
  { date: "18/06", receita: 82000, investimento: 21000 },
  { date: "22/06", receita: 96000, investimento: 24500 },
  { date: "26/06", receita: 88000, investimento: 23000 },
  { date: "30/06", receita: 112000, investimento: 27500 },
  { date: "04/07", receita: 104000, investimento: 26000 },
  { date: "08/07", receita: 132000, investimento: 30500 },
  { date: "12/07", receita: 158000, investimento: 33000 },
  { date: "16/07", receita: 189000, investimento: 36500 },
];

const channelData = [
  { name: "Meta Ads", value: 42, color: "#3B82F6" },
  { name: "Google Ads", value: 24, color: "#22C55E" },
  { name: "TikTok Ads", value: 16, color: "#EC4899" },
  { name: "Shopee Ads", value: 9, color: "#F97316" },
  { name: "Outros", value: 9, color: "#64748B" },
];

const topCompanies = [
  { name: "Caminhos do Sul Gramado", segment: "Turismo", revenue: "R$ 87.300,00", delta: 28.4 },
  { name: "Colchões Brasil", segment: "Colchões", revenue: "R$ 56.780,00", delta: 19.7 },
  { name: "Sacolas & Cia", segment: "Sacolas Personalizadas", revenue: "R$ 24.960,00", delta: 13.2 },
  { name: "Clínica Viva Bem", segment: "Clínica", revenue: "R$ 11.500,00", delta: -3.2 },
  { name: "Imobille Imóveis", segment: "Imobiliária", revenue: "R$ 6.000,00", delta: 8.1 },
];

const campaigns = [
  { name: "Transfer POA - Gramado", channel: "Meta", channelColor: "#3B82F6", invest: "R$ 4.850,00", leads: 128, sales: 48, revenue: "R$ 38.400,00", roas: "7,92", cpa: "R$ 37,89" },
  { name: "City Tour Gramado", channel: "Google", channelColor: "#22C55E", invest: "R$ 3.240,00", leads: 86, sales: 26, revenue: "R$ 21.840,00", roas: "6,74", cpa: "R$ 37,67" },
  { name: "Snowland - TikTok", channel: "TikTok", channelColor: "#EC4899", invest: "R$ 2.680,00", leads: 112, sales: 15, revenue: "R$ 12.750,00", roas: "4,76", cpa: "R$ 23,92" },
  { name: "Sacolas Kraft - Shopee", channel: "Shopee", channelColor: "#F97316", invest: "R$ 1.950,00", leads: 64, sales: 22, revenue: "R$ 17.160,00", roas: "8,80", cpa: "R$ 30,47" },
  { name: "Colchão Queen - Meta", channel: "Meta", channelColor: "#3B82F6", invest: "R$ 2.150,00", leads: 74, sales: 18, revenue: "R$ 15.320,00", roas: "7,13", cpa: "R$ 29,05" },
];

const funnelSteps = [
  { label: "Leads", value: 654, color: "#3B82F6", width: "100%" },
  { label: "Orçamentos", value: 412, color: "#22C55E", width: "82%" },
  { label: "Negociação", value: 287, color: "#EAB308", width: "64%" },
  { label: "Vendas", value: 213, color: "#F97316", width: "48%" },
  { label: "Pós Venda", value: 74, color: "#EF4444", width: "32%" },
];

const activities = [
  { icon: MessageCircle, iconColor: "text-green-400", iconBg: "bg-green-500/10", title: "Nova conversa iniciada", detail: "Caminhos do Sul Gramado", time: "Agora" },
  { icon: BadgeCheck, iconColor: "text-blue-400", iconBg: "bg-blue-500/10", title: "Venda concluída", detail: "Colchões Brasil", time: "5 min" },
  { icon: Package, iconColor: "text-orange-400", iconBg: "bg-orange-500/10", title: "Novo pedido na Shopee", detail: "Sacolas & Cia", time: "15 min" },
  { icon: FileBarChart, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10", title: "Relatório gerado", detail: "Relatório Semanal", time: "30 min" },
  { icon: Sparkles, iconColor: "text-purple-400", iconBg: "bg-purple-500/10", title: "Insight gerado pela IA", detail: "Caminhos do Sul Gramado", time: "1 h" },
];

/* ------------------------------- primitives ------------------------------- */

function Sparkline({ data, color }: { data: number[]; color: string }) {
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

function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  const positive = value >= 0;
  const good = invert ? !positive : positive;
  return (
    <span className={`text-xs font-semibold ${good ? "text-green-400" : "text-red-400"}`}>
      {positive ? "▲" : "▼"} {positive ? "+" : ""}
      {value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
      <span className="ml-1 font-normal text-slate-500">vs período anterior</span>
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-[#0c1120] p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
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

/* --------------------------------- blocks --------------------------------- */

const kpis = [
  { label: "Investimento", value: "R$ 24.850,00", delta: 18.6, icon: DollarSign, color: "#EAB308", spark: [4, 6, 5, 8, 7, 9, 8, 11, 10, 12] },
  { label: "Receita", value: "R$ 18.540,00", delta: 32.4, icon: Wallet, color: "#22C55E", spark: [3, 5, 4, 7, 6, 9, 11, 10, 13, 15] },
  { label: "ROAS", value: "7,51", delta: 22.1, icon: Share2, color: "#A855F7", spark: [5, 7, 6, 9, 8, 7, 10, 9, 12, 13] },
  { label: "Leads", value: "654", delta: 15.7, icon: Users, color: "#3B82F6", spark: [6, 8, 7, 9, 8, 11, 10, 12, 11, 14] },
  { label: "Vendas", value: "213", delta: 19.4, icon: ShoppingCart, color: "#22C55E", spark: [4, 5, 7, 6, 8, 9, 8, 11, 12, 13] },
  { label: "Taxa de Conversão", value: "32,6%", delta: 6.3, icon: Target, color: "#A855F7", spark: [7, 8, 7, 9, 10, 9, 11, 10, 12, 13] },
];

const bottomMetrics = [
  { label: "CPC Médio", value: "R$ 1,32", delta: -6.4, invert: true, icon: MousePointerClick, color: "#3B82F6", spark: [8, 7, 9, 6, 7, 5, 6, 5] },
  { label: "CTR Médio", value: "2,38%", delta: 8.1, invert: false, icon: Percent, color: "#22C55E", spark: [4, 5, 4, 6, 7, 6, 8, 9] },
  { label: "CPM Médio", value: "R$ 18,75", delta: -4.2, invert: true, icon: MonitorPlay, color: "#EAB308", spark: [9, 8, 9, 7, 8, 6, 7, 6] },
  { label: "Tempo Médio de Resposta", value: "2m 18s", delta: -12.6, invert: true, icon: Clock3, color: "#EC4899", spark: [10, 9, 8, 9, 7, 6, 7, 5] },
  { label: "Ticket Médio", value: "R$ 874,32", delta: 14.3, invert: false, icon: Receipt, color: "#F97316", spark: [5, 6, 5, 7, 8, 9, 10, 11] },
  { label: "LTV Médio", value: "R$ 2.134,50", delta: 17.8, invert: false, icon: Gem, color: "#A855F7", spark: [4, 5, 6, 7, 6, 8, 10, 12] },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="!p-4">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${kpi.color}1a` }}
              >
                <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {kpi.label}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{kpi.value}</p>
            <div className="mt-1">
              <Delta value={kpi.delta} />
            </div>
            <div className="mt-3">
              <Sparkline data={kpi.spark} color={kpi.color} />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
        {/* Receita vs Investimento */}
        <Card>
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
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueSeries}>
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
                  `R$ ${value.toLocaleString("pt-BR")}`,
                  name === "receita" ? "Receita" : "Investimento",
                ]}
              />
              <Line type="monotone" dataKey="receita" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 3 }} />
              <Line type="monotone" dataKey="investimento" stroke="#EAB308" strokeWidth={2} dot={{ fill: "#EAB308", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance por Canal */}
        <Card>
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
            <div className="h-[190px] w-1/2 min-w-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {channelData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2.5">
              {channelData.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold text-slate-100">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Empresas em Destaque */}
        <Card>
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
            {topCompanies.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-bold text-slate-200">
                  {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">{c.name}</span>
                  <span className="block text-[11px] text-slate-500">{c.segment}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold text-white">{c.revenue}</span>
                  <span className={`block text-[11px] font-semibold ${c.delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {c.delta >= 0 ? "▲" : "▼"} {c.delta >= 0 ? "+" : ""}
                    {c.delta.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.07]">
            Ver todas as empresas
          </button>
        </Card>
      </div>

      {/* Campaigns / Funnel / Activities */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
        {/* Desempenho das Campanhas */}
        <Card>
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
          <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.07]">
            Ver todas as campanhas
          </button>
        </Card>

        {/* Funil de Vendas */}
        <Card>
          <CardTitle>Funil de Vendas (Geral)</CardTitle>
          <div className="space-y-2.5 pt-2">
            {funnelSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex-1">
                  <div
                    className="mx-auto flex h-10 items-center justify-center rounded-md text-sm font-bold text-white shadow-lg"
                    style={{ width: step.width, backgroundColor: step.color }}
                  >
                    {step.value}
                  </div>
                </div>
                <span className="w-24 flex-shrink-0 text-xs text-slate-400">{step.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardTitle>Atividades Recentes</CardTitle>
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.title} className="flex items-center gap-3">
                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${a.iconBg}`}>
                  <a.icon className={`h-4 w-4 ${a.iconColor}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">{a.title}</span>
                  <span className="block text-[11px] text-slate-500">{a.detail}</span>
                </span>
                <span className="flex-shrink-0 text-[11px] text-slate-500">{a.time}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.07]">
            Ver todas
          </button>
        </Card>
      </div>

      {/* Bottom metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
        {bottomMetrics.map((m) => (
          <Card key={m.label} className="!p-4">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${m.color}1a` }}
              >
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {m.label}
              </span>
            </div>
            <p className="mt-2 text-xl font-bold text-white">{m.value}</p>
            <span className={`text-xs font-semibold ${m.delta >= 0 ? "text-green-400" : "text-red-400"}`}>
              {m.delta >= 0 ? "▲" : "▼"} {m.delta >= 0 ? "+" : ""}
              {m.delta.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
            </span>
            <div className="mt-2">
              <Sparkline data={m.spark} color={m.color} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
