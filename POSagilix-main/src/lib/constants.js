// Initial master datasets for POSAgilix application

export const INITIAL_TENANTS = [
  {
    id: 1,
    businessName: 'Warung Kopi Nusantara',
    ownerEmail: 'owner@kopinusantara.id',
    plan: 'Yearly plan',
    planType: 'yearly',
    outlets: 12,
    status: 'ACTIVE',
    expiryDate: 'Oct 15, 2024',
    isLocked: false,
  },
  {
    id: 2,
    businessName: 'Toko Baju Trendy',
    ownerEmail: 'admin@bajutrendy.com',
    plan: 'Yearly plan',
    planType: 'yearly',
    outlets: 3,
    status: 'PAST_DUE',
    expiryDate: 'Sep 01, 2023',
    isLocked: false,
  },
  {
    id: 3,
    businessName: 'Resto Padang Sejahtera',
    ownerEmail: 'contact@restopadang.id',
    plan: 'Monthly plan',
    planType: 'monthly',
    outlets: 5,
    status: 'ACTIVE',
    expiryDate: 'Dec 20, 2024',
    isLocked: false,
  },
  {
    id: 4,
    businessName: 'Bengkel Jaya',
    ownerEmail: 'service@bengkeljaya.co.id',
    plan: 'Monthly plan',
    planType: 'monthly',
    outlets: 2,
    status: 'ACTIVE',
    expiryDate: 'Nov 10, 2024',
    isLocked: false,
  },
  {
    id: 5,
    businessName: 'Apotek Sehat',
    ownerEmail: 'farmasi@sehat.com',
    plan: 'Yearly plan',
    planType: 'yearly',
    outlets: 8,
    status: 'ACTIVE',
    expiryDate: 'Nov 30, 2024',
    isLocked: false,
  },
];

export const INITIAL_USERS = [
  { id: 1, name: 'Ahmad Fauzi', email: 'ahmad.fauzi@agilix.id', role: 'Super Admin', tenant: 'All Tenants', status: 'Active', lastLogin: '2 hours ago' },
  { id: 2, name: 'Siti Rahayu', email: 'siti.rahayu@kopinusantara.id', role: 'Tenant Admin', tenant: 'Warung Kopi Nusantara', status: 'Active', lastLogin: '1 day ago' },
  { id: 3, name: 'Budi Santoso', email: 'budi.s@bajutrendy.com', role: 'Tenant Admin', tenant: 'Toko Baju Trendy', status: 'Inactive', lastLogin: '30 days ago' },
  { id: 4, name: 'Dewi Lestari', email: 'dewi@restopadang.id', role: 'Cashier', tenant: 'Resto Padang Sejahtera', status: 'Active', lastLogin: '5 hours ago' },
  { id: 5, name: 'Rizky Pratama', email: 'rizky@bengkeljaya.id', role: 'Cashier', tenant: 'Bengkel Jaya', status: 'Active', lastLogin: '3 days ago' },
];

export const INITIAL_INVOICES = [
  { id: 'INV-2024-10-001', tenant: 'Warung Kopi Nusantara', period: 'Oct 2024', month: 'October', year: '2024', amount: 'Rp 2.500.000', status: 'Unpaid', dueDate: 'Nov 15, 2024' },
  { id: 'INV-2023-10-001', tenant: 'Acme Corp Ltd.', period: 'Oct 2023', month: 'October', year: '2023', amount: 'Rp 15.000.000', status: 'Paid', dueDate: 'Oct 15, 2023' },
  { id: 'INV-2023-10-002', tenant: 'Globex Technologies', period: 'Oct 2023', month: 'October', year: '2023', amount: 'Rp 22.500.000', status: 'Unpaid', dueDate: 'Oct 20, 2023' },
  { id: 'INV-2023-10-003', tenant: 'Initech Solutions', period: 'Oct 2023', month: 'October', year: '2023', amount: 'Rp 8.200.000', status: 'Draft', dueDate: 'Oct 30, 2023' },
  { id: 'INV-2023-09-001', tenant: 'Bengkel Jaya', period: 'Sep 2023', month: 'September', year: '2023', amount: 'Rp 5.000.000', status: 'Paid', dueDate: 'Sep 15, 2023' },
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 1,
    timestamp: '2024-05-20 14:32:01',
    adminUser: 'admin.sys@agilix.com',
    actionText: 'Locked tenant account',
    actionType: 'locked',
    target: 'Warung Kopi Nusantara',
    ipAddress: '192.168.1.45',
  },
  {
    id: 2,
    timestamp: '2024-05-20 11:15:44',
    adminUser: 'finance.lead@agilix.com',
    actionText: 'Posted invoice #INV-2024-08',
    actionType: 'posted',
    target: 'Toko Baju Trendy',
    ipAddress: '10.0.4.112',
  },
  {
    id: 3,
    timestamp: '2024-05-19 09:41:12',
    adminUser: 'support.tier1@agilix.com',
    actionText: 'Reset user password',
    actionType: 'password',
    target: 'budi.santoso@bajutrendy.com',
    ipAddress: '192.168.1.88',
  },
  {
    id: 4,
    timestamp: '2024-05-18 16:04:30',
    adminUser: 'admin.sys@agilix.com',
    actionText: 'Updated tenant subscription plan',
    actionType: 'plan',
    target: 'Resto Padang Sejahtera',
    ipAddress: '192.168.1.45',
  },
  {
    id: 5,
    timestamp: '2024-05-17 13:22:50',
    adminUser: 'admin.sys@agilix.com',
    actionText: 'Created new tenant account',
    actionType: 'created',
    target: 'Bengkel Jaya',
    ipAddress: '192.168.1.45',
  },
];

export const DASHBOARD_GROWTH_DATA = [
  { month: 'May', tenants: 10 },
  { month: 'Jun', tenants: 13 },
  { month: 'Jul', tenants: 20 },
  { month: 'Aug', tenants: 18 },
  { month: 'Sep', tenants: 30 },
  { month: 'Oct', tenants: 45 },
];

export const DASHBOARD_PAST_DUE_CLIENTS = [
  { name: 'Acme Corp', dueDate: 'Oct 15' },
  { name: 'Globex Inc', dueDate: 'Oct 18' },
  { name: 'Initech', dueDate: 'Oct 20' },
  { name: 'Soylent Corp', dueDate: 'Oct 22' },
];
