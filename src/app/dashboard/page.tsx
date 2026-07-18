"use client";

import { Header } from "@/components/Header";
import { DashboardOverview } from "@/components/DashboardOverview";

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Visão Geral"
        subtitle="Acompanhe o desempenho geral de todas as empresas."
      />
      <main className="px-6 py-6 lg:px-8">
        <DashboardOverview />
      </main>
    </>
  );
}
