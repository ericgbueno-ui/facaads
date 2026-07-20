"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { KPICard } from "@/components/KPICard";
import { RevenueChart, PerformanceChart, SalesChart } from "@/components/Charts";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Download,
  Filter,
} from "lucide-react";

const revenueData: Array<{ date: string; revenue: number; investment: number }> = [];

const performanceData: Array<{ channel: string; value: number }> = [];

const salesData: Array<{ date: string; leads: number; sales: number; conversions: number }> = [];

export function FinancialDashboard({ companyId }: { companyId: string }) {
  void companyId;
  const [dateRange, setDateRange] = useState({
    start: "2025-07-01",
    end: "2025-07-08",
  });

  const kpis = [
    {
      label: "Receita Total",
      value: "R$ 0,00",
      change: 0,
      changeLabel: "vs. período anterior",
      icon: <DollarSign className="text-green-400" />,
      color: "green" as const,
      sparkline: [20, 35, 28, 42, 38, 45, 52, 60],
    },
    {
      label: "Lucro",
      value: "R$ 0,00",
      change: 0,
      changeLabel: "vs. período anterior",
      icon: <TrendingUp className="text-blue-400" />,
      color: "blue" as const,
      sparkline: [10, 18, 15, 25, 22, 28, 35, 42],
    },
    {
      label: "Ticket Médio",
      value: "R$ 0,00",
      change: 0,
      changeLabel: "vs. período anterior",
      icon: <BarChart3 className="text-orange-400" />,
      color: "orange" as const,
      sparkline: [15, 22, 19, 28, 25, 32, 38, 45],
    },
    {
      label: "Taxa Conversão",
      value: "0,0%",
      change: 0,
      changeLabel: "vs. período anterior",
      icon: <Target className="text-purple-400" />,
      color: "purple" as const,
      sparkline: [18, 22, 20, 26, 28, 30, 33, 36],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header
        title="Financeiro"
        subtitle="Acompanhe receita, lucro e indicadores de desempenho."
      />
      <Sidebar />

      <main className="ml-64 pt-24 px-8 pb-12">
        {/* Filters */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100"
            />
            <span className="flex items-center text-slate-400">→</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100"
            />
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue vs Investment */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-lg font-semibold text-slate-100">
              Receita vs Investimento
            </h3>
            <RevenueChart data={revenueData} />
          </div>

          {/* Performance by Channel */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-lg font-semibold text-slate-100">
              Performance por Canal
            </h3>
            <PerformanceChart data={performanceData} />
          </div>
        </div>

        {/* Sales Chart */}
        <div className="mb-8 rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-semibold text-slate-100">
            Leads, Vendas e Conversões
          </h3>
          <SalesChart data={salesData} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Receita Total", value: "R$ 0,00", color: "green" },
            { label: "Lucro Total", value: "R$ 0,00", color: "blue" },
            { label: "Margem Lucro", value: "0,0%", color: "orange" },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-100">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
