/**
 * API Service for Tenant endpoints
 */
import apiClient from '../lib/apiClient';
import { buildTenantFilterQueryParams } from '../types/tenantTypes';

export const tenantService = {
  async getTenants(params = {}) {
    const query = buildTenantFilterQueryParams(params);
    const response = await apiClient.get('/tenants', { params: query });
    const payload = response.data.data || response.data;
    // Handle both PaginatedResult { items: [] } and flat arrays
    return payload.items || payload;
  },

  async createTenant(payload) {
    const response = await apiClient.post('/tenants', payload);
    return response.data;
  },

  async updateTenant(id, payload) {
    const response = await apiClient.patch(`/tenants/${id}`, payload);
    return response.data;
  },

  async toggleLockTenant(id, isLocked) {
    const endpoint = isLocked ? `/tenants/${id}/unlock` : `/tenants/${id}/lock`;
    const response = await apiClient.patch(endpoint);
    return response.data;
  },

  async deleteTenant(id) {
    const response = await apiClient.delete(`/tenants/${id}`);
    return response.data;
  },
};
