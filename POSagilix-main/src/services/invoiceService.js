/**
 * API Service for Invoice and Billing endpoints
 */
import apiClient from '../lib/apiClient';
import { buildInvoiceFilterQueryParams } from '../types/invoiceTypes';

export const invoiceService = {
  async getInvoices(params = {}) {
    const query = buildInvoiceFilterQueryParams(params);
    const response = await apiClient.get('/invoices', { params: query });
    const payload = response.data.data || response.data;
    return payload.items || payload;
  },

  async getInvoiceById(id) {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  async createInvoice(payload) {
    const response = await apiClient.post('/invoices', payload);
    return response.data;
  },

  async updateInvoiceStatus(id, status) {
    const response = await apiClient.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  async sendReminder(id) {
    const response = await apiClient.post(`/invoices/${id}/remind`);
    return response.data;
  },
};
