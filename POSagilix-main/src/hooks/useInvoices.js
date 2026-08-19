import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { buildCreateInvoiceRequestBody } from '../types/invoiceTypes';

export function useInvoices(invoiceId = null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All Invoices');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals & toast state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync state with URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const tab = searchParams.get('tab');
    if (q !== null) setSearchTerm(q);
    if (tab !== null) setActiveTab(tab);
  }, [searchParams]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      if (invoiceId) {
        const detail = await invoiceService.getInvoiceById(invoiceId);
        setCurrentInvoice(detail);
      } else {
        const data = await invoiceService.getInvoices({
          search: searchTerm,
          status: activeTab,
        });
        setInvoices(data);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [invoiceId, searchTerm, activeTab]);

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

  const handleCreateInvoice = async (formData) => {
    const payload = buildCreateInvoiceRequestBody(formData);
    await invoiceService.createInvoice(payload);
    setShowCreateModal(false);
    showToast(`Invoice ${payload.id} created successfully.`);
    await loadInvoices();
  };

  const handleUpdateStatus = async (id, status) => {
    await invoiceService.updateInvoiceStatus(id, status);
    showToast(`Invoice ${id} marked as ${status}.`);
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

  // Pagination calculation
  const totalPages = Math.ceil(invoices.length / itemsPerPage) || 1;
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    invoices: paginatedInvoices,
    totalCount: invoices.length,
    currentInvoice,
    loading,
    searchTerm,
    activeTab,
    currentPage,
    totalPages,
    itemsPerPage,
    showCreateModal,
    toastMessage,
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
