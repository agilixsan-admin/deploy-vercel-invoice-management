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
    if (status === 'Paid') {
      const response = await apiClient.patch(`/invoices/${id}/pay`, { paidAt: new Date().toISOString() });
      return response.data;
    } else if (status === 'Cancelled') {
      const response = await apiClient.patch(`/invoices/${id}/cancel`);
      return response.data;
    } else {
      throw new Error(`Unsupported status update to ${status}`);
    }
  },

  async sendReminder(id) {
    const response = await apiClient.post(`/invoices/${id}/send-reminder`);
    return response.data;
  },
};
