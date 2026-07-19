'use client';

import { AlertTriangle, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LossByReason {
  reason: string;
  count: number;
  totalValueLost: number;
  percent: number;
}

interface LossAnalysisProps {
  totalLosses: number;
  totalValueLost: number;
  lossRate: number;
  byReason: LossByReason[];
  loading?: boolean;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#8b5cf6'];

export function LossAnalysis({
  totalLosses,
  totalValueLost,
  lossRate,
  byReason,
  loading,
}: LossAnalysisProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Análise de Perdas</h3>
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const isHighLossRate = lossRate > 30;
  const chartData = byReason.map((item) => ({
    name: item.reason,
    value: item.count,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <X size={20} className="text-red-500" />
          Análise de Perdas
        </h3>
        {isHighLossRate && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-1 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-600" />
            <span className="text-xs font-medium text-red-600">Taxa alta</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-xs text-gray-600">Total de perdas</p>
          <p className="text-2xl font-bold text-red-600">{totalLosses}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded border border-amber-200">
          <p className="text-xs text-gray-600">Valor total perdido</p>
          <p className="text-2xl font-bold text-amber-600">R$ {totalValueLost.toLocaleString('pt-BR')}</p>
        </div>
        <div className={`p-4 rounded border ${isHighLossRate ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-xs text-gray-600">Taxa de perda</p>
          <p className={`text-2xl font-bold ${isHighLossRate ? 'text-red-600' : 'text-green-600'}`}>
            {lossRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {byReason.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Motivos de Perda</h4>
            <div className="space-y-2">
              {byReason.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{item.reason}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">{item.percent.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} perdas`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {byReason.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>Sem dados de perdas neste período</p>
        </div>
      )}
    </div>
  );
}
