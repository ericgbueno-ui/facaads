'use client';

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  revenue: number;
  cost?: number;
  profit?: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  title?: string;
  type?: 'line' | 'area';
  height?: number;
  showCost?: boolean;
  showProfit?: boolean;
}

export function RevenueChart({
  data,
  title,
  type = 'line',
  height = 300,
  showCost = false,
  showProfit = false,
}: RevenueChartProps) {
  const ChartComponent = type === 'area' ? AreaChart : LineChart;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}

      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data}>
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

          {type === 'area' ? (
            <>
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#93c5fd"
                name="Receita"
              />
              {showCost && (
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#ef4444"
                  fill="#fca5a5"
                  name="Custo"
                />
              )}
              {showProfit && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  fill="#a7f3d0"
                  name="Lucro"
                />
              )}
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                name="Receita"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              {showCost && (
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#ef4444"
                  name="Custo"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                />
              )}
              {showProfit && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  name="Lucro"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
