
export function buildCreateTenantRequestBody(formData) {
  const plan = formData.planType?.toUpperCase();
  const validPlan = plan === 'MONTHLY' ? 'MONTHLY' : 'YEARLY';

  const body = {
    businessName: formData.businessName?.trim() || '',
    ownerName: formData.ownerName?.trim() || '',
    ownerEmail: formData.ownerEmail?.trim() || '',
    planType: validPlan,
    outletCount: parseInt(formData.outlets || formData.outletCount, 10) || 1,
    expiryDate: formData.expiryDate || new Date().toISOString().split('T')[0],
  };

  if (formData.ownerPhone?.trim()) {
    body.ownerPhone = formData.ownerPhone.trim();
  }
  if (formData.notes?.trim()) {
    body.notes = formData.notes.trim();
  }
  if (formData.erpWebhookUrl?.trim()) {
    body.erpWebhookUrl = formData.erpWebhookUrl.trim();
  }
  if (formData.erpWebhookKey?.trim()) {
    body.erpWebhookKey = formData.erpWebhookKey.trim();
  }

  return body;
}

export function buildUpdateTenantRequestBody(id, updates) {
  const body = {};

  if (updates.businessName !== undefined && updates.businessName !== null && updates.businessName !== '') {
    body.businessName = updates.businessName.trim();
  }
  if (updates.ownerName !== undefined && updates.ownerName !== null && updates.ownerName !== '') {
    body.ownerName = updates.ownerName.trim();
  }
  if (updates.ownerEmail !== undefined && updates.ownerEmail !== null && updates.ownerEmail !== '') {
    body.ownerEmail = updates.ownerEmail.trim();
  }
  if (updates.ownerPhone !== undefined && updates.ownerPhone !== null && updates.ownerPhone !== '') {
    body.ownerPhone = updates.ownerPhone.trim();
  }
  if (updates.planType) {
    body.planType = updates.planType.toUpperCase() === 'MONTHLY' ? 'MONTHLY' : 'YEARLY';
  }
  if (updates.outlets !== undefined || updates.outletCount !== undefined) {
    const count = parseInt(updates.outlets || updates.outletCount, 10);
    if (!isNaN(count) && count >= 1) {
      body.outletCount = count;
    }
  }
  if (updates.expiryDate) {
    body.expiryDate = updates.expiryDate;
  }
  if (updates.notes !== undefined && updates.notes !== null) {
    body.notes = updates.notes;
  }
  if (updates.erpWebhookUrl !== undefined && updates.erpWebhookUrl !== null && updates.erpWebhookUrl.trim() !== '') {
    body.erpWebhookUrl = updates.erpWebhookUrl.trim();
  }
  if (updates.erpWebhookKey !== undefined && updates.erpWebhookKey !== null && updates.erpWebhookKey.trim() !== '') {
    body.erpWebhookKey = updates.erpWebhookKey.trim();
  }

  return body;
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
