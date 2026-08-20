import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/dashboard/dashboard';
import TenantManagement from './pages/tenantmanagement/tenantmanagement';
import UserManagement from './pages/usermanagement/usermanagement';
import InvoiceBilling from './pages/invoicebilling/invoicebilling';
import AuditTrail from './pages/audittrail/audittrail';
import InvoiceDetail from './pages/invoicedetail/invoicedetail';
import Login from './pages/login/login';
import './App.css';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation(); // Force re-render on route change
  
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const payload = parseJwt(token);
  // Check if payload exists and token is expired (exp is in seconds)
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
