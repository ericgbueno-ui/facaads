import { useState, useCallback } from 'react';

interface UseRevenueOptions {
  companyId: string;
}

export function useSales({ companyId }: UseRevenueOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSale = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/revenue/sales?companyId=${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create sale');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const listSales = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ companyId, ...filters });
      const res = await fetch(`/api/revenue/sales?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sales');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { createSale, listSales, loading, error };
}

export function useKPIs({ companyId }: UseRevenueOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getKPIs = useCallback(async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ companyId });
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await fetch(`/api/revenue/kpis?${params}`);
      if (!res.ok) throw new Error('Failed to fetch KPIs');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const getKPI = useCallback(async (metric: string, startDate?: Date, endDate?: Date) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ companyId, metric });
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await fetch(`/api/revenue/kpis?${params}`);
      if (!res.ok) throw new Error(`Failed to fetch ${metric}`);
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { getKPIs, getKPI, loading, error };
}

export function useGoals({ companyId }: UseRevenueOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGoal = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/revenue/goals?companyId=${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create goal');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const listGoals = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ companyId });
      if (status) params.append('status', status);
      const res = await fetch(`/api/revenue/goals?${params}`);
      if (!res.ok) throw new Error('Failed to fetch goals');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const updateProgress = useCallback(async (goalId: string, currentValue: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/revenue/goals/${goalId}?companyId=${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue }),
      });
      if (!res.ok) throw new Error('Failed to update progress');
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { createGoal, listGoals, updateProgress, loading, error };
}

export function useRankings({ companyId }: UseRevenueOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRankings = useCallback(
    async (type: 'campaigns' | 'attendants' | 'products' | 'channels', metric: string = 'revenue', limit: number = 10) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ companyId, type, metric, limit: limit.toString() });
        const res = await fetch(`/api/revenue/rankings?${params}`);
        if (!res.ok) throw new Error('Failed to fetch rankings');
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );

  return { getRankings, loading, error };
}
