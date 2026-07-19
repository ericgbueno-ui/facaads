'use client';

import { useState, useEffect } from 'react';
import { useKPIs, useSales, useGoals, useRankings } from '@/hooks/useRevenue';
import {
  KPICard,
  RevenueChart,
  SalesTable,
  Rankings,
  GoalsProgress,
  ForecastChart,
  LossAnalysis,
} from '@/components/revenue';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

const COMPANY_ID = 'company-123'; // Substituir por contexto real

export default function RevenueDashboard() {
  const { getKPIs, loading: kpisLoading } = useKPIs({ companyId: COMPANY_ID });
  const { listSales, loading: salesLoading } = useSales({ companyId: COMPANY_ID });
  const { listGoals, loading: goalsLoading } = useGoals({ companyId: COMPANY_ID });
  const { getRankings, loading: rankingsLoading } = useRankings({ companyId: COMPANY_ID });

  const [kpis, setKpis] = useState(null);
  const [sales, setSales] = useState([]);
  const [goals, setGoals] = useState([]);
  const [campaignRankings, setCampaignRankings] = useState([]);
  const [attendantRankings, setAttendantRankings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiData = await getKPIs();
        setKpis(kpiData);

        const salesData = await listSales({ limit: 10 });
        setSales(salesData);

        const goalsData = await listGoals();
        setGoals(goalsData);

        const campaigns = await getRankings('campaigns', 'revenue', 5);
        setCampaignRankings(campaigns);

        const attendants = await getRankings('attendants', 'revenue', 5);
        setAttendantRankings(attendants);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  // Mock data para demonstração
  const revenueChartData = [
    { date: '01/07', revenue: 45000, cost: 18000, profit: 27000 },
    { date: '02/07', revenue: 52000, cost: 20800, profit: 31200 },
    { date: '03/07', revenue: 48000, cost: 19200, profit: 28800 },
    { date: '04/07', revenue: 61000, cost: 24400, profit: 36600 },
    { date: '05/07', revenue: 55000, cost: 22000, profit: 33000 },
  ];

  const forecastData = [
    { date: '08/2026', projected: 145000, confidence: 0.85 },
    { date: '09/2026', projected: 155000, confidence: 0.80 },
    { date: '10/2026', projected: 162000, confidence: 0.75 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Receitas</h1>
          <p className="text-gray-600 mt-2">Acompanhe o desempenho de vendas e KPIs em tempo real</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            label="Receita Total"
            value={kpis?.roas?.value || 261000}
            unit="R$"
            trend="up"
            changePercent={12.5}
            icon={<TrendingUp size={20} />}
            color="green"
            loading={kpisLoading}
          />
          <KPICard
            label="ROAS"
            value={kpis?.roas?.value || 3.45}
            trend="up"
            changePercent={8.2}
            color="blue"
            loading={kpisLoading}
          />
          <KPICard
            label="Margem de Lucro"
            value={kpis?.margin?.value || 60}
            unit="%"
            trend="up"
            changePercent={5.1}
            color="green"
            loading={kpisLoading}
          />
          <KPICard
            label="CAC"
            value={kpis?.cac?.value || 150.5}
            unit="R$"
            trend="down"
            changePercent={3.2}
            icon={<Users size={20} />}
            color="amber"
            loading={kpisLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart
              data={revenueChartData}
              title="Receita vs Custo vs Lucro"
              type="area"
              showCost
              showProfit
              height={300}
            />
          </div>
          <ForecastChart data={forecastData} title="Projeção" height={300} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SalesTable sales={sales} loading={salesLoading} />
          </div>
          <div>
            <GoalsProgress goals={goals} loading={goalsLoading} />
          </div>
        </div>

        {/* Rankings & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Rankings
            title="Top Campanhas"
            items={campaignRankings}
            type="campaigns"
            loading={rankingsLoading}
          />
          <Rankings
            title="Top Vendedores"
            items={attendantRankings}
            type="attendants"
            loading={rankingsLoading}
          />
        </div>

        {/* Loss Analysis */}
        <div className="mt-8">
          <LossAnalysis
            totalLosses={45}
            totalValueLost={67500}
            lossRate={18.5}
            byReason={[
              { reason: 'Preço', count: 20, totalValueLost: 30000, percent: 44.4 },
              { reason: 'Concorrência', count: 15, totalValueLost: 22500, percent: 33.3 },
              { reason: 'Sem Interesse', count: 10, totalValueLost: 15000, percent: 22.2 },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
