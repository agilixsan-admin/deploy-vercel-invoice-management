/**
 * Models and request body constructors for Invoice API endpoints
 */

export function buildCreateInvoiceRequestBody(formData) {
  const monthMap = {
    January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
    July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
  };
  
  let billingPeriod = formData.billingPeriod;
  let yearStr, monthStr;

  if (billingPeriod) {
    [yearStr, monthStr] = billingPeriod.split('-');
  } else {
    monthStr = monthMap[formData.billingMonth] || '10';
    yearStr = formData.billingYear || new Date().getFullYear().toString();
    billingPeriod = `${yearStr}-${monthStr}`;
  }

  const dueDate = `${yearStr}-${monthStr}-15`;

  const amountStr = String(formData.amount || '0').replace(/[^0-9]/g, '');
  const amount = parseInt(amountStr, 10) || 0;

  return {
    tenantId: formData.tenantId,
    amount,
    billingPeriod,
    dueDate,
    notes: formData.notes || '',
  };
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

  if (params.status && params.status !== 'All Invoices') {
    query.status = params.status.toUpperCase();
  }

  return query;
}
