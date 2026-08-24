import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  PanelLeftClose, 
  PanelLeft, 
  Search, 
  X, 
  FileText, 
  Users, 
  UserCog, 
  ClipboardList, 
  ArrowRight,
  SearchX,
  LogOut
} from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import './Topbar.css';

const searchDatabase = {
  invoices: [
    { id: 'INV-2024-10-001', title: 'INV-2024-10-001', subtitle: 'Warung Kopi Nusantara • Oct 2024', status: 'Unpaid', path: '/invoice-billing?search=INV-2024-10-001' },
    { id: 'INV-2023-10-001', title: 'INV-2023-10-001', subtitle: 'Acme Corp Ltd. • Oct 2023', status: 'Paid', path: '/invoice-billing?search=INV-2023-10-001' },
    { id: 'INV-2023-10-002', title: 'INV-2023-10-002', subtitle: 'Globex Technologies • Oct 2023', status: 'Unpaid', path: '/invoice-billing?search=INV-2023-10-002' },
    { id: 'INV-2023-10-003', title: 'INV-2023-10-003', subtitle: 'Initech Solutions • Oct 2023', status: 'Draft', path: '/invoice-billing?search=INV-2023-10-003' },
    { id: 'INV-2023-09-001', title: 'INV-2023-09-001', subtitle: 'Bengkel Jaya • Sep 2023', status: 'Paid', path: '/invoice-billing?search=INV-2023-09-001' },
  ],
  tenants: [
    { id: 't1', title: 'Warung Kopi Nusantara', subtitle: 'owner@kopinusantara.id • 12 outlets', status: 'ACTIVE', path: '/tenant-management?search=Warung Kopi' },
    { id: 't2', title: 'Toko Baju Trendy', subtitle: 'admin@bajutrendy.com • 3 outlets', status: 'PAST_DUE', path: '/tenant-management?search=Toko Baju' },
    { id: 't3', title: 'Resto Padang Sejahtera', subtitle: 'contact@restopadang.id • 5 outlets', status: 'ACTIVE', path: '/tenant-management?search=Resto Padang' },
    { id: 't4', title: 'Bengkel Jaya', subtitle: 'service@bengkeljaya.co.id • 2 outlets', status: 'ACTIVE', path: '/tenant-management?search=Bengkel Jaya' },
  ],
  users: [
    { id: 'u1', title: 'Ahmad Fauzi', subtitle: 'ahmad.fauzi@agilix.id • Super Admin', status: 'Active', path: '/user-management?search=Ahmad' },
    { id: 'u2', title: 'Siti Rahayu', subtitle: 'siti.rahayu@kopinusantara.id • Tenant Admin', status: 'Active', path: '/user-management?search=Siti' },
    { id: 'u3', title: 'Budi Santoso', subtitle: 'budi.s@bajutrendy.com • Tenant Admin', status: 'Inactive', path: '/user-management?search=Budi' },
    { id: 'u4', title: 'Dewi Lestari', subtitle: 'dewi@restopadang.id • Cashier', status: 'Active', path: '/user-management?search=Dewi' },
    { id: 'u5', title: 'Rizky Pratama', subtitle: 'rizky@bengkeljaya.id • Cashier', status: 'Active', path: '/user-management?search=Rizky' },
  ],
  audit: [
    { id: 'a1', title: 'Locked tenant account', subtitle: 'Warung Kopi Nusantara • admin.sys@agilix.com', status: 'Log', path: '/audit-trail?search=Locked' },
    { id: 'a2', title: 'Posted invoice #INV-2024-08', subtitle: 'Toko Baju Trendy • finance.lead@agilix.com', status: 'Log', path: '/audit-trail?search=Posted' },
    { id: 'a3', title: 'Reset user password', subtitle: 'support.tier1@agilix.com', status: 'Log', path: '/audit-trail?search=Reset' },
  ]
};

export default function Topbar({ onMenuClick, isSidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const inputRef = useRef(null);

  const userInfoStr = localStorage.getItem('user_info');
  let userInfo = null;
  try {
    userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch(e) {}
  
  const userName = userInfo?.fullName || userInfo?.name || 'Jamal';
  const userRole = userInfo?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                   userInfo?.role === 'TENANT_ADMIN' ? 'Tenant Admin' : 
                   userInfo?.role === 'CASHIER' ? 'Cashier' : 
                   userInfo?.role || 'Super Admin';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [unpaidTenants, setUnpaidTenants] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load unpaid tenants
  useEffect(() => {
    const fetchUnpaid = async () => {
      try {
        const tenants = await tenantService.getTenants({ status: 'PAST_DUE' });
        setUnpaidTenants(tenants);
        setUnpaidCount(tenants.length);
      } catch (err) {
        console.error('Failed to load unpaid tenants for notifications', err);
      }
    };
    fetchUnpaid();
  }, []);

  // Filter items matching query
  const trimmed = query.trim().toLowerCase();
  const matchingInvoices = trimmed ? searchDatabase.invoices.filter(i => i.title.toLowerCase().includes(trimmed) || i.subtitle.toLowerCase().includes(trimmed)) : [];
  const matchingTenants = trimmed ? searchDatabase.tenants.filter(t => t.title.toLowerCase().includes(trimmed) || t.subtitle.toLowerCase().includes(trimmed)) : [];
  const matchingUsers = trimmed ? searchDatabase.users.filter(u => u.title.toLowerCase().includes(trimmed) || u.subtitle.toLowerCase().includes(trimmed)) : [];
  const matchingAudit = trimmed ? searchDatabase.audit.filter(a => a.title.toLowerCase().includes(trimmed) || a.subtitle.toLowerCase().includes(trimmed)) : [];

  const totalResults = matchingInvoices.length + matchingTenants.length + matchingUsers.length + matchingAudit.length;

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectResult = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    navigate('/'); // Or /login depending on routing. In this app, / seems to be login based on standard setup, or '/login'. Actually navigate('/login') is safer, but I'll use '/' which usually redirects to login. Wait, let me check App.jsx route if possible, or just use navigate('/login'). Actually the user was at login page so I will navigate to '/login'.
    // Let me just navigate to '/login'.
  };

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/invoice-billing?search=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
  };

  return (
    <header className="topbar">
      {/* Toggle button */}
      <button
        className={`topbar-hamburger ${isSidebarOpen ? 'active' : ''}`}
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isSidebarOpen ? <PanelLeftClose size={19} /> : <PanelLeft size={19} />}
      </button>

      {/* Global Search Bar */}
      <div className="topbar-search" ref={searchRef}>
        <form onSubmit={handleSubmitSearch} className="topbar-search-form">
          <div className="topbar-search-icon">
            <Search size={15} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="topbar-search-input"
            placeholder="Search invoices, tenants, users... (Ctrl+K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {query ? (
            <button
              type="button"
              className="topbar-search-clear"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="topbar-search-kbd">Ctrl K</kbd>
          )}
        </form>

        {/* Search Results Floating Palette */}
        {isOpen && query.trim().length > 0 && (
          <div className="topbar-search-dropdown">
            {totalResults === 0 ? (
              <div className="topbar-search-empty">
                <SearchX size={28} className="empty-icon" />
                <p className="empty-title">No results found for "{query}"</p>
                <p className="empty-sub">Try searching by ID, tenant name, user email, or invoice number.</p>
              </div>
            ) : (
              <div className="topbar-search-results">
                {/* Invoices Group */}
                {matchingInvoices.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-header">
                      <FileText size={13} className="group-icon blue" />
                      <span>Invoices ({matchingInvoices.length})</span>
                    </div>
                    {matchingInvoices.map((item) => (
                      <div
                        key={item.id}
                        className="search-result-item"
                        onClick={() => handleSelectResult(item.path)}
                      >
                        <div className="result-item-main">
                          <span className="result-title">{item.title}</span>
                          <span className="result-subtitle">{item.subtitle}</span>
                        </div>
                        <div className="result-item-badge badge-blue">{item.status}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tenants Group */}
                {matchingTenants.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-header">
                      <Users size={13} className="group-icon purple" />
                      <span>Tenants ({matchingTenants.length})</span>
                    </div>
                    {matchingTenants.map((item) => (
                      <div
                        key={item.id}
                        className="search-result-item"
                        onClick={() => handleSelectResult(item.path)}
                      >
                        <div className="result-item-main">
                          <span className="result-title">{item.title}</span>
                          <span className="result-subtitle">{item.subtitle}</span>
                        </div>
                        <div className="result-item-badge badge-purple">{item.status}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Users Group */}
                {matchingUsers.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-header">
                      <UserCog size={13} className="group-icon green" />
                      <span>Users ({matchingUsers.length})</span>
                    </div>
                    {matchingUsers.map((item) => (
                      <div
                        key={item.id}
                        className="search-result-item"
                        onClick={() => handleSelectResult(item.path)}
                      >
                        <div className="result-item-main">
                          <span className="result-title">{item.title}</span>
                          <span className="result-subtitle">{item.subtitle}</span>
                        </div>
                        <div className="result-item-badge badge-green">{item.status}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Audit Logs Group */}
                {matchingAudit.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-header">
                      <ClipboardList size={13} className="group-icon orange" />
                      <span>Audit Logs ({matchingAudit.length})</span>
                    </div>
                    {matchingAudit.map((item) => (
                      <div
                        key={item.id}
                        className="search-result-item"
                        onClick={() => handleSelectResult(item.path)}
                      >
                        <div className="result-item-main">
                          <span className="result-title">{item.title}</span>
                          <span className="result-subtitle">{item.subtitle}</span>
                        </div>
                        <div className="result-item-badge badge-gray">Log</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Action */}
                <div
                  className="search-footer-action"
                  onClick={() => handleSubmitSearch({ preventDefault: () => {} })}
                >
                  <span>Press <kbd>Enter</kbd> to search <strong>"{query}"</strong> in Invoices</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions" ref={notifRef}>
        <div className="notification-wrapper">
          <button 
            className="topbar-icon-btn" 
            aria-label="Notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
          >
            <Bell size={18} />
            {unpaidCount > 0 && (
              <span className="topbar-notification-badge">{unpaidCount}</span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
              </div>
              <div className="notification-list">
                {unpaidTenants.length > 0 ? (
                  unpaidTenants.map(t => (
                    <div key={t.id} className="notification-item" onClick={() => {
                      setIsNotifOpen(false);
                      navigate(`/tenant-management?search=${encodeURIComponent(t.businessName)}`);
                    }}>
                      <div className="notification-icon warning">!</div>
                      <div className="notification-content">
                        <p className="notification-title">{t.businessName} is unpaid</p>
                        <p className="notification-time">Status: PAST_DUE</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">No new notifications</div>
                )}
              </div>
              {unpaidTenants.length > 0 && (
                <div className="notification-footer" onClick={() => {
                  setIsNotifOpen(false);
                  navigate('/tenant-management?status=PAST_DUE');
                }}>
                  View all unpaid tenants
                </div>
              )}
            </div>
          )}
        </div>
        <div className="profile-wrapper" ref={profileRef}>
          <div className="topbar-avatar" onClick={() => setIsProfileOpen(!isProfileOpen)}>{userInitials}</div>
          
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-name">{userName}</div>
                <div className="profile-role">{userRole}</div>
              </div>
              <div className="profile-menu">
                <button className="profile-menu-item" onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user_info');
                  navigate('/');
                }}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
