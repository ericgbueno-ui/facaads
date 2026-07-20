"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, FileUp, LoaderCircle, Megaphone, Plus, RefreshCw, Search, Store, Unplug, X } from "lucide-react";

type Channel = "META" | "GOOGLE" | "TIKTOK" | "SHOPEE";
type FormData = { token: string; id: string; name: string };
type AdAccount = { id: string; name: string; externalId: string; lastSyncedAt: string | null };
type Platform = { channel: Channel; title: string; description: string; tokenLabel: string; idLabel: string; tokenPlaceholder: string; idPlaceholder: string };

const platforms: Platform[] = [
  { channel: "META", title: "Meta Ads", description: "Facebook e Instagram", tokenLabel: "Token de acesso", idLabel: "ID da conta de anúncios", tokenPlaceholder: "Token do usuário do sistema", idPlaceholder: "act_123456789" },
  { channel: "GOOGLE", title: "Google Ads", description: "Pesquisa, Display e Performance Max", tokenLabel: "Refresh token", idLabel: "Customer ID", tokenPlaceholder: "Refresh token do Google Ads", idPlaceholder: "1234567890" },
  { channel: "TIKTOK", title: "TikTok Ads", description: "TikTok Business Center", tokenLabel: "Access token", idLabel: "Advertiser ID", tokenPlaceholder: "Access token do TikTok", idPlaceholder: "1234567890123456" },
  { channel: "SHOPEE", title: "Shopee Ads", description: "Importação pelo Seller Center", tokenLabel: "", idLabel: "", tokenPlaceholder: "", idPlaceholder: "" },
];

const iconByChannel = { META: Megaphone, GOOGLE: Search, TIKTOK: RefreshCw, SHOPEE: Store };
const emptyAccounts: Record<Channel, AdAccount[]> = { META: [], GOOGLE: [], TIKTOK: [], SHOPEE: [] };

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Record<Channel, AdAccount[]>>(emptyAccounts);
  const [loading, setLoading] = useState(true);
  const [openChannel, setOpenChannel] = useState<Channel | null>(null);
  const [form, setForm] = useState<FormData>({ token: "", id: "", name: "" });
  const [showToken, setShowToken] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [metaOptions, setMetaOptions] = useState<Array<{ id: string; name: string }> | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => { void loadAccounts(); }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const [meta, google, tiktok, shopee] = await Promise.all([
        fetch("/api/auth/meta/accounts").then((response) => response.json()),
        fetch("/api/auth/google/accounts").then((response) => response.json()),
        fetch("/api/auth/tiktok/accounts").then((response) => response.json()),
        fetch("/api/auth/shopee/accounts").then((response) => response.json()),
      ]);
      setAccounts({ META: meta.accounts || [], GOOGLE: google.accounts || [], TIKTOK: tiktok.accounts || [], SHOPEE: shopee.accounts || [] });
    } catch { setMessage({ type: "error", text: "Não foi possível consultar as conexões." }); }
    finally { setLoading(false); }
  }

  function toggle(channel: Channel) {
    setOpenChannel(openChannel === channel ? null : channel);
    setForm({ token: "", id: "", name: "" }); setMessage(null); setMetaOptions(null); setCsvFile(null);
  }

  async function connect(event: React.FormEvent, channel: Channel) {
    event.preventDefault();
    if (channel === "SHOPEE") return;
    setWorking(true); setMessage(null);
    const endpoints = { META: "/api/auth/meta/connect", GOOGLE: "/api/auth/google/connect", TIKTOK: "/api/auth/tiktok/connect" };
    const payloads = {
      META: { accessToken: form.token, businessAccountId: form.id, accountName: form.name },
      GOOGLE: { refreshToken: form.token, customerId: form.id, accountName: form.name },
      TIKTOK: { accessToken: form.token, advertiserId: form.id, accountName: form.name },
    };
    try {
      const response = await fetch(endpoints[channel], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloads[channel]) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao conectar");
      setMessage({ type: "ok", text: `${platforms.find((item) => item.channel === channel)?.title} conectado com sucesso.` });
      setOpenChannel(null); setForm({ token: "", id: "", name: "" }); await loadAccounts();
    } catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "Falha ao conectar" }); }
    finally { setWorking(false); }
  }

  async function discoverMeta() {
    setWorking(true); setMessage(null);
    try { const response = await fetch("/api/auth/meta/discover"); const json = await response.json(); if (!response.ok) throw new Error(json.error); setMetaOptions(json.accounts || []); }
    catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "Falha ao buscar contas Meta" }); }
    finally { setWorking(false); }
  }

  async function connectMetaOption(id: string, name: string) {
    setWorking(true); setMessage(null);
    try { const response = await fetch("/api/auth/meta/connect-default", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId: id, accountName: name }) }); const json = await response.json(); if (!response.ok) throw new Error(json.error); setMessage({ type: "ok", text: `${name} conectado com sucesso.` }); setOpenChannel(null); await loadAccounts(); }
    catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "Falha ao conectar conta Meta" }); }
    finally { setWorking(false); }
  }

  async function importShopee(event: React.FormEvent) {
    event.preventDefault(); if (!csvFile) return; setWorking(true); setMessage(null);
    try { const response = await fetch("/api/shopee/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csvContent: await csvFile.text(), accountId: form.id || `shopee-${Date.now()}`, accountName: form.name }) }); const json = await response.json(); if (!response.ok) throw new Error(json.error); setMessage({ type: "ok", text: `${json.result.synced} campanhas da Shopee importadas.` }); setOpenChannel(null); await loadAccounts(); }
    catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "Falha ao importar CSV" }); }
    finally { setWorking(false); }
  }

  return <main className="space-y-6 px-6 py-6 lg:px-8">
    <header className="border-b border-white/8 pb-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Hergel · Fontes de dados</p><h1 className="mt-2 text-3xl font-semibold text-white">Conexões</h1><p className="mt-2 text-sm text-slate-400">Contas que alimentam as métricas reais da Central de Campanhas.</p></header>

    {message && <div className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${message.type === "ok" ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-200" : "border-red-500/20 bg-red-500/8 text-red-300"}`}>{message.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <Unplug className="h-4 w-4" />}{message.text}</div>}

    <section className="grid gap-4 xl:grid-cols-2">{platforms.map((platform) => { const Icon = iconByChannel[platform.channel]; const channelAccounts = accounts[platform.channel]; const open = openChannel === platform.channel; return <article key={platform.channel} className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035]"><div className="flex items-start justify-between gap-4 border-b border-white/8 p-5"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/8"><Icon className="h-5 w-5 text-cyan-300" /></span><div><h2 className="font-semibold text-white">{platform.title}</h2><p className="mt-1 text-xs text-slate-500">{platform.description}</p></div></div><button onClick={() => toggle(platform.channel)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]">{open ? <X className="h-3.5 w-3.5" /> : platform.channel === "SHOPEE" ? <FileUp className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{open ? "Cancelar" : platform.channel === "SHOPEE" ? "Importar CSV" : "Conectar conta"}</button></div>
      <div className="p-5">{loading ? <p className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Consultando contas…</p> : channelAccounts.length === 0 ? <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">Nenhuma conta conectada.</p> : <div className="space-y-2">{channelAccounts.map((account) => <div key={account.id} className="rounded-xl border border-white/8 bg-slate-950/40 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-white">{account.name}</p><p className="mt-1 font-mono text-xs text-slate-600">{account.externalId}</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1 text-[11px] font-medium text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Conectada</span></div><p className="mt-3 text-xs text-slate-500">Última sincronização: {account.lastSyncedAt ? new Date(account.lastSyncedAt).toLocaleString("pt-BR") : "ainda não realizada"}</p></div>)}</div>}

      {open && platform.channel === "META" && <div className="mt-5 border-t border-white/8 pt-5"><button type="button" onClick={discoverMeta} disabled={working} className="mb-3 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-xs font-semibold text-cyan-200"><RefreshCw className={`h-3.5 w-3.5 ${working ? "animate-spin" : ""}`} />Buscar contas no token do sistema</button>{metaOptions && <div className="mb-4 space-y-2">{metaOptions.map((account) => <button key={account.id} type="button" onClick={() => connectMetaOption(account.id, account.name)} className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-slate-950/40 p-3 text-left text-sm text-white hover:border-cyan-400/20"><span>{account.name}</span><span className="font-mono text-xs text-slate-600">{account.id}</span></button>)}</div>}</div>}

      {open && platform.channel !== "SHOPEE" && <form onSubmit={(event) => connect(event, platform.channel)} className="mt-5 space-y-3 border-t border-white/8 pt-5"><label className="block text-xs text-slate-400">{platform.tokenLabel}<div className="relative mt-1"><input required type={showToken ? "text" : "password"} value={form.token} onChange={(event) => setForm({ ...form, token: event.target.value })} placeholder={platform.tokenPlaceholder} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 pr-10 text-sm text-white" /><button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-3 text-slate-600">{showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-400">{platform.idLabel}<input required value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder={platform.idPlaceholder} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white" /></label><label className="text-xs text-slate-400">Nome da conta<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome para identificação" className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white" /></label></div><button disabled={working} className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{working ? "Conectando…" : "Salvar conexão"}</button></form>}

      {open && platform.channel === "SHOPEE" && <form onSubmit={importShopee} className="mt-5 space-y-3 border-t border-white/8 pt-5"><label className="block text-xs text-slate-400">Nome da loja<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Loja Shopee" className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white" /></label><label className="block text-xs text-slate-400">Arquivo CSV<input required type="file" accept=".csv" onChange={(event) => setCsvFile(event.target.files?.[0] || null)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-slate-400" /></label><p className="text-xs leading-5 text-slate-600">Colunas: campaign_name, campaign_id, spend, impressions, clicks, conversions e conversion_value.</p><button disabled={working || !csvFile} className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{working ? "Importando…" : "Importar campanhas"}</button></form>}
      </div></article>; })}</section>
    <p className="text-xs text-slate-600">Tokens nunca são exibidos depois de salvos. Cada conta deve ser vinculada ao cliente correto antes da sincronização.</p>
  </main>;
}
