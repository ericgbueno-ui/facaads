'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'amber';
  loading?: boolean;
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  red: 'bg-red-50 border-red-200',
  amber: 'bg-amber-50 border-amber-200',
};

const trendColorMap = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600',
};

export function KPICard({
  label,
  value,
  unit,
  trend,
  changePercent,
  icon,
  color = 'blue',
  loading,
}: KPICardProps) {
  return (
    <div className={`border rounded-lg p-6 ${colorMap[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="mb-4">
        {loading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
        ) : (
          <div className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            {unit && <span className="text-lg font-normal ml-2 text-gray-600">{unit}</span>}
          </div>
        )}
      </div>

      {trend && changePercent !== undefined && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${trendColorMap[trend]}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-sm font-medium">{Math.abs(changePercent)}%</span>
          </div>
          <span className="text-xs text-gray-600">vs período anterior</span>
        </div>
      )}

      {trend === 'down' && changePercent && changePercent > 10 && (
        <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs">
          <AlertCircle size={14} />
          <span>Atenção: queda significativa</span>
        </div>
      )}
    </div>
  );
}
