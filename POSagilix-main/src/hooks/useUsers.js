import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService } from '../services/userService';
import {
  buildCreateUserRequestBody,
  buildUpdateUserRequestBody,
} from '../types/userTypes';

const usersCache = new Map();

export function useUsers() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterRole, setFilterRole] = useState(searchParams.get('role') || 'all');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');

  const getCacheKey = () => `${searchTerm}-${filterRole}-${filterStatus}`;
  
  const [users, setUsers] = useState(usersCache.get(getCacheKey()) || []);
  const [loading, setLoading] = useState(!usersCache.has(getCacheKey()));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    const q = searchParams.get('q');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    if (q !== null) setSearchTerm(q);
    if (role !== null) setFilterRole(role);
    if (status !== null) setFilterStatus(status);
  }, [searchParams]);

  const loadUsers = async () => {
    const cacheKey = getCacheKey();
    if (!usersCache.has(cacheKey)) {
      setLoading(true);
    }
    
    try {
      const data = await userService.getUsers({
        search: searchTerm,
        role: filterRole,
        status: filterStatus,
      });
      usersCache.set(cacheKey, data);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Revalidate background data
    const cacheKey = getCacheKey();
    if (usersCache.has(cacheKey)) {
      setUsers(usersCache.get(cacheKey));
      setLoading(false);
    }
    loadUsers();
  }, [searchTerm, filterRole, filterStatus]);

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
    updateQueryParams({ q: val, role: filterRole, status: filterStatus });
  };

  const handleFilterRoleChange = (val) => {
    setFilterRole(val);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, role: val, status: filterStatus });
  };

  const handleFilterStatusChange = (val) => {
    setFilterStatus(val);
    setCurrentPage(1);
    updateQueryParams({ q: searchTerm, role: filterRole, status: val });
  };

  // CRUD Actions
  const handleAddUser = async (formData) => {
    const payload = buildCreateUserRequestBody(formData);
    const createdUser = await userService.createUser(payload);
    setShowAddModal(false);
    setSuccessModalData(createdUser);
    await loadUsers();
  };

  const handleEditUser = async (id, formData) => {
    const payload = buildUpdateUserRequestBody(id, {
      fullName: formData.name,
      email: formData.email,
      role: formData.role === 'Super Admin' ? 'SUPER_ADMIN' :
            formData.role === 'Tenant Admin' ? 'TENANT_ADMIN' :
            formData.role === 'Cashier' ? 'CASHIER' : undefined,
      isActive: formData.status === 'Active',
    });
    await userService.updateUser(id, payload);
    setEditingUser(null);
    await loadUsers();
  };

  const handleDeleteUser = async (id) => {
    await userService.deleteUser(id);
    setDeletingUserId(null);
    await loadUsers();
  };

  // Pagination calculation
  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    users: paginatedUsers,
    totalCount: users.length,
    loading,
    searchTerm,
    filterRole,
    filterStatus,
    currentPage,
    totalPages,
    itemsPerPage,
    showAddModal,
    successModalData,
    setSuccessModalData,
    editingUser,
    deletingUserId,
    setSearchTerm: handleSearchChange,
    setFilterRole: handleFilterRoleChange,
    setFilterStatus: handleFilterStatusChange,
    setCurrentPage,
    setShowAddModal,
    setEditingUser,
    setDeletingUserId,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    reloadUsers: loadUsers,
  };
}
