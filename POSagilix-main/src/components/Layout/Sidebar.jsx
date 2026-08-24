import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  ClipboardList,
  Settings,
  X
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tenant-management', icon: Users, label: 'Tenant Management' },
  { path: '/user-management', icon: UserCog, label: 'User Management' },
  { path: '/invoice-billing', icon: FileText, label: 'Invoice & Billing' },
  { path: '/audit-trail', icon: ClipboardList, label: 'Audit Trail' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar({ isOpen, onClose }) {
  const userInfoStr = localStorage.getItem('user_info');
  let userInfo = null;
  try {
    userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch(e) {}
  
  const userName = userInfo?.fullName || userInfo?.name || 'Admin User';
  const userRole = userInfo?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                   userInfo?.role === 'TENANT_ADMIN' ? 'Tenant Admin' : 
                   userInfo?.role === 'CASHIER' ? 'Cashier' : 
                   userInfo?.role || 'Super Admin';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const handleNavClick = () => {
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#2563eb"/>
              <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#3b82f6" opacity="0.8"/>
              <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#3b82f6" opacity="0.8"/>
              <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#60a5fa" opacity="0.6"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-brand">Agilix Console</span>
            <span className="sidebar-subbrand">Admin Portal</span>
          </div>
        </div>

        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-nav-container">
        <div className="sidebar-section-title">Navigation</div>
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label, badge }, index) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
              style={{ '--delay': index }}
            >
              <div className="sidebar-nav-active-pill" />
              <div className="sidebar-icon-wrapper">
                <Icon size={19} className="sidebar-nav-icon" />
              </div>
              <span className="sidebar-nav-label">{label}</span>
              {badge && <span className="sidebar-nav-badge">{badge}</span>}

              {/* Floating tooltip when collapsed */}
              <div className="sidebar-tooltip">
                <span>{label}</span>
                {badge && <span className="sidebar-tooltip-badge">{badge}</span>}
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{userInitials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{userName}</span>
            <span className="sidebar-user-role">{userRole}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

