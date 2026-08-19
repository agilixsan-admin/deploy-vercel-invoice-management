// Helper utility functions for formatting and data manipulation

export const formatCurrency = (amount) => {
  if (typeof amount === 'number') {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
  if (typeof amount === 'string') {
    if (amount.startsWith('Rp')) return amount;
    const numeric = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(numeric)) {
      return `Rp ${numeric.toLocaleString('id-ID')}`;
    }
  }
  return `Rp ${amount || '0'}`;
};

export const getStatusBadgeClass = (status) => {
  const map = {
    Active: 'badge-green',
    ACTIVE: 'badge-green',
    Paid: 'badge-green',
    PAID: 'badge-green',
    Inactive: 'badge-gray',
    INACTIVE: 'badge-gray',
    Draft: 'badge-gray',
    DRAFT: 'badge-gray',
    Unpaid: 'badge-red',
    UNPAID: 'badge-red',
    PAST_DUE: 'badge-red',
    Overdue: 'badge-orange',
    OVERDUE: 'badge-orange',
  };
  return map[status] || 'badge-gray';
};

export const getAuditActionBadgeClass = (actionType) => {
  switch (actionType) {
    case 'locked':
      return 'audit-badge-locked';
    case 'posted':
      return 'audit-badge-posted';
    case 'password':
      return 'audit-badge-password';
    case 'plan':
      return 'audit-badge-plan';
    default:
      return 'audit-badge-default';
  }
};
