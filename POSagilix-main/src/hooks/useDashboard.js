import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { invoiceService } from '../services/invoiceService';
import { tenantService } from '../services/tenantService';
import { useRealtimeEvents } from './useRealtimeEvents';

// Global cache outside the hook
let dashboardCache = null;

export const clearDashboardCache = () => {
  dashboardCache = null;
};

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

  const fetchDashboard = useCallback(async () => {
    if (!dashboardCache) {
      setLoading(true);
    }
    try {
      const [allTenantsMeta, activeTenantsMeta, allInvoices, growth] = await Promise.all([
        tenantService.getTenants({ limit: 1, returnMeta: true }),
        tenantService.getTenants({ status: 'ACTIVE', limit: 1, returnMeta: true }),
        invoiceService.getInvoices({ limit: 100 }),
        dashboardService.getTenantGrowth()
      ]);
      
      const unpaidInvoices = (allInvoices || []).filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE');
      
      const newData = {
        totalTenants: allTenantsMeta.total || 0,
        activeSubscriptions: activeTenantsMeta.total || 0,
        pastDueCount: unpaidInvoices.length,
        growthData: (growth || []).map(g => ({ month: g.month, tenants: g.count })),
        pastDueClients: unpaidInvoices.slice(0, 5).map(inv => ({
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
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Realtime SSE event listener for automatic live dashboard metrics
  useRealtimeEvents((eventObj) => {
    if (
      eventObj?.event &&
      (eventObj.event.startsWith('tenant.') ||
        eventObj.event.startsWith('invoice.') ||
        eventObj.event.startsWith('payment.'))
    ) {
      console.log('[Realtime] Event received in useDashboard:', eventObj.event);
      clearDashboardCache();
      fetchDashboard();
    }
  });

  return {
    ...data,
    loading,
    refreshDashboard: fetchDashboard,
  };
}
