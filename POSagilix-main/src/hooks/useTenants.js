import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tenantService } from '../services/tenantService';
import { clearDashboardCache } from './useDashboard';
import { useRealtimeEvents } from './useRealtimeEvents';
import {
  buildCreateTenantRequestBody,
  buildUpdateTenantRequestBody,
} from '../types/tenantTypes';

const tenantsCache = new Map();

export const clearTenantsCache = () => {
  tenantsCache.clear();
};

export function useTenants() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search and Filters state sync with searchParams
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterPlan, setFilterPlan] = useState(searchParams.get('plan') || 'all');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');

  const getCacheKey = () => `${searchTerm}-${filterPlan}-${filterStatus}`;
  
  const [tenants, setTenants] = useState(tenantsCache.get(getCacheKey()) || []);
  const [loading, setLoading] = useState(!tenantsCache.has(getCacheKey()));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [deletingTenantId, setDeletingTenantId] = useState(null);

  // Sync search input from URL on initial load
  useEffect(() => {
    const q = searchParams.get('q');
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');
    if (q !== null) setSearchTerm(q);
    if (plan !== null) setFilterPlan(plan);
    if (status !== null) setFilterStatus(status);
  }, [searchParams]);

  const loadTenants = useCallback(async () => {
    const cacheKey = getCacheKey();
    if (!tenantsCache.has(cacheKey)) {
      setLoading(true);
    }
    
    try {
      const data = await tenantService.getTenants({
        search: searchTerm,
        planType: filterPlan,
        status: filterStatus,
      });
      tenantsCache.set(cacheKey, data);
      setTenants(data);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterPlan, filterStatus]);

  useEffect(() => {
    // If we have cache, we still revalidate in the background
    const cacheKey = getCacheKey();
    if (tenantsCache.has(cacheKey)) {
      setTenants(tenantsCache.get(cacheKey));
      setLoading(false);
    }
    loadTenants();
  }, [searchTerm, filterPlan, filterStatus, loadTenants]);

  // Realtime SSE event listener for automatic live updates
  useRealtimeEvents((eventObj) => {
    if (eventObj?.event && eventObj.event.startsWith('tenant.')) {
      console.log('[Realtime] Tenant event received in useTenants:', eventObj.event);
      clearTenantsCache();
      clearDashboardCache();
      loadTenants();
    }
  });

  // Update URL search params
  const updateQueryParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== 'all') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateQueryParams({ q: value, plan: filterPlan, status: filterStatus });
  };

  const handleFilterPlanChange = (value) => {
    setFilterPlan(value);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, plan: value, status: filterStatus });
  };

  const handleFilterStatusChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, plan: filterPlan, status: value });
  };

  // CRUD Actions
  const handleAddTenant = async (formData) => {
    const payload = buildCreateTenantRequestBody(formData);
    const createdTenant = await tenantService.createTenant(payload);
    setShowAddModal(false);
    setSuccessModalData(createdTenant);
    clearTenantsCache();
    clearDashboardCache();
    await loadTenants();
  };

  const handleEditTenant = async (id, formData) => {
    const payload = buildUpdateTenantRequestBody(id, {
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      ownerPhone: formData.ownerPhone,
      planType: formData.planType,
      outletCount: parseInt(formData.outlets || formData.outletCount, 10) || 1,
      expiryDate: formData.expiryDate,
      erpWebhookUrl: formData.erpWebhookUrl || undefined,
      erpWebhookKey: formData.erpWebhookKey || undefined,
    });
    await tenantService.updateTenant(id, payload);
    setEditingTenant(null);
    clearTenantsCache();
    clearDashboardCache();
    await loadTenants();
  };

  const handleToggleLock = async (id, isLocked) => {
    await tenantService.toggleLockTenant(id, isLocked);
    clearTenantsCache();
    clearDashboardCache();
    await loadTenants();
  };

  const handleDeleteTenant = async (id) => {
    await tenantService.deleteTenant(id);
    setDeletingTenantId(null);
    clearTenantsCache();
    clearDashboardCache();
    await loadTenants();
  };

  // Pagination logic
  const totalPages = Math.ceil(tenants.length / itemsPerPage) || 1;
  const paginatedTenants = tenants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    tenants: paginatedTenants,
    totalCount: tenants.length,
    loading,
    searchTerm,
    filterPlan,
    filterStatus,
    currentPage,
    totalPages,
    itemsPerPage,
    showAddModal,
    successModalData,
    setSuccessModalData,
    editingTenant,
    deletingTenantId,
    setSearchTerm: handleSearchChange,
    setFilterPlan: handleFilterPlanChange,
    setFilterStatus: handleFilterStatusChange,
    setCurrentPage,
    setShowAddModal,
    setEditingTenant,
    setDeletingTenantId,
    handleAddTenant,
    handleEditTenant,
    handleToggleLock,
    handleDeleteTenant,
    reloadTenants: loadTenants,
  };
}
