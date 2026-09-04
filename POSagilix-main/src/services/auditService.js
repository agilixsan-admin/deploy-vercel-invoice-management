import apiClient from '../lib/apiClient';
import { buildAuditFilterQueryParams } from '../types/auditTypes';

function mapAuditLog(log) {
  return {
    id: log.id,
    timestamp: log.createdAt
      ? new Date(log.createdAt).toLocaleString('id-ID')
      : '-',
    adminUser: log.actor?.email ?? log.actorId ?? '-',
    actionText: log.action ?? '-',
    actionType: resolveActionType(log.action),
    target: log.targetType ? `${log.targetType} (${log.targetId ?? '-'})` : '-',
    ipAddress: log.ipAddress ?? '-',
  };
}

function resolveActionType(action = '') {
  if (action.includes('LOCK')) return 'locked';
  if (action.includes('CREATE') || action.includes('REGISTER')) return 'created';
  if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'password';
  if (action.includes('PLAN') || action.includes('UPDATE')) return 'plan';
  if (action.includes('INVOICE') || action.includes('PAID')) return 'posted';
  return 'default';
}

export const auditService = {
  async getAuditLogs(params = {}) {
    const query = buildAuditFilterQueryParams(params);
    const response = await apiClient.get('/audit-logs', { params: query });
    const raw = response.data.data || response.data;
    const items = raw.items ?? raw;
    return {
      items: Array.isArray(items) ? items.map(mapAuditLog) : [],
      total: raw.total ?? items.length,
      totalPages: raw.totalPages ?? 1,
    };
  },

  async exportAuditLogs() {
    const response = await apiClient.get('/audit-logs/export', { responseType: 'blob' });
    return response.data;
  },
};
