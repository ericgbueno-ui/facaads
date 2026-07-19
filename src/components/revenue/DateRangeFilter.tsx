'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangeFilterProps {
  onChangeRange: (range: DateRange) => void;
  defaultDays?: number;
}

export function DateRangeFilter({ onChangeRange, defaultDays = 30 }: DateRangeFilterProps) {
  const [rangeType, setRangeType] = useState<'7days' | '30days' | '90days' | 'custom'>('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const getDateRange = (type: string) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (type) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'custom':
        if (customStart && customEnd) {
          return { startDate: new Date(customStart), endDate: new Date(customEnd) };
        }
        return null;
    }

    return { startDate, endDate };
  };

  const handleRangeChange = (type: string) => {
    setRangeType(type as any);
    const range = getDateRange(type);
    if (range) {
      onChangeRange(range);
    }
  };

  const handleCustomRangeChange = () => {
    if (customStart && customEnd) {
      onChangeRange({
        startDate: new Date(customStart),
        endDate: new Date(customEnd),
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-600" />
          <span className="font-medium text-gray-900">Período:</span>
        </div>

        <button
          onClick={() => handleRangeChange('7days')}
          className={`px-4 py-2 rounded border transition ${
            rangeType === '7days'
              ? 'bg-blue-50 border-blue-300 text-blue-600 font-medium'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Últimos 7 dias
        </button>

        <button
          onClick={() => handleRangeChange('30days')}
          className={`px-4 py-2 rounded border transition ${
            rangeType === '30days'
              ? 'bg-blue-50 border-blue-300 text-blue-600 font-medium'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Últimos 30 dias
        </button>

        <button
          onClick={() => handleRangeChange('90days')}
          className={`px-4 py-2 rounded border transition ${
            rangeType === '90days'
              ? 'bg-blue-50 border-blue-300 text-blue-600 font-medium'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Últimos 90 dias
        </button>

        {rangeType === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded text-sm"
            />
            <span className="text-gray-400">até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded text-sm"
            />
            <button
              onClick={handleCustomRangeChange}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
            >
              Aplicar
            </button>
          </div>
        )}

        {rangeType !== 'custom' && (
          <button
            onClick={() => setRangeType('custom')}
            className="px-4 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            Período customizado
          </button>
        )}
      </div>
    </div>
  );
}
