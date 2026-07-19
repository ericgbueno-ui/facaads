'use client';

import { Target, CheckCircle, AlertCircle } from 'lucide-react';

interface Goal {
  id: string;
  metric: string;
  target: number;
  current: number;
  progress: number;
  remaining: number;
  daysRemaining: number;
}

interface GoalsProgressProps {
  goals: Goal[];
  onUpdate?: (goalId: string, value: number) => void;
  loading?: boolean;
}

const getProgressColor = (progress: number) => {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const getStatusIcon = (progress: number) => {
  if (progress >= 100) return <CheckCircle size={20} className="text-green-600" />;
  if (progress < 50) return <AlertCircle size={20} className="text-red-600" />;
  return null;
};

export function GoalsProgress({ goals, onUpdate, loading }: GoalsProgressProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Metas</h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
        <Target size={20} className="text-blue-500" />
        Metas
      </h3>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 capitalize">{goal.metric}</p>
                <p className="text-sm text-gray-600">
                  R$ {goal.current.toLocaleString('pt-BR')} / R$ {goal.target.toLocaleString('pt-BR')}
                </p>
              </div>
              {getStatusIcon(goal.progress)}
            </div>

            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{goal.progress.toFixed(1)}%</span>
                <span className="text-xs text-gray-500">{goal.daysRemaining} dias restantes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(goal.progress)}`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Faltam: R$ {(goal.target - goal.current).toLocaleString('pt-BR')}
              </p>
              {goal.progress < 100 && onUpdate && (
                <button
                  onClick={() => onUpdate(goal.id, goal.current + 1000)}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition"
                >
                  Atualizar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>Nenhuma meta definida</p>
        </div>
      )}
    </div>
  );
}
