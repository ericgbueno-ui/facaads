"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  segment: string;
  status: string;
  city?: string;
  state?: string;
  responsibleName?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  shopee?: string;
  users: Array<{
    role: string;
    isOwner: boolean;
    user: {
      id: string;
      name?: string;
      email: string;
    };
  }>;
  _count: {
    leads: number;
    sales: number;
    adAccounts: number;
    integrations: number;
  };
}

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  async function loadCompany() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/companies/${companyId}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("Você não tem acesso a esta empresa");
          return;
        }
        throw new Error("Erro ao carregar empresa");
      }
      const data = await res.json();
      setCompany(data.company);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar empresa");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-slate-400">Carregando empresa...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 ring-1 ring-slate-200 text-center max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error || "Empresa não encontrada"}</p>
          <button
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm transition hover:ring-indigo-300 hover:text-indigo-600"
            >
              ← Voltar
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{company.name}</h1>
              <p className="text-xs text-slate-400">{company.segment}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 ${
                company.status === "active"
                  ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                  : "bg-slate-50 text-slate-600 ring-slate-100"
              }`}>
                <span className={`h-2 w-2 rounded-full ${company.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                {company.status === "active" ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Quick Access Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/companies/${companyId}/dashboard`}
            className="group rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm hover:ring-indigo-200/70 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">Dashboard</h3>
            <p className="text-xs text-slate-500">Métricas e KPIs</p>
          </Link>

          <Link
            href={`/companies/${companyId}/crm`}
            className="group rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm hover:ring-blue-200/70 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition">CRM</h3>
            <p className="text-xs text-slate-500">Leads e Pipeline</p>
          </Link>

          <Link
            href={`/companies/${companyId}/integrations`}
            className="group rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm hover:ring-green-200/70 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl mb-2">🔌</div>
            <h3 className="font-semibold text-slate-900 group-hover:text-green-600 transition">Integrações</h3>
            <p className="text-xs text-slate-500">Ads, WhatsApp, Analytics</p>
          </Link>

          <Link
            href={`/companies/${companyId}/financeiro`}
            className="group rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm hover:ring-purple-200/70 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition">Financeiro</h3>
            <p className="text-xs text-slate-500">Vendas e Lucro</p>
          </Link>

          <Link
            href={`/companies/${companyId}/ai-leads`}
            className="group rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm hover:ring-orange-200/70 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition">IA Autônoma</h3>
            <p className="text-xs text-slate-500">Respostas automáticas</p>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 ring-1 ring-slate-200/70 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{company._count.leads}</div>
            <div className="text-xs text-slate-500 mt-1">Leads Cadastrados</div>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 ring-1 ring-slate-200/70 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{company._count.sales}</div>
            <div className="text-xs text-slate-500 mt-1">Vendas Registradas</div>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 ring-1 ring-slate-200/70 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{company._count.adAccounts}</div>
            <div className="text-xs text-slate-500 mt-1">Contas de Ads</div>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 ring-1 ring-slate-200/70 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{company._count.integrations}</div>
            <div className="text-xs text-slate-500 mt-1">Integrações</div>
          </div>
        </div>

        {/* Informações da Empresa */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Informações de Contato</h2>
            <div className="space-y-3">
              {company.responsibleName && (
                <div>
                  <p className="text-xs text-slate-500">Responsável</p>
                  <p className="font-medium text-slate-900">{company.responsibleName}</p>
                </div>
              )}
              {company.phone && (
                <div>
                  <p className="text-xs text-slate-500">Telefone</p>
                  <p className="font-medium text-slate-900">{company.phone}</p>
                </div>
              )}
              {company.whatsapp && (
                <div>
                  <p className="text-xs text-slate-500">WhatsApp</p>
                  <p className="font-medium text-slate-900">{company.whatsapp}</p>
                </div>
              )}
              {company.city && (
                <div>
                  <p className="text-xs text-slate-500">Localização</p>
                  <p className="font-medium text-slate-900">{company.city}, {company.state}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Redes Sociais & URLs</h2>
            <div className="space-y-2">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                  🌐 Website
                </a>
              )}
              {company.instagram && (
                <a href={`https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                  📷 Instagram
                </a>
              )}
              {company.facebook && (
                <a href={`https://facebook.com/${company.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                  👍 Facebook
                </a>
              )}
              {company.tiktok && (
                <a href={`https://tiktok.com/@${company.tiktok}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                  🎵 TikTok
                </a>
              )}
              {company.shopee && (
                <a href={`https://shopee.com.br/${company.shopee}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                  🛍️ Shopee
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Usuários */}
        {company.users.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Usuários</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Usuário</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Email</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Role</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {company.users.map((cu) => (
                    <tr key={cu.user.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-3 py-3 font-medium text-slate-900">{cu.user.name || "Sem nome"}</td>
                      <td className="px-3 py-3 text-slate-600">{cu.user.email}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize">
                          {cu.role}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {cu.isOwner && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            ⭐ Owner
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
