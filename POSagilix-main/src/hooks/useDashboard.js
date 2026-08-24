import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { invoiceService } from '../services/invoiceService';

// Global cache outside the hook
let dashboardCache = null;

export function useDashboard() {
  const [data, setData] = useState(
    dashboardCache || {
      totalTenants: 0,
      activeSubscriptions: 0,
      pastDueCount: 0,
      growthData: [],
      pastDueClients: [],
    }
  );
  const [loading, setLoading] = useState(!dashboardCache);

  const fetchDashboard = async () => {
    if (!dashboardCache) {
      setLoading(true);
    }
    try {
      const [summary, growth, unpaidInvoices] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getTenantGrowth(),
        invoiceService.getInvoices({ status: 'Unpaid' })
      ]);
      const newData = {
        totalTenants: summary.totalTenants || 0,
        activeSubscriptions: summary.activeTenants || 0,
        pastDueCount: summary.overdueInvoices || 0,
        growthData: (growth || []).map(g => ({ month: g.month, tenants: g.count })),
        pastDueClients: (unpaidInvoices || []).slice(0, 5).map(inv => ({
          id: inv.id,
          name: inv.tenant?.businessName || 'Unknown Tenant',
          dueDate: new Date(inv.dueDate).toLocaleDateString(),
        })),
      };
      dashboardCache = newData;
      setData(newData);
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
