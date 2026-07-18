"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Knowledge {
  id: string;
  websiteUrl?: string;
  instagramHandle?: string;
  products?: string[];
  services?: string[];
  mission?: string;
  history?: string;
  businessHours?: Record<string, string>;
  phone?: string;
  email?: string;
  lastScrapedAt?: string;
}

interface LeadInteraction {
  id: string;
  leadName?: string;
  leadEmail?: string;
  sourceType: string;
  messageReceived: string;
  aiResponse: string;
  actionTaken: string;
  qualificationScore?: number;
  createdAt: string;
}

export default function AILeadsPage() {
  const params = useParams();
  const id = params.id as string;

  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Carregar knowledge base
  useEffect(() => {
    const loadKnowledge = async () => {
      try {
        const res = await fetch(`/api/v1/companies/${id}/knowledge`);
        if (res.ok) {
          const data = await res.json();
          setKnowledge(data.data);
        }
      } catch (err) {
        console.error("Error loading knowledge:", err);
      } finally {
        setLoading(false);
      }
    };

    loadKnowledge();
  }, [id]);

  // Fazer scrape do website
  const handleScrapeWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setScraping(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `/api/v1/companies/${id}/knowledge/scrape-website`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ websiteUrl }),
        }
      );

      if (!res.ok) throw new Error("Failed to scrape website");

      const data = await res.json();
      setKnowledge(data.knowledge);
      setWebsiteUrl("");
      setSuccess("Website scraped successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setTimeout(() => setError(""), 3000);
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/companies/${id}`} className="text-blue-600 hover:underline mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">IA Autônoma - Base de Conhecimento</h1>
          <p className="text-gray-600 mt-2">Configure os dados da sua empresa para respostas de IA</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Website Scraping */}
          <div className="lg:col-span-2">
            {/* Website Scraping Card */}
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📱 Website Scraping</h2>

              <form onSubmit={handleScrapeWebsite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Website
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://seusite.com.br"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={scraping}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {scraping ? "Fazendo scrape..." : "Fazer Scrape"}
                </button>
              </form>

              {knowledge?.websiteUrl && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Website atual:</strong> {knowledge.websiteUrl}
                  </p>
                  {knowledge.lastScrapedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Última atualização: {new Date(knowledge.lastScrapedAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Products & Services */}
            {knowledge && (knowledge.products?.length || 0) > 0 && (
              <div className="bg-white rounded-lg shadow p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🛍️ Produtos Identificados</h2>
                <div className="grid grid-cols-2 gap-4">
                  {knowledge.products?.map((product, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{product}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {knowledge && (knowledge.services?.length || 0) > 0 && (
              <div className="bg-white rounded-lg shadow p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Serviços</h2>
                <div className="grid grid-cols-2 gap-4">
                  {knowledge.services?.map((service, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{service}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info Summary */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📋 Informações da Empresa</h3>

              <div className="space-y-4">
                {knowledge?.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Telefone</p>
                    <p className="text-gray-900">{knowledge.phone}</p>
                  </div>
                )}

                {knowledge?.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                    <p className="text-gray-900 break-all">{knowledge.email}</p>
                  </div>
                )}

                {knowledge?.instagramHandle && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Instagram</p>
                    <p className="text-gray-900">@{knowledge.instagramHandle}</p>
                  </div>
                )}

                {knowledge?.businessHours && Object.keys(knowledge.businessHours).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Horários</p>
                    <div className="space-y-1">
                      {Object.entries(knowledge.businessHours).map(([day, hours]) => (
                        <p key={day} className="text-sm text-gray-700">
                          <span className="font-medium">{day}:</span> {hours}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {!knowledge && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Nenhuma base de conhecimento configurada. Faça o scrape do seu website!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lead Interactions Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Histórico de Respostas</h2>
          <p className="text-gray-600">
            Aqui aparecerão as interações automáticas com leads quando começarem a chegar.
          </p>
        </div>
      </div>
    </div>
  );
}
