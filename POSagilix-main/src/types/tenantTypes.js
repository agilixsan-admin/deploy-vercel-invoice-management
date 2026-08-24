/**
 * Models and request body constructors for Tenant API endpoints
 */

export function buildCreateTenantRequestBody(formData) {
  return {
    businessName: formData.businessName?.trim() || '',
    ownerName: formData.ownerName?.trim() || '',
    ownerEmail: formData.ownerEmail?.trim() || '',
    planType: formData.planType?.toUpperCase() || 'YEARLY',
    outletCount: parseInt(formData.outlets, 10) || 1,
    expiryDate: formData.expiryDate || new Date().toISOString().split('T')[0],
    webhookUrl: formData.webhookUrl?.trim() || null,
    apiKey: formData.apiKey?.trim() || null,
  };
}

export function buildUpdateTenantRequestBody(id, updates) {
  return {
    ...updates,
  };
}

export function buildTenantFilterQueryParams(params = {}) {
  const query = {
    search: params.search || '',
    page: params.page || 1,
    limit: params.limit || 10,
  };
  
  if (params.planType && params.planType !== 'all') {
    query.planType = params.planType.toUpperCase();
  }
  
  if (params.status && params.status !== 'all') {
    query.status = params.status.toUpperCase();
  }
  
  return query;
}
