"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CHANNELS = [
  {
    id: "META",
    name: "Meta Ads",
    icon: "📘",
    description: "Facebook & Instagram Ads",
  },
  {
    id: "GOOGLE",
    name: "Google Ads",
    icon: "🔵",
    description: "Google Search & Display",
  },
  {
    id: "TIKTOK",
    name: "TikTok Ads",
    icon: "🎵",
    description: "TikTok Business Center",
  },
  {
    id: "SHOPEE",
    name: "Shopee Ads",
    icon: "🛍️",
    description: "Shopee Seller Center",
  },
];

const ACCOUNTS: Record<string, Array<{ id: string; name: string; businessId: string }>> = {
  META: [
    { id: "meta-001", name: "Conta Principal", businessId: "act_123456" },
    { id: "meta-002", name: "Conta Secundária", businessId: "act_789012" },
    { id: "meta-003", name: "Testes", businessId: "act_345678" },
  ],
  GOOGLE: [
    { id: "google-001", name: "MCC Principal", businessId: "123-456-789" },
    { id: "google-002", name: "Conta Performance Max", businessId: "456-789-123" },
    { id: "google-003", name: "Search Ads", businessId: "789-123-456" },
  ],
  TIKTOK: [
    { id: "tiktok-001", name: "E-commerce", businessId: "tt_business_001" },
    { id: "tiktok-002", name: "Brand Awareness", businessId: "tt_business_002" },
  ],
  SHOPEE: [
    { id: "shopee-001", name: "Loja Principal", businessId: "shop_123456" },
    { id: "shopee-002", name: "Loja Secundária", businessId: "shop_789012" },
  ],
};

export default function ProjectsPage() {
  const router = useRouter();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  function handleSelectAccount(accountId: string, channel: string) {
    localStorage.setItem("selectedChannel", channel);
    localStorage.setItem("selectedAccount", accountId);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Hergé</h1>
          <p className="text-lg text-neutral-400">
            {selectedChannel ? "Selecione uma conta" : "Selecione o canal de ads"}
          </p>
        </div>

        {/* Canais ou Contas */}
        {!selectedChannel ? (
          // Step 1: Select Channel
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CHANNELS.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className="text-left p-8 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800 transition-all"
              >
                <div className="text-4xl mb-4">{channel.icon}</div>
                <h2 className="text-2xl font-semibold mb-2">{channel.name}</h2>
                <p className="text-neutral-400">{channel.description}</p>
                <div className="mt-6 text-neutral-600">→</div>
              </button>
            ))}
          </div>
        ) : (
          // Step 2: Select Account
          <>
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setSelectedChannel(null)}
                className="px-4 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-md transition-all"
              >
                ← Voltar uma seção
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("selectedChannel");
                  localStorage.removeItem("selectedAccount");
                  setSelectedChannel(null);
                }}
                className="px-4 py-2 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-md transition-all text-neutral-300"
              >
                🏠 Voltar para o início
              </button>
            </div>

            <div className="space-y-3">
              {(ACCOUNTS[selectedChannel] || []).map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account.id, selectedChannel)}
                  className="w-full text-left p-4 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{account.name}</h3>
                      <p className="text-xs text-neutral-500 font-mono">ID: {account.businessId}</p>
                    </div>
                    <div className="text-neutral-600">→</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Or create new */}
        {!selectedChannel && (
          <div className="mt-12 p-6 rounded-lg border border-dashed border-neutral-700 text-center">
            <p className="text-neutral-400">
              Não vê sua conta? <br />
              <span className="text-sm">Configure uma nova conta em Configurações</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
