"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Conversation {
  id: string;
  phoneNumber: string;
  status: string;
  lastMessageAt: string;
  lastMessage: string | null;
  lead: {
    id: string;
    name: string;
    email?: string;
  } | null;
  sentiment: string;
  purchaseLikelihood: number;
}

export default function WhatsAppPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadConversations();
  }, [companyId, search]);

  async function loadConversations() {
    try {
      setLoading(true);
      let url = `/api/v1/companies/${companyId}/whatsapp`;
      if (search) url += `?search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao carregar conversas");
      const data = await res.json();
      setConversations(data.conversations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50 text-green-700";
      case "negative":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      default:
        return "😐";
    }
  };

  const getStatusBadge = (likelihood: number) => {
    if (likelihood >= 75) return { label: "Bem Qualificado", color: "bg-green-100 text-green-700" };
    if (likelihood >= 50) return { label: "Qualificado", color: "bg-blue-100 text-blue-700" };
    if (likelihood >= 25) return { label: "Interessado", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Novo", color: "bg-slate-100 text-slate-700" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Carregando conversas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/companies/${companyId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm hover:ring-indigo-300 transition"
              >
                ← Voltar
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">💬 WhatsApp</h1>
                <p className="text-xs text-slate-400">Conversas sincronizadas com IA</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por cliente ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {/* Conversas */}
        {conversations.length === 0 ? (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-12 text-center ring-1 ring-slate-200/70">
            <p className="text-slate-500">Nenhuma conversa ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const statusBadge = getStatusBadge(conv.purchaseLikelihood);
              return (
                <Link
                  key={conv.id}
                  href={`/companies/${companyId}/whatsapp/${conv.id}`}
                  className="block rounded-2xl bg-white/80 backdrop-blur-sm p-4 ring-1 ring-slate-200/70 shadow-sm hover:ring-indigo-200/70 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {conv.lead?.name || `+${conv.phoneNumber}`}
                          </h3>
                          <p className="text-xs text-slate-500">{conv.phoneNumber}</p>
                        </div>
                      </div>

                      {/* Última mensagem */}
                      {conv.lastMessage && (
                        <p className="text-sm text-slate-600 truncate">
                          {conv.lastMessage.slice(0, 80)}...
                        </p>
                      )}
                    </div>

                    {/* Métricas */}
                    <div className="flex items-end gap-4 text-right">
                      {/* Sentimento */}
                      <div className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${getSentimentColor(conv.sentiment)}`}>
                        {getSentimentEmoji(conv.sentiment)} {conv.sentiment === "positive" ? "Positivo" : conv.sentiment === "negative" ? "Negativo" : "Neutro"}
                      </div>

                      {/* Status */}
                      <div className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${statusBadge.color}`}>
                        {conv.purchaseLikelihood}%
                      </div>

                      {/* Tempo */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400">
                          {new Date(conv.lastMessageAt).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(conv.lastMessageAt).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
