import { Header } from "@/components/Header";
import { DashboardOverview } from "@/components/DashboardOverview";

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard Master"
        subtitle="Fluxo consolidado de receita, aquisição, operação e performance multiempresa."
      />
      <main className="space-y-6 px-6 py-6 lg:px-8">
        <DashboardOverview />
      </main>
    </>
  );
}
