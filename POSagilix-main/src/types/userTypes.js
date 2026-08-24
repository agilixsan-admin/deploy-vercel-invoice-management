/**
 * Models and request body constructors for User API endpoints
 */

function mapRoleToEnum(role) {
  if (role === 'Super Admin') return 'SUPER_ADMIN';
  if (role === 'Tenant Admin') return 'TENANT_ADMIN';
  if (role === 'Cashier') return 'CASHIER';
  return 'VIEWER';
}

export function buildCreateUserRequestBody(formData) {
  return {
    fullName: formData.name?.trim() || '',
    email: formData.email?.trim() || '',
    password: formData.password || '',
    role: mapRoleToEnum(formData.role),
  };
}

export function buildUpdateUserRequestBody(id, updates) {
  return {
    ...updates,
  };
}

export function buildUserFilterQueryParams(params = {}) {
  const query = {
    search: params.search || '',
    page: params.page || 1,
    limit: params.limit || 10,
  };

  if (params.role && params.role !== 'all') {
    query.role = mapRoleToEnum(params.role);
  }

  if (params.status && params.status !== 'all') {
    query.isActive = params.status === 'Active' ? 'true' : 'false';
  }

  return query;
}
