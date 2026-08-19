/**
 * Models and request body constructors for Audit Trail API endpoints
 */

export function buildAuditFilterQueryParams(params = {}) {
  return {
    search: params.search || '',
    category: params.category || 'all',
    date: params.date || '',
    page: params.page || 1,
    limit: params.limit || 10,
  };
}

export function buildAuditLogItem(logData) {
  return {
    id: logData.id || Date.now(),
    timestamp: logData.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
    adminUser: logData.adminUser || 'admin.sys@agilix.com',
    actionText: logData.actionText,
    actionType: logData.actionType || 'default',
    target: logData.target || '',
    ipAddress: logData.ipAddress || '192.168.1.1',
  };
}
