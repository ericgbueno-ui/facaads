'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ForecastData {
  date: string;
  projected: number;
  actual?: number;
  confidence: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  title?: string;
  height?: number;
}

export function ForecastChart({ data, title, height = 300 }: ForecastChartProps) {
  const hasActual = data.some((d) => d.actual);
  const avgConfidence = (data.reduce((sum, d) => sum + d.confidence, 0) / data.length * 100).toFixed(0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          <p className="text-sm text-gray-600 mt-1">
            Confiança média: <span className="font-medium text-blue-600">{avgConfidence}%</span>
          </p>
        </div>
        <TrendingUp size={24} className="text-blue-500" />
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
          />
          <Legend />

          {hasActual && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              name="Receita Real"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
          )}

          <Line
            type="monotone"
            dataKey="projected"
            stroke="#3b82f6"
            name="Projeção"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', r: 4 }}
          />

          {/* Intervalo de confiança */}
          {data[0] && (
            <ReferenceLine
              y={data[0].projected * 0.9}
              stroke="#f3f4f6"
              strokeDasharray="3 3"
              label="Intervalo -10%"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-xs text-gray-600">Próximo mês (projeção)</p>
          <p className="text-xl font-bold text-blue-600">
            R$ {data[0]?.projected.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <p className="text-xs text-gray-600">Variação esperada</p>
          <p className="text-xl font-bold text-green-600">±15%</p>
        </div>
      </div>
    </div>
  );
}
