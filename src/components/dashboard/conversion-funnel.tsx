"use client";

interface FunnelStep {
  label: string;
  value: number;
  percentage: number;
}

interface ConversionFunnelProps {
  steps: FunnelStep[];
}

const number = new Intl.NumberFormat("pt-BR");

export function ConversionFunnel({ steps }: ConversionFunnelProps) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <h3 className="mb-6 text-sm font-medium text-neutral-200">Funil de Conversão</h3>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const width = step.percentage;
          return (
            <div key={step.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-neutral-400">{step.label}</span>
                <span className="text-neutral-300">
                  {number.format(step.value)} ({step.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="overflow-hidden rounded bg-neutral-800">
                <div
                  className={`h-8 transition-all ${
                    idx === 0
                      ? "bg-blue-600"
                      : idx === 1
                        ? "bg-blue-500"
                        : "bg-green-600"
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
