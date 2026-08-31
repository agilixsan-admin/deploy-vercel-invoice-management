import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { clearDashboardCache } from './useDashboard';
import { useRealtimeEvents } from './useRealtimeEvents';
import { buildCreateInvoiceRequestBody } from '../types/invoiceTypes';

const invoicesCache = new Map();

export const clearInvoicesCache = () => {
  invoicesCache.clear();
};

export function useInvoices(invoiceId = null) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters & Tabs state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All Invoices');

  const getCacheKey = () => invoiceId ? `invoice-${invoiceId}` : `${searchTerm}-${activeTab}`;

  const [invoices, setInvoices] = useState(invoicesCache.get(getCacheKey()) || []);
  const [currentInvoice, setCurrentInvoice] = useState(invoiceId ? invoicesCache.get(`detail-${invoiceId}`) : null);
  const [loading, setLoading] = useState(!invoicesCache.has(getCacheKey()) && !(invoiceId && invoicesCache.has(`detail-${invoiceId}`)));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals & toast state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [successModalData, setSuccessModalData] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const tab = searchParams.get('tab');
    if (q !== null) setSearchTerm(q);
    if (tab !== null) setActiveTab(tab);
  }, [searchParams]);

  const loadInvoices = useCallback(async () => {
    const cacheKey = getCacheKey();
    const detailKey = `detail-${invoiceId}`;
    
    if (invoiceId && !invoicesCache.has(detailKey)) setLoading(true);
    if (!invoiceId && !invoicesCache.has(cacheKey)) setLoading(true);
    
    try {
      if (invoiceId) {
        const detail = await invoiceService.getInvoiceById(invoiceId);
        invoicesCache.set(detailKey, detail);
        setCurrentInvoice(detail);
      } else {
        const data = await invoiceService.getInvoices({
          search: searchTerm,
          status: activeTab,
        });
        invoicesCache.set(cacheKey, data);
        setInvoices(data);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [invoiceId, searchTerm, activeTab]);

  useEffect(() => {
    const cacheKey = getCacheKey();
    const detailKey = `detail-${invoiceId}`;
    
    if (invoiceId && invoicesCache.has(detailKey)) {
      setCurrentInvoice(invoicesCache.get(detailKey));
      setLoading(false);
    } else if (!invoiceId && invoicesCache.has(cacheKey)) {
      setInvoices(invoicesCache.get(cacheKey));
      setLoading(false);
    }
    
    loadInvoices();
  }, [invoiceId, searchTerm, activeTab, loadInvoices]);

  // Realtime SSE event listener for automatic live invoice updates
  useRealtimeEvents((eventObj) => {
    if (
      eventObj?.event &&
      (eventObj.event.startsWith('invoice.') ||
        eventObj.event.startsWith('payment.'))
    ) {
      console.log('[Realtime] Invoice event received in useInvoices:', eventObj.event);
      clearInvoicesCache();
      clearDashboardCache();
      loadInvoices();
    }
  });

  const updateQueryParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== 'All Invoices') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
    updateQueryParams({ q: val, tab: activeTab });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, tab });
  };

  const handleCreateInvoice = async (formData, tenantName) => {
    const payload = buildCreateInvoiceRequestBody(formData);
    const createdInvoice = await invoiceService.createInvoice(payload);
    setShowCreateModal(false);
    setSuccessModalData({
      ...createdInvoice,
      tenantName: tenantName || createdInvoice.tenant?.businessName
    });
    clearInvoicesCache();
    clearDashboardCache();
    await loadInvoices();
  };

  const handleUpdateStatus = async (id, status) => {
    await invoiceService.updateInvoiceStatus(id, status);
    showToast(`Invoice ${id} marked as ${status}.`);
    clearInvoicesCache();
    clearDashboardCache();
    await loadInvoices();
  };

  const handleSendReminder = async (id) => {
    const res = await invoiceService.sendReminder(id);
    showToast(res.message || `Payment reminder sent to client for invoice ${id}.`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Client-side search filtering (since backend doesn't support search param)
  const filteredInvoices = invoices.filter(inv => {
    let matchesStatus = true;
    if (activeTab === 'Paid') {
      matchesStatus = inv.status === 'PAID';
    } else if (activeTab === 'Unpaid') {
      matchesStatus = inv.status === 'PENDING' || inv.status === 'OVERDUE';
    }
    
    if (!matchesStatus) return false;
    
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(lowerSearch) ||
      inv.tenant?.businessName?.toLowerCase().includes(lowerSearch) ||
      inv.tenantId?.toLowerCase().includes(lowerSearch)
    );
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    invoices: paginatedInvoices,
    totalCount: filteredInvoices.length,
    currentInvoice,
    loading,
    searchTerm,
    activeTab,
    currentPage,
    totalPages,
    itemsPerPage,
    showCreateModal,
    toastMessage,
    successModalData,
    setSuccessModalData,
    setSearchTerm: handleSearchChange,
    setActiveTab: handleTabChange,
    setCurrentPage,
    setShowCreateModal,
    handleCreateInvoice,
    handleUpdateStatus,
    handleSendReminder,
    reloadInvoices: loadInvoices,
  };
}
