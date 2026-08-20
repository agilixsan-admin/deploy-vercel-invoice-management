import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auditService } from '../services/auditService';

const auditLogsCache = new Map();

export function useAuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');

  const getCacheKey = () => `${searchTerm}-${selectedCategory}-${selectedDate}`;

  const [logs, setLogs] = useState(auditLogsCache.get(getCacheKey()) || []);
  const [loading, setLoading] = useState(!auditLogsCache.has(getCacheKey()));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const date = searchParams.get('date');
    if (q !== null) setSearchTerm(q);
    if (category !== null) setSelectedCategory(category);
    if (date !== null) setSelectedDate(date);
  }, [searchParams]);

  const loadAuditLogs = async () => {
    const cacheKey = getCacheKey();
    if (!auditLogsCache.has(cacheKey)) {
      setLoading(true);
    }
    try {
      const data = await auditService.getAuditLogs({
        search: searchTerm,
        category: selectedCategory,
        date: selectedDate,
      });
      auditLogsCache.set(cacheKey, data);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cacheKey = getCacheKey();
    if (auditLogsCache.has(cacheKey)) {
      setLogs(auditLogsCache.get(cacheKey));
      setLoading(false);
    }
    loadAuditLogs();
  }, [searchTerm, selectedCategory, selectedDate]);

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

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
    updateQueryParams({ q: val, category: selectedCategory, date: selectedDate });
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, category: val, date: selectedDate });
  };

  const handleDateChange = (val) => {
    setSelectedDate(val);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, category: selectedCategory, date: val });
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

  // Pagination calculation
  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    logs: paginatedLogs,
    totalCount: logs.length,
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
    setCurrentPage,
    handleExportCSV,
    reloadLogs: loadAuditLogs,
  };
}
