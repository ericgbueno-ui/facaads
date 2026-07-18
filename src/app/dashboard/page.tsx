"use client";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#060a13]">
      <Sidebar />
      <Header
        title="Visão Geral"
        subtitle="Acompanhe o desempenho geral de todas as empresas."
      />
      <main className="ml-64 px-8 py-6">
        <DashboardOverview />
      </main>
    </div>
  );
}
