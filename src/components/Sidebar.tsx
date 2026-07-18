"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  DollarSign,
  Brain,
  Bell,
  MessageCircle,
  Megaphone,
  Zap,
  Plug,
  Package,
  BarChart3,
  FileBarChart,
  Download,
  Settings,
  ShieldCheck,
  ScrollText,
  ChevronDown,
  Handshake,
} from "lucide-react";

const agencyItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Empresas", href: "/companies", icon: Building2 },
  { label: "Usuários", href: "/users", icon: Users },
  { label: "Relatórios Consolidados", href: "/reports", icon: FileText },
  { label: "Financeiro", href: "/financeiro", icon: DollarSign },
];

const inteligenciaItems = [
  { label: "IA Insights", href: "/ai-insights", icon: Brain, badge: "Novo" },
  { label: "Alertas", href: "/alerts", icon: Bell },
];

const gestaoItems = [
  { label: "Leads", href: "/leads", icon: Users },
  { label: "CRM", href: "/crm", icon: Handshake },
  { label: "Conversas", href: "/conversations", icon: MessageCircle, badge: 23 },
  { label: "Campanhas", href: "/campaigns", icon: Megaphone },
  { label: "Anúncios", href: "/ads", icon: Zap },
  { label: "Integrações", href: "/integracoes", icon: Plug },
  { label: "Produtos / Serviços", href: "/products", icon: Package },
];

const relatoriosItems = [
  { label: "Relatórios", href: "/relatorios", icon: FileBarChart },
  { label: "Dashboards", href: "/dashboards", icon: BarChart3 },
  { label: "Exportações", href: "/exports", icon: Download },
];

const configItems = [
  { label: "Configurações", href: "/settings", icon: Settings },
  { label: "Permissões", href: "/permissions", icon: ShieldCheck },
  { label: "Logs do Sistema", href: "/logs", icon: ScrollText },
];

interface SidebarItemProps {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isActive?: boolean;
}

function SidebarItem({ label, href, icon: Icon, badge, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "border border-amber-500/40 bg-amber-500/10 text-amber-400"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={`flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
            typeof badge === "number"
              ? "bg-amber-500 text-slate-950"
              : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function SidebarSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: Array<Omit<SidebarItemProps, "isActive">>;
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SidebarItem key={item.href} {...item} isActive={pathname === item.href} />
        ))}
      </div>
    </div>
  );
}

interface SidebarProps {
  companyId?: string;
}

export function Sidebar({ companyId }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/5 bg-[#070b14]">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center justify-center border-b border-white/5 px-4 py-4">
        <Image
          src="/logo_herge.webp"
          alt="Hergé — Inteligência que conecta resultados"
          width={200}
          height={96}
          priority
          className="h-auto w-full max-w-[190px] object-contain"
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 [scrollbar-width:thin]">
        <SidebarSection title="Agency" items={agencyItems} pathname={pathname} />
        <SidebarSection title="Inteligência" items={inteligenciaItems} pathname={pathname} />
        <SidebarSection title="Gestão" items={gestaoItems} pathname={pathname} />
        <SidebarSection title="Relatórios" items={relatoriosItems} pathname={pathname} />
        <SidebarSection title="Configurações" items={configItems} pathname={pathname} />
      </nav>

      {/* Mode switcher */}
      <div className="border-t border-white/5 p-3">
        <button className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Modo
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-100">Hergé Agency</span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            Gerencie todas as empresas em um só lugar.
          </p>
        </button>
      </div>
    </aside>
  );
}
