import apiClient from '../lib/apiClient';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    const payload = response.data.data || response.data;
    return payload.items || payload;
  },

  async getNotificationById(id) {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data.data || response.data;
  },

  async resendNotification(id) {
    const response = await apiClient.post(`/notifications/${id}/resend`);
    return response.data.data || response.data;
  },
};
