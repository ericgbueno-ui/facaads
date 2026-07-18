"use client";

import {
  Bell,
  Calendar,
  ChevronDown,
  Filter,
  MessageSquareText,
  Plus,
} from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
}

export function Header({ title = "Visão Geral", subtitle, actionLabel = "Nova Empresa" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 ml-64 border-b border-white/5 bg-[#060a13]/90 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-4 px-8 py-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <MessageSquareText className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {/* Date range */}
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.08]">
            01/07/2025 - 17/07/2025
            <Calendar className="h-4 w-4 text-slate-400" />
          </button>

          {/* Compare */}
          <button className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08] xl:flex">
            <span className="text-slate-500">Comparar com:</span>
            01/06/2025 - 30/06/2025
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Filters */}
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.08]">
            <Filter className="h-4 w-4" />
            Filtros
          </button>

          {/* Notifications */}
          <button className="relative rounded-lg border border-white/10 bg-white/[0.04] p-2.5 transition-colors hover:bg-white/[0.08]">
            <Bell className="h-4 w-4 text-slate-300" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.06]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-slate-950">
              EB
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-sm font-semibold text-white">Eric Bueno</span>
              <span className="block text-[11px] text-slate-400">Administrador Master</span>
            </span>
          </button>
        </div>
      </div>

      {/* Action row */}
      <div className="flex justify-end px-8 pb-3">
        <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>
    </header>
  );
}
