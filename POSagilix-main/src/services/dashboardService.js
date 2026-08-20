/**
 * API Service for Dashboard endpoints
 */
import apiClient from '../lib/apiClient';

export const dashboardService = {
  async getDashboardSummary() {
    const response = await apiClient.get('/dashboard/summary');
    return response.data.data || response.data;
  },
};
