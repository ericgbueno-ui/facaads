'use client';

import { ChevronRight } from 'lucide-react';

interface Sale {
  id: string;
  attendantName?: string;
  totalAmount: number;
  profitMargin?: number;
  status: 'VENDA_REALIZADA' | 'VENDA_CANCELADA' | 'VENDA_PERDIDA';
  saleDate: string;
}

interface SalesTableProps {
  sales: Sale[];
  onRowClick?: (saleId: string) => void;
  loading?: boolean;
}

const statusColorMap = {
  VENDA_REALIZADA: 'bg-green-50 text-green-700 border-green-200',
  VENDA_CANCELADA: 'bg-gray-50 text-gray-700 border-gray-200',
  VENDA_PERDIDA: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabelMap = {
  VENDA_REALIZADA: 'Realizada',
  VENDA_CANCELADA: 'Cancelada',
  VENDA_PERDIDA: 'Perdida',
};

export function SalesTable({ sales, onRowClick, loading }: SalesTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vendedor</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Margem</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr
              key={sale.id}
              className="hover:bg-gray-50 cursor-pointer transition"
              onClick={() => onRowClick?.(sale.id)}
            >
              <td className="px-6 py-4 text-sm text-gray-900">{sale.attendantName || '-'}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                R$ {sale.totalAmount.toLocaleString('pt-BR')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {sale.profitMargin ? (sale.profitMargin * 100).toFixed(1) + '%' : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded border ${statusColorMap[sale.status]}`}>
                  {statusLabelMap[sale.status]}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4 text-right">
                <ChevronRight size={18} className="text-gray-400" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sales.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          <p>Nenhuma venda encontrada</p>
        </div>
      )}
    </div>
  );
}
