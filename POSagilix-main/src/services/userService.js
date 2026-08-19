/**
 * API Service for User Management endpoints
 */
import apiClient from '../lib/apiClient';
import { buildUserFilterQueryParams } from '../types/userTypes';

export const userService = {
  async getUsers(params = {}) {
    const query = buildUserFilterQueryParams(params);
    const response = await apiClient.get('/users', { params: query });
    const payload = response.data.data || response.data;
    return payload.items || payload;
  },

  async createUser(payload) {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  async updateUser(id, payload) {
    const response = await apiClient.patch(`/users/${id}`, payload);
    return response.data;
  },

  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
