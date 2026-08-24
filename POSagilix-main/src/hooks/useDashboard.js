import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { invoiceService } from '../services/invoiceService';
import { tenantService } from '../services/tenantService';

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
      const [allTenantsMeta, activeTenantsMeta, unpaidInvoices, growth] = await Promise.all([
        tenantService.getTenants({ limit: 1, returnMeta: true }),
        tenantService.getTenants({ status: 'ACTIVE', limit: 1, returnMeta: true }),
        invoiceService.getInvoices({ status: 'Unpaid', limit: 100 }),
        dashboardService.getTenantGrowth()
      ]);
      const newData = {
        totalTenants: allTenantsMeta.total || 0,
        activeSubscriptions: activeTenantsMeta.total || 0,
        pastDueCount: unpaidInvoices ? unpaidInvoices.length : 0,
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
