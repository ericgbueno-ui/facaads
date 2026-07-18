"use client";

import {
  Bell,
  Calendar,
  ChevronDown,
  Filter,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
}

export function Header({
  title = "Visão Geral",
  subtitle,
  actionLabel = "Nova Empresa",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#040813]/85 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center gap-4 px-6 py-4 lg:px-8">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <MessageCircle className="h-5 w-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[28px] font-semibold tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/[0.07] md:flex">
            01/07/2025 - 17/07/2025
            <Calendar className="h-4 w-4 text-slate-400" />
          </button>

          <button className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.07] xl:flex">
            <span className="text-slate-500">Comparar com:</span>
            01/06/2025 - 30/06/2025
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          <button className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/[0.07] md:flex">
            <Filter className="h-4 w-4" />
            Filtros
          </button>

          <button className="relative hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.07] md:inline-flex">
            <Bell className="h-4 w-4 text-slate-300" />
            <span className="absolute -mt-6 ml-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <button className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-white/[0.05]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top_left,_#f8d06a,_#b7791f)] text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.2)]">
              EB
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-sm font-semibold text-white">Eric Bueno</span>
              <span className="block text-[11px] text-slate-400">Administrador Master</span>
            </span>
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-colors hover:from-amber-300 hover:to-amber-400">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
