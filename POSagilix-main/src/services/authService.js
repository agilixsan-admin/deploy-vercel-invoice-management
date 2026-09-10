/**
 * API Service for Authentication endpoints
 */
import apiClient from '../lib/apiClient';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async resetPassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/reset-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.warn('Logout request failed:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
    }
  },
};

