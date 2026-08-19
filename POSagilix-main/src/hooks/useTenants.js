import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tenantService } from '../services/tenantService';
import {
  buildCreateTenantRequestBody,
  buildUpdateTenantRequestBody,
} from '../types/tenantTypes';

export function useTenants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filters state sync with searchParams
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterPlan, setFilterPlan] = useState(searchParams.get('plan') || 'all');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
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

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await tenantService.getTenants({
        search: searchTerm,
        planType: filterPlan,
        status: filterStatus,
      });
      setTenants(data);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [searchTerm, filterPlan, filterStatus]);

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
    await tenantService.createTenant(payload);
    setShowAddModal(false);
    await loadTenants();
  };

  const handleEditTenant = async (id, formData) => {
    const payload = buildUpdateTenantRequestBody(id, {
      businessName: formData.businessName,
      ownerEmail: formData.ownerEmail,
      plan: formData.planType === 'yearly' ? 'Yearly plan' : 'Monthly plan',
      planType: formData.planType,
      outlets: parseInt(formData.outlets, 10) || 1,
      expiryDate: formData.expiryDate,
    });
    await tenantService.updateTenant(id, payload);
    setEditingTenant(null);
    await loadTenants();
  };

  const handleToggleLock = async (id, isLocked) => {
    await tenantService.toggleLockTenant(id, isLocked);
    await loadTenants();
  };

  const handleDeleteTenant = async (id) => {
    await tenantService.deleteTenant(id);
    setDeletingTenantId(null);
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
