"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MetaAccount {
  id: string;
  name: string;
  externalId: string;
  lastSyncedAt: string | null;
}

export default function SettingsPage() {
  const [metaAccounts, setMetaAccounts] = useState<MetaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accessToken: "",
    businessAccountId: "",
    accountName: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/meta/accounts");
      const data = await response.json();

      if (data.ok) {
        setMetaAccounts(data.accounts);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/meta/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Conta Meta Ads conectada com sucesso!");
        setFormData({ accessToken: "", businessAccountId: "", accountName: "" });
        setShowConnectForm(false);
        await fetchAccounts();
      } else {
        setError(data.error || "Erro ao conectar conta");
      }
    } catch (err) {
      setError("Erro ao conectar conta");
      console.error(err);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/projects" className="text-sm text-neutral-400 hover:text-neutral-200 mb-4 inline-block">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-neutral-100 mb-2">Configurações</h1>
        <p className="text-neutral-400">Conecte suas contas de ads para sincronizar dados</p>
      </div>

      {/* Meta Ads Section */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">📘 Meta Ads</h2>
            <p className="text-sm text-neutral-400">Facebook & Instagram Ads</p>
          </div>
          <button
            onClick={() => setShowConnectForm(!showConnectForm)}
            className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium text-neutral-100 transition-all"
          >
            {showConnectForm ? "Cancelar" : "+ Conectar Conta"}
          </button>
        </div>

        {/* Connect Form */}
        {showConnectForm && (
          <form onSubmit={handleConnect} className="space-y-4 mb-6 p-4 bg-neutral-800 rounded-md">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Token de Acesso</label>
              <input
                type="password"
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                placeholder="Copie seu token do Meta Business Suite"
                className="w-full px-3 py-2 rounded-md border border-neutral-700 bg-neutral-700 text-neutral-100 text-sm"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Obtenha em: business.facebook.com → Configurações → Chaves de app
              </p>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-1">ID da Conta de Negócios</label>
              <input
                type="text"
                value={formData.businessAccountId}
                onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
                placeholder="act_123456789"
                className="w-full px-3 py-2 rounded-md border border-neutral-700 bg-neutral-700 text-neutral-100 text-sm"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Formato: act_XXXXXXXXX
              </p>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-1">Nome da Conta</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="Minha Conta Meta"
                className="w-full px-3 py-2 rounded-md border border-neutral-700 bg-neutral-700 text-neutral-100 text-sm"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={connecting}
              className="w-full px-4 py-2 rounded-md bg-neutral-100 text-neutral-900 text-sm font-medium disabled:opacity-50 hover:bg-neutral-200"
            >
              {connecting ? "Conectando..." : "Conectar"}
            </button>
          </form>
        )}

        {/* Accounts List */}
        {loading ? (
          <p className="text-neutral-400">Carregando...</p>
        ) : metaAccounts.length === 0 ? (
          <p className="text-neutral-400 text-sm">Nenhuma conta conectada</p>
        ) : (
          <div className="space-y-2">
            {metaAccounts.map((account) => (
              <div key={account.id} className="p-3 bg-neutral-800 rounded-md">
                <p className="text-neutral-100 font-medium">{account.name}</p>
                <p className="text-xs text-neutral-500">ID: {account.externalId}</p>
                {account.lastSyncedAt && (
                  <p className="text-xs text-neutral-500">
                    Última sincronização: {new Date(account.lastSyncedAt).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-900 border border-green-700 text-green-100 text-sm">
          {success}
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
        <h3 className="text-sm font-semibold text-neutral-200 mb-2">Como conectar sua conta Meta Ads?</h3>
        <ol className="text-xs text-neutral-400 space-y-1 list-decimal list-inside">
          <li>Acesse <a href="https://business.facebook.com" className="text-blue-400 hover:underline">business.facebook.com</a></li>
          <li>Vá para Configurações → Chaves de app</li>
          <li>Copie seu Token de Acesso Permanente</li>
          <li>Copie o ID da sua Conta de Negócios (Ad Account)</li>
          <li>Cole os dados acima e clique em Conectar</li>
        </ol>
      </div>
    </div>
  );
}
