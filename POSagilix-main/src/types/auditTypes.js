/**
 * Models and request body constructors for Audit Trail API endpoints
 */

export function buildAuditFilterQueryParams(params = {}) {
  const query = {
    page: params.page || 1,
    limit: params.limit || 10,
  };

  // action — filter by AuditAction enum, skip jika 'all' atau kosong
  if (params.category && params.category !== 'all') {
    query.action = params.category;
  }

  // dateFrom — dari field date di FE
  if (params.date) {
    query.dateFrom = new Date(params.date).toISOString();
  }

  // actorId — jika search berupa UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (params.search && uuidRegex.test(params.search)) {
    query.actorId = params.search;
  }

  return query;
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
