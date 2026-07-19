'use client';

import { Trophy, Medal } from 'lucide-react';

interface RankingItem {
  rank: number;
  name: string;
  value: number;
  metric: string;
  change?: number;
}

interface RankingsProps {
  title: string;
  items: RankingItem[];
  type?: 'campaigns' | 'attendants' | 'products' | 'channels';
  loading?: boolean;
}

const medalColors = {
  1: 'bg-yellow-100 text-yellow-700',
  2: 'bg-gray-100 text-gray-700',
  3: 'bg-orange-100 text-orange-700',
};

const getMedalIcon = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

export function Rankings({ title, items, type = 'campaigns', loading }: RankingsProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
        <Trophy size={20} className="text-amber-500" />
        {title}
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.rank}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              item.rank <= 3 ? medalColors[item.rank as 1 | 2 | 3] : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="text-2xl font-bold w-8">
                {getMedalIcon(item.rank) || `#${item.rank}`}
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{type}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-gray-900">
                {typeof item.value === 'number'
                  ? item.value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : item.value}
              </p>
              <p className="text-xs text-gray-500">{item.metric}</p>
              {item.change && (
                <p className={`text-xs font-medium ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
}
