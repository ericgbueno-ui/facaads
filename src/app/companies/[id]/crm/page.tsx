"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Stage {
  id: string;
  name: string;
  order: number;
  color: string;
  isFinal: boolean;
  isWon?: boolean | null;
  _count: { leads: number };
}

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  stages: Stage[];
  _count: { leads: number };
}

export default function CRMPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewPipelineForm, setShowNewPipelineForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    loadPipelines();
  }, [companyId]);

  async function loadPipelines() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/companies/${companyId}/pipelines`);
      if (!res.ok) throw new Error("Erro ao carregar pipelines");
      const data = await res.json();
      setPipelines(data.pipelines);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePipeline(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Nome do pipeline é obrigatório");
      return;
    }

    try {
      const res = await fetch(`/api/v1/companies/${companyId}/pipelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isDefault: pipelines.length === 0 }),
      });

      if (!res.ok) throw new Error("Erro ao criar pipeline");

      setFormData({ name: "", description: "" });
      setShowNewPipelineForm(false);
      await loadPipelines();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Carregando CRM...</div>
      </div>
    );
  }

  const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/companies/${companyId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm transition hover:ring-indigo-300"
              >
                ← Voltar
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">🎯 CRM</h1>
                <p className="text-xs text-slate-400">Pipeline de Vendas</p>
              </div>
            </div>
            {!showNewPipelineForm && (
              <button
                onClick={() => setShowNewPipelineForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-blue-400 transition"
              >
                ➕ Novo Pipeline
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-6 py-8">
        {/* Form Novo Pipeline */}
        {showNewPipelineForm && (
          <div className="mb-8 rounded-2xl bg-white/80 backdrop-blur-sm p-6 ring-1 ring-slate-200/70">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Criar Novo Pipeline</h2>
            <form onSubmit={handleCreatePipeline} className="space-y-4">
              <input
                type="text"
                placeholder="Nome do pipeline"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                required
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                rows={2}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPipelineForm(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-blue-400"
                >
                  Criar Pipeline
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pipelines Selector */}
        {pipelines.length > 1 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {pipelines.map((pipeline) => (
              <button
                key={pipeline.id}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                  pipeline.isDefault
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white/80 text-slate-700 ring-1 ring-slate-200/70 hover:ring-indigo-200"
                }`}
              >
                {pipeline.name} ({pipeline._count.leads})
              </button>
            ))}
          </div>
        )}

        {/* Kanban Board */}
        {defaultPipeline ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6" style={{ minWidth: "100%" }}>
              {defaultPipeline.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80 rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/70 overflow-hidden flex flex-col"
                >
                  {/* Stage Header */}
                  <div
                    className="p-4 text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    <h3 className="font-bold text-sm">{stage.name}</h3>
                    <p className="text-xs opacity-90 mt-1">
                      {stage._count.leads} lead{stage._count.leads !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[600px]">
                    <div className="p-3 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Arraste leads aqui
                    </div>
                  </div>

                  {/* Stage Footer */}
                  {!stage.isFinal && (
                    <div className="p-4 border-t border-slate-100">
                      <button className="w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 py-2 rounded hover:bg-indigo-50">
                        + Adicionar Lead
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-12 text-center ring-1 ring-slate-200/70">
            <p className="text-slate-500 mb-4">Nenhum pipeline configurado</p>
            <button
              onClick={() => setShowNewPipelineForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
            >
              ➕ Criar Primeiro Pipeline
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
