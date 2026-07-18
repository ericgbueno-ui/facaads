"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Sale {
  id: string;
  amount: number;
  profit?: number;
  commission?: number;
  productName?: string;
  quantity?: number;
  paymentStatus: string;
  source: string;
  createdAt: string;
}

interface SalesReport {
  summary: {
    totals: {
      sales: number;
      revenue: number;
      profit: number;
      commission: number;
      quantity: number;
    };
    status: Record<string, number>;
    metrics: {
      averageTicket: number;
      profitMargin: number;
      conversionRate: number;
      profitPerSale: number;
    };
    bySources: Record<string, any>;
    byDay: Record<string, any>;
  };
  rawData: Sale[];
}

export default function FinanceiroPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<SalesReport | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Carregar relatório
  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const url = new URL(`/api/v1/companies/${id}/sales/report`, window.location.origin);
        if (startDate) url.searchParams.append("startDate", startDate);
        if (endDate) url.searchParams.append("endDate", endDate);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setReport(data.summary);
          setSales(data.rawData);
        }
      } catch (err) {
        console.error("Error loading report:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id, startDate, endDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = report || {
    totals: { sales: 0, revenue: 0, profit: 0, commission: 0, quantity: 0 },
    status: {},
    metrics: { averageTicket: 0, profitMargin: 0, conversionRate: 0, profitPerSale: 0 },
    bySources: {},
    byDay: {},
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/companies/${id}`} className="text-blue-600 hover:underline mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">💰 Financeiro</h1>
          <p className="text-gray-600 mt-2">Dashboard de vendas, lucro e comissões</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Receita Total */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Receita Total</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              R$ {data.totals.revenue.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">{data.totals.sales} vendas</p>
          </div>

          {/* Lucro Total */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Lucro Total</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              R$ {data.totals.profit.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Margem: {data.metrics.profitMargin.toFixed(1)}%
            </p>
          </div>

          {/* Comissão */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Comissão</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              R$ {data.totals.commission.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Lucro/Venda: R$ {data.metrics.profitPerSale.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Ticket Médio</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              R$ {data.metrics.averageTicket.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Taxa conversão: {data.metrics.conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Status de Pagamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Por Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Status de Pagamento</h2>
            <div className="space-y-3">
              {Object.entries(data.status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {status === "completed" ? "✅ Concluído" :
                     status === "pending" ? "⏳ Pendente" :
                     status === "failed" ? "❌ Falhou" :
                     "🚫 Cancelado"}
                  </span>
                  <span className="font-bold text-gray-900">{count} vendas</span>
                </div>
              ))}
            </div>
          </div>

          {/* Por Fonte */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Receita por Fonte</h2>
            <div className="space-y-3">
              {Object.entries(data.bySources).map(([source, info]: [string, any]) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {source === "manual" ? "📝 Manual" :
                     source === "whatsapp" ? "💬 WhatsApp" :
                     source === "website" ? "🌐 Website" :
                     source === "instagram" ? "📷 Instagram" :
                     "📧 Email"}
                  </span>
                  <span className="font-bold text-gray-900">
                    R$ {info.revenue.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela de Vendas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Vendas Recentes</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Lucro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Comissão</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fonte</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 20).map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sale.productName || "Produto sem nome"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      R$ {Number(sale.amount).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {sale.profit ? `R$ ${Number(sale.profit).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-600">
                      {sale.commission ? `R$ ${Number(sale.commission).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sale.source === "manual" ? "📝 Manual" :
                       sale.source === "whatsapp" ? "💬 WhatsApp" :
                       sale.source === "website" ? "🌐 Website" :
                       sale.source === "instagram" ? "📷 Instagram" :
                       "📧 Email"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        sale.paymentStatus === "completed" ? "bg-green-100 text-green-800" :
                        sale.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                        sale.paymentStatus === "failed" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {sale.paymentStatus === "completed" ? "✅ Concluído" :
                         sale.paymentStatus === "pending" ? "⏳ Pendente" :
                         sale.paymentStatus === "failed" ? "❌ Falhou" :
                         "🚫 Cancelado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sales.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Nenhuma venda registrada neste período
            </div>
          )}
        </div>

        {/* Ações: Registrar Venda + Exportar */}
        <div className="mt-8 flex justify-end gap-4">
          <a
            href={`/api/v1/companies/${id}/sales/export?format=csv`}
            download={`relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            📥 Exportar CSV
          </a>
          <a
            href={`/api/v1/companies/${id}/sales/export?format=pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            📄 Ver PDF
          </a>
          <Link
            href={`/companies/${id}/financeiro/nova-venda`}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            + Registrar Venda
          </Link>
        </div>
      </div>
    </div>
  );
}
