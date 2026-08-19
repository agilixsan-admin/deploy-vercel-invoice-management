import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/dashboard/dashboard';
import TenantManagement from './pages/tenantmanagement/tenantmanagement';
import UserManagement from './pages/usermanagement/usermanagement';
import InvoiceBilling from './pages/invoicebilling/invoicebilling';
import AuditTrail from './pages/audittrail/audittrail';
import InvoiceDetail from './pages/invoicedetail/invoicedetail';
import Login from './pages/login/login';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tenant-management" element={<TenantManagement />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="invoice-billing" element={<InvoiceBilling />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="invoice/:id" element={<InvoiceDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
