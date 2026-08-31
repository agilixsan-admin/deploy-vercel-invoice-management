/**
 * Models and request body constructors for Invoice API endpoints
 */

export function buildCreateInvoiceRequestBody(formData) {
  let billingPeriod = formData.billingPeriod;
  let yearStr, monthStr;

  if (billingPeriod) {
    [yearStr, monthStr] = billingPeriod.split('-');
  } else {
    const now = new Date();
    yearStr = now.getFullYear().toString();
    monthStr = String(now.getMonth() + 1).padStart(2, '0');
    billingPeriod = `${yearStr}-${monthStr}`;
  }

  const dueDate = formData.dueDate || `${yearStr}-${monthStr}-15`;
  const amountStr = String(formData.amount || '0').replace(/[^0-9]/g, '');
  const amount = parseInt(amountStr, 10) || 0;

  const body = {
    tenantId: formData.tenantId,
    amount,
    billingPeriod,
    dueDate,
  };

  if (formData.notes?.trim()) {
    body.notes = formData.notes.trim();
  }

  return body;
}

export function buildUpdateInvoiceStatusRequestBody(id, status) {
  return {
    id,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function buildInvoiceFilterQueryParams(params = {}) {
  const query = {
    page: params.page || 1,
    limit: params.limit || 50, // Fetch more to allow client-side search/pagination
  };

  if (params.status === 'Paid') {
    query.status = 'PAID';
  }

  return query;
}
