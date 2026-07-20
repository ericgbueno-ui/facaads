"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface HealthData {
  generatedAt: string;
  summary: { trustworthy: boolean; demoRecords: number; connectedIntegrations: number; failedIntegrations: number };
  origins: Record<string, Array<{ dataOrigin: string; _count: number }>>;
  integrations: Array<{ id: string; type: string; name: string; status: string; lastSyncAt: string | null; lastError: string | null }>;
}

export default function DataHealthPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/companies/${id}/data-health`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Saúde dos dados indisponível");
        return body;
      })
      .then(setData)
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href={`/companies/${id}`} className="text-sm text-cyan-300">← Voltar para a empresa</Link>
        <div>
          <h1 className="text-3xl font-semibold">Saúde dos Dados</h1>
          <p className="mt-2 text-slate-400">Origem, sincronização e confiabilidade dos registros operacionais.</p>
        </div>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}
        {!data && !error && <div className="text-slate-400">Carregando dados auditáveis…</div>}

        {data && (
          <>
            <div className={`rounded-xl border p-5 ${data.summary.trustworthy ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
              <p className="font-semibold">{data.summary.trustworthy ? "Base sem contaminação DEMO detectada" : "Atenção necessária na origem dos dados"}</p>
              <p className="mt-1 text-sm text-slate-300">{data.summary.demoRecords} registros DEMO · {data.summary.connectedIntegrations} integrações conectadas · {data.summary.failedIntegrations} com erro</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(data.origins).map(([entity, origins]) => (
                <section key={entity} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h2 className="font-semibold capitalize">{entity}</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    {origins.length === 0 && <p className="text-slate-500">Nenhum registro</p>}
                    {origins.map((origin) => (
                      <div key={origin.dataOrigin} className="flex justify-between"><span>{origin.dataOrigin}</span><strong>{origin._count}</strong></div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">Integrações</h2>
              <div className="mt-4 space-y-3">
                {data.integrations.length === 0 && <p className="text-sm text-slate-500">Nenhuma integração cadastrada.</p>}
                {data.integrations.map((integration) => (
                  <div key={integration.id} className="flex flex-col justify-between gap-2 rounded-lg border border-white/5 p-3 md:flex-row">
                    <div><strong>{integration.name}</strong><p className="text-xs text-slate-500">{integration.type}</p></div>
                    <div className="text-sm md:text-right"><p>{integration.status}</p><p className="text-xs text-slate-500">Última sincronização: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString("pt-BR") : "nunca"}</p></div>
                    {integration.lastError && <p className="text-sm text-red-300">{integration.lastError}</p>}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
