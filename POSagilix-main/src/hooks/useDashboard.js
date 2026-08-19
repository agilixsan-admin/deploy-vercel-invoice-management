import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export function useDashboard() {
  const [data, setData] = useState({
    totalTenants: 0,
    activeSubscriptions: 0,
    pastDueCount: 0,
    growthData: [],
    pastDueClients: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const summary = await dashboardService.getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    ...data,
    loading,
    refreshDashboard: fetchDashboard,
  };
}
