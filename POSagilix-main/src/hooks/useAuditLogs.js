import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auditService } from '../services/auditService';

export function useAuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTermState] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategoryState] = useState(searchParams.get('category') || 'all');
  const [selectedDate, setSelectedDateState] = useState(searchParams.get('date') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 10;

  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await auditService.getAuditLogs(params);
      setLogs(data.items ?? data);
      setTotalCount(data.total ?? data.length);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditLogs({
      category: selectedCategory,
      date: selectedDate,
      search: searchTerm,
      page: currentPage,
      limit: itemsPerPage,
    });
  }, [searchTerm, selectedCategory, selectedDate, currentPage, loadAuditLogs]);

  const updateQueryParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== 'all') {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    setSearchTermState(val);
    setCurrentPage(1);
    updateQueryParams({ q: val, category: selectedCategory, date: selectedDate, page: 1 });
  };

  const handleCategoryChange = (val) => {
    setSelectedCategoryState(val);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, category: val, date: selectedDate, page: 1 });
  };

  const handleDateChange = (val) => {
    setSelectedDateState(val);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, category: selectedCategory, date: val, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateQueryParams({ q: searchTerm, category: selectedCategory, date: selectedDate, page });
  };

  const handleExportCSV = async () => {
    const csvContent = await auditService.exportAuditLogs();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    logs,
    totalCount,
    loading,
    searchTerm,
    selectedCategory,
    selectedDate,
    currentPage,
    totalPages,
    itemsPerPage,
    setSearchTerm: handleSearchChange,
    setSelectedCategory: handleCategoryChange,
    setSelectedDate: handleDateChange,
    setCurrentPage: handlePageChange,
    handleExportCSV,
    reloadLogs: () => loadAuditLogs({
      category: selectedCategory,
      date: selectedDate,
      search: searchTerm,
      page: currentPage,
      limit: itemsPerPage,
    }),
  };
}
