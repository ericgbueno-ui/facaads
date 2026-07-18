"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface ConversationDetail {
  id: string;
  phoneNumber: string;
  status: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
    type: string;
  }>;
  lead: {
    id: string;
    name: string;
    email?: string;
  } | null;
  analyses: Array<{
    id: string;
    type: string;
    result: any;
    confidence: number;
    createdAt: string;
  }>;
}

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  async function loadConversation() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/v1/companies/${companyId}/whatsapp/${conversationId}`
      );
      if (!res.ok) throw new Error("Erro ao carregar conversa");
      const data = await res.json();
      setConversation(data.conversation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/v1/companies/${companyId}/whatsapp/${conversationId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMessage }),
        }
      );

      if (!res.ok) throw new Error("Erro ao enviar mensagem");

      setNewMessage("");
      await loadConversation();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Carregando conversa...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || "Conversa não encontrada"}</p>
        <Link href={`/companies/${companyId}/whatsapp`} className="text-indigo-600">
          ← Voltar
        </Link>
      </div>
    );
  }

  const latestAnalysis = conversation.analyses[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/companies/${companyId}/whatsapp`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300 transition"
            >
              ← Voltar
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">
                {conversation.lead?.name || `+${conversation.phoneNumber}`}
              </h1>
              <p className="text-xs text-slate-500">{conversation.phoneNumber}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat */}
          <div className="lg:col-span-2 rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/70 overflow-hidden flex flex-col h-[600px]">
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-slate-100 text-slate-900"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escrever mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>

          {/* Análise de IA */}
          <div className="lg:col-span-1 space-y-4">
            {latestAnalysis && latestAnalysis.result && (
              <>
                {/* Card Sentimento */}
                <div className="rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/70 p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Sentimento</h3>
                  <div className="text-3xl mb-2">
                    {latestAnalysis.result.sentiment === "positive"
                      ? "😊"
                      : latestAnalysis.result.sentiment === "negative"
                      ? "😞"
                      : "😐"}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 capitalize">
                    {latestAnalysis.result.sentiment}
                  </p>
                </div>

                {/* Card Probabilidade */}
                <div className="rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/70 p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">
                    Probabilidade de Compra
                  </h3>
                  <div className="text-4xl font-bold text-indigo-600">
                    {latestAnalysis.result.purchaseLikelihood}%
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${latestAnalysis.result.purchaseLikelihood}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Objeções */}
                {latestAnalysis.result.hasObjection && (
                  <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4">
                    <h3 className="font-bold text-sm text-amber-900 mb-2">
                      ⚠️ Objeções Detectadas
                    </h3>
                    <div className="space-y-1">
                      {latestAnalysis.result.objections.map((obj: string) => (
                        <p key={obj} className="text-sm text-amber-800 capitalize">
                          • {obj}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ação Recomendada */}
                <div className="rounded-2xl bg-green-50 ring-1 ring-green-200 p-4">
                  <h3 className="font-bold text-sm text-green-900 mb-2">
                    💡 Próxima Ação
                  </h3>
                  <p className="text-sm text-green-800 mb-2 capitalize">
                    {latestAnalysis.result.nextAction}
                  </p>
                  <p className="text-xs text-green-700 italic">
                    "{latestAnalysis.result.suggestedResponse}"
                  </p>
                </div>

                {/* Resumo */}
                <div className="rounded-2xl bg-blue-50 ring-1 ring-blue-200 p-4">
                  <h3 className="font-bold text-sm text-blue-900 mb-2">Resumo</h3>
                  <p className="text-sm text-blue-800">
                    {latestAnalysis.result.summary}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
