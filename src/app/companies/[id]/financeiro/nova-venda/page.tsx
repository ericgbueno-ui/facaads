"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function NovaVendaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    productName: "",
    amount: "",
    profit: "",
    commission: "",
    quantity: "1",
    paymentMethod: "pix",
    paymentStatus: "completed",
    source: "manual",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/companies/${id}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.productName,
          amount: parseFloat(formData.amount),
          profit: formData.profit ? parseFloat(formData.profit) : undefined,
          commission: formData.commission ? parseFloat(formData.commission) : undefined,
          quantity: parseInt(formData.quantity),
          paymentMethod: formData.paymentMethod,
          paymentStatus: formData.paymentStatus,
          source: formData.source,
          notes: formData.notes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao registrar venda");
      }

      // Redirecionar para financeiro
      router.push(`/companies/${id}/financeiro`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar venda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/companies/${id}/financeiro`} className="text-blue-600 hover:underline mb-4 inline-block">
            ← Voltar para Financeiro
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Registrar Nova Venda</h1>
          <p className="text-gray-600 mt-2">Adicione uma venda ao histórico financeiro</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Produto/Serviço</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Ex: Colchão Queen"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor da Venda *</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">R$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lucro</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">R$</span>
                  <input
                    type="number"
                    name="profit"
                    value={formData.profit}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Comissão e Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comissão</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">R$</span>
                  <input
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fonte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="manual">📝 Manual</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="website">🌐 Website</option>
                <option value="instagram">📷 Instagram</option>
                <option value="email">📧 Email</option>
              </select>
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pix">💳 PIX</option>
                <option value="credit_card">💳 Cartão de Crédito</option>
                <option value="debit_card">💳 Cartão de Débito</option>
                <option value="boleto">📄 Boleto</option>
                <option value="transfer">🏦 Transferência</option>
                <option value="cash">💵 Dinheiro</option>
                <option value="other">📦 Outro</option>
              </select>
            </div>

            {/* Status de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status do Pagamento</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="completed">✅ Concluído</option>
                <option value="pending">⏳ Pendente</option>
                <option value="failed">❌ Falhou</option>
                <option value="cancelled">🚫 Cancelado</option>
              </select>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observações sobre a venda..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                href={`/companies/${id}/financeiro`}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? "Registrando..." : "Registrar Venda"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
