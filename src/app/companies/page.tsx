"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Company {
  id: string;
  name: string;
  segment: string;
  logo?: string;
  city?: string;
  state?: string;
  status: string;
  userRole: string;
  isOwner: boolean;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    segment: "other",
    city: "",
    state: "",
    phone: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/companies");
      const data = await res.json();
      if (data.ok) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error("Erro ao carregar empresas:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Nome da empresa é obrigatório");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/v1/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar empresa");

      setFormData({ name: "", segment: "other", city: "", state: "", phone: "" });
      setShowNewCompanyForm(false);
      await loadCompanies();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
      admin: { bg: "bg-red-100", text: "text-red-700", label: "Administrador" },
      manager: { bg: "bg-blue-100", text: "text-blue-700", label: "Gerenciador" },
      analyst: { bg: "bg-green-100", text: "text-green-700", label: "Analista" },
      finance: { bg: "bg-purple-100", text: "text-purple-700", label: "Financeiro" },
    };
    const config = roleConfig[role] || roleConfig.analyst;
    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-slate-400">Carregando suas empresas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-2xl font-extrabold text-transparent">
                🏢 HERGÉ AGENCY
              </h1>
              <p className="text-sm text-slate-500">Suas empresas e campanhas</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => signOut({ redirectTo: "/login" })}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Criar Nova Empresa */}
        {!showNewCompanyForm && (
          <button
            onClick={() => setShowNewCompanyForm(true)}
            className="mb-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition"
          >
            ✨ Criar Nova Empresa
          </button>
        )}

        {/* Form Nova Empresa */}
        {showNewCompanyForm && (
          <div className="mb-8 rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Criar Nova Empresa</h2>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Nome da empresa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  required
                />
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="other">Segmento</option>
                  <option value="turismo">Turismo</option>
                  <option value="colchoes">Colchões</option>
                  <option value="clinica">Clínica</option>
                  <option value="imobiliaria">Imobiliária</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="servicos">Serviços</option>
                </select>
                <input
                  type="text"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  placeholder="Estado"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCompanyForm(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-400 disabled:opacity-60 transition"
                >
                  {creating ? "Criando..." : "Criar Empresa"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grid de Empresas */}
        {companies.length === 0 ? (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-12 text-center ring-1 ring-slate-200/70">
            <p className="text-slate-500">Você ainda não tem empresas. Crie uma para começar!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="group rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70 shadow-sm hover:ring-indigo-200/70 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {company.name}
                    </h3>
                    {company.city && (
                      <p className="text-sm text-slate-500">
                        📍 {company.city}, {company.state}
                      </p>
                    )}
                  </div>
                  {company.isOwner && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                      ⭐ Owner
                    </span>
                  )}
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 capitalize">
                    {company.segment || "Outro"}
                  </span>
                  {getRoleBadge(company.userRole)}
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 ${
                    company.status === "active"
                      ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                      : company.status === "inactive"
                      ? "bg-amber-50 text-amber-600 ring-amber-100"
                      : "bg-slate-50 text-slate-600 ring-slate-100"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${company.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {company.status === "active" ? "Ativa" : "Inativa"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500">
        <p>© 2026 HERGÉ AGENCY - Inteligência Comercial para Agências</p>
      </footer>
    </div>
  );
}
