/**
 * API Service for Audit Trail endpoints
 */
import apiClient from '../lib/apiClient';
import { buildAuditFilterQueryParams } from '../types/auditTypes';

export const auditService = {
  async getAuditLogs(params = {}) {
    const query = buildAuditFilterQueryParams(params);
    const response = await apiClient.get('/audit-logs', { params: query });
    return response.data.data || response.data;
  },

  async exportAuditLogs() {
    // Calling export endpoint that might return CSV content or a download link
    const response = await apiClient.get('/audit-logs/export', { responseType: 'blob' });
    return response.data; 
  },
};
