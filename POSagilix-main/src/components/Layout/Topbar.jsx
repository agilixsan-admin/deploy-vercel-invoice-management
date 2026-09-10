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
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Mail,
  Clock
} from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import { invoiceService } from '../../services/invoiceService';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
import { auditService } from '../../services/auditService';
import { authService } from '../../services/authService';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';
import './Topbar.css';

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
  
  const userName = userInfo?.fullName || userInfo?.name || 'Admin User';
  const userRole = userInfo?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                   userInfo?.role === 'TENANT_ADMIN' ? 'Tenant Admin' : 
                   userInfo?.role === 'CASHIER' ? 'Cashier' : 
                   userInfo?.role || 'Super Admin';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifTab, setNotifTab] = useState('all'); // 'all' | 'invoices' | 'system'
  const [notifLoading, setNotifLoading] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Reset password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetForm, setResetForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Load unified notifications: overdue invoices, pending invoices, past due tenants, and system notifications
  const fetchAllNotifications = async () => {
    try {
      setNotifLoading(true);
      const [tenantsRes, invoicesRes, systemNotifsRes] = await Promise.allSettled([
        tenantService.getTenants({ status: 'PAST_DUE' }),
        invoiceService.getInvoices({ limit: 50 }),
        notificationService.getNotifications({ limit: 15 }),
      ]);

      const items = [];

      // 1. Past due tenants
      if (tenantsRes.status === 'fulfilled' && Array.isArray(tenantsRes.value)) {
        tenantsRes.value.forEach((t) => {
          items.push({
            id: `tenant-${t.id}`,
            category: 'invoices',
            type: 'tenant_past_due',
            badge: 'Past Due',
            badgeClass: 'overdue',
            title: `${t.businessName} memiliki tunggakan`,
            subtitle: `Status: PAST_DUE • Paket: ${t.planType || 'MONTHLY'}`,
            time: 'Perlu Tindakan',
            timestamp: new Date(t.updatedAt || t.createdAt || Date.now()).getTime(),
            path: `/tenant-management?search=${encodeURIComponent(t.businessName)}`,
          });
        });
      }

      // 2. Unpaid & Overdue Invoices
      if (invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value)) {
        const unpaidInvoices = invoicesRes.value.filter((inv) =>
          ['PENDING', 'OVERDUE', 'UNPAID'].includes(String(inv.status).toUpperCase())
        );
        unpaidInvoices.forEach((inv) => {
          const isOverdue =
            inv.status === 'OVERDUE' ||
            (inv.dueDate && new Date(inv.dueDate) < new Date());
          const tenantName = inv.tenant?.businessName || inv.tenant?.name || 'Tenant';
          const amountStr = `Rp ${Number(inv.amount || 0).toLocaleString('id-ID')}`;
          const formattedDueDate = inv.dueDate
            ? new Date(inv.dueDate).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
              })
            : '-';

          items.push({
            id: `invoice-${inv.id}`,
            category: 'invoices',
            type: isOverdue ? 'invoice_overdue' : 'invoice_pending',
            badge: isOverdue ? 'Overdue' : 'Unpaid',
            badgeClass: isOverdue ? 'overdue' : 'pending',
            title: isOverdue
              ? `Invoice ${inv.invoiceNumber || inv.id} Lewat Jatuh Tempo`
              : `Invoice ${inv.invoiceNumber || inv.id} Menunggu Pembayaran`,
            subtitle: `${tenantName} • ${amountStr} • Due: ${formattedDueDate}`,
            time: isOverdue ? 'Lewat tempo' : 'Belum lunas',
            timestamp: new Date(inv.createdAt || Date.now()).getTime(),
            path: `/invoice/${inv.id}`,
          });
        });
      }

      // 3. System Notifications
      if (systemNotifsRes.status === 'fulfilled' && Array.isArray(systemNotifsRes.value)) {
        systemNotifsRes.value.forEach((n) => {
          const recipientName = n.tenant?.businessName || n.recipient || 'User';
          items.push({
            id: `sys-${n.id}`,
            category: 'system',
            type: 'system_notification',
            badge: n.status || 'Email',
            badgeClass: 'system',
            title: n.subject || `Pemberitahuan Sistem (${n.type})`,
            subtitle: `Terkirim ke: ${recipientName} (${n.recipient || '-'})`,
            time: n.createdAt
              ? new Date(n.createdAt).toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Baru saja',
            timestamp: new Date(n.createdAt || Date.now()).getTime(),
            path: '/invoice-billing',
          });
        });
      }

      // Sort: overdue first, then newest
      items.sort((a, b) => {
        if (a.type.includes('overdue') && !b.type.includes('overdue')) return -1;
        if (!a.type.includes('overdue') && b.type.includes('overdue')) return 1;
        return b.timestamp - a.timestamp;
      });

      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  // Realtime updates via SSE
  useRealtimeEvents((eventObj) => {
    if (
      eventObj?.event &&
      (eventObj.event.startsWith('invoice.') ||
        eventObj.event.startsWith('tenant.') ||
        eventObj.event.startsWith('notification.'))
    ) {
      fetchAllNotifications();
    }
  });

  const [searchResults, setSearchResults] = useState({
    invoices: [],
    tenants: [],
    users: [],
    audit: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounced real dynamic search across backend APIs
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults({ invoices: [], tenants: [], users: [], audit: [] });
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const [tenantsRes, invoicesRes, usersRes, auditRes] = await Promise.allSettled([
          tenantService.getTenants({ search: trimmed, limit: 5 }),
          invoiceService.getInvoices({ limit: 50 }),
          userService.getUsers({ search: trimmed, limit: 5 }),
          auditService.getAuditLogs({ limit: 20 }),
        ]);

        if (isCancelled) return;

        const matchedTenants = [];
        if (tenantsRes.status === 'fulfilled' && Array.isArray(tenantsRes.value)) {
          tenantsRes.value.forEach((t) => {
            matchedTenants.push({
              id: t.id,
              title: t.businessName,
              subtitle: `${t.ownerEmail || t.ownerName || '-'} • ${t.outletCount || 1} outlets`,
              status: t.status,
              path: `/tenant-management?search=${encodeURIComponent(t.businessName)}`,
            });
          });
        }

        const matchedInvoices = [];
        if (invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value)) {
          const lower = trimmed.toLowerCase();
          const filtered = invoicesRes.value.filter(
            (inv) =>
              (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(lower)) ||
              (inv.tenant?.businessName && inv.tenant.businessName.toLowerCase().includes(lower)) ||
              (inv.billingPeriod && inv.billingPeriod.toLowerCase().includes(lower)) ||
              (inv.id && inv.id.toLowerCase().includes(lower))
          );
          filtered.slice(0, 5).forEach((inv) => {
            const tenantName = inv.tenant?.businessName || inv.tenant?.name || 'Tenant';
            matchedInvoices.push({
              id: inv.id,
              title: inv.invoiceNumber || inv.id,
              subtitle: `${tenantName} • ${inv.billingPeriod} • Rp ${Number(inv.amount || 0).toLocaleString('id-ID')}`,
              status: inv.status,
              path: `/invoice/${inv.id}`,
            });
          });
        }

        const matchedUsers = [];
        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
          usersRes.value.forEach((u) => {
            matchedUsers.push({
              id: u.id,
              title: u.fullName || u.email,
              subtitle: `${u.email} • ${u.role}`,
              status: u.isActive ? 'Active' : 'Inactive',
              path: `/user-management?search=${encodeURIComponent(u.fullName || u.email)}`,
            });
          });
        }

        const matchedAudit = [];
        if (auditRes.status === 'fulfilled' && auditRes.value?.items) {
          const lower = trimmed.toLowerCase();
          const filtered = auditRes.value.items.filter(
            (a) =>
              (a.actionText && a.actionText.toLowerCase().includes(lower)) ||
              (a.adminUser && a.adminUser.toLowerCase().includes(lower)) ||
              (a.ipAddress && a.ipAddress.toLowerCase().includes(lower))
          );
          filtered.slice(0, 5).forEach((a) => {
            matchedAudit.push({
              id: a.id,
              title: a.actionText,
              subtitle: `${a.adminUser} • ${a.timestamp}`,
              status: 'Log',
              path: '/audit-trail',
            });
          });
        }

        setSearchResults({
          tenants: matchedTenants,
          invoices: matchedInvoices,
          users: matchedUsers,
          audit: matchedAudit,
        });
      } catch (err) {
        console.error('Failed to search database:', err);
      } finally {
        if (!isCancelled) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const matchingInvoices = searchResults.invoices;
  const matchingTenants = searchResults.tenants;
  const matchingUsers = searchResults.users;
  const matchingAudit = searchResults.audit;
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
    navigate('/');
  };

  const handleResetPassword = async () => {
    setResetError(null);
    if (!resetForm.currentPassword || !resetForm.newPassword || !resetForm.confirmPassword) {
      setResetError('Semua field wajib diisi.');
      return;
    }
    if (resetForm.newPassword.length < 8) {
      setResetError('Password baru minimal 8 karakter.');
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Password baru dan konfirmasi tidak cocok.');
      return;
    }
    if (resetForm.newPassword === resetForm.currentPassword) {
      setResetError('Password baru tidak boleh sama dengan password lama.');
      return;
    }
    setIsResetting(true);
    try {
      await authService.resetPassword(
        resetForm.currentPassword,
        resetForm.newPassword,
      );
      setResetSuccess(true);
      // Sesi berakhir: bersihkan credentials dan redirect ke login
      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal mereset password.';
      setResetError(msg);
      setIsResetting(false);
    }
  };

  const openResetModal = () => {
    setIsProfileOpen(false);
    setResetForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setResetError(null);
    setResetSuccess(false);
    setIsResetting(false);
    setShowResetModal(true);
  };

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/invoice-billing?search=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (notifTab === 'invoices') return item.category === 'invoices';
    if (notifTab === 'system') return item.category === 'system';
    return true;
  });

  const getNotifIcon = (type) => {
    if (type === 'invoice_overdue' || type === 'tenant_past_due') {
      return <AlertCircle size={15} />;
    }
    if (type === 'invoice_pending') {
      return <Clock size={15} />;
    }
    return <Mail size={15} />;
  };

  const getNotifIconClass = (type) => {
    if (type === 'invoice_overdue' || type === 'tenant_past_due') return 'overdue';
    if (type === 'invoice_pending') return 'pending';
    return 'system';
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
            {searchLoading ? (
              <div className="topbar-search-empty" style={{ padding: '24px 16px' }}>
                <p className="empty-title" style={{ fontSize: '13px', margin: 0 }}>Searching across database...</p>
                <p className="empty-sub">Looking up tenants, invoices, users, and audit logs.</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="topbar-search-empty">
                <SearchX size={28} className="empty-icon" />
                <p className="empty-title">No results found for "{query}"</p>
                <p className="empty-sub">Try searching by tenant name, user email, or invoice number.</p>
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
            {notifications.length > 0 && (
              <span className="topbar-notification-badge">{notifications.length}</span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div className="notification-header-title">
                  <h4>Notifications</h4>
                  {notifications.length > 0 && (
                    <span className="notification-count-badge">
                      {notifications.length} Total
                    </span>
                  )}
                </div>
                <div className="notification-tabs">
                  <button
                    type="button"
                    className={`notification-tab-btn ${notifTab === 'all' ? 'active' : ''}`}
                    onClick={() => setNotifTab('all')}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    className={`notification-tab-btn ${notifTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setNotifTab('invoices')}
                  >
                    Tagihan ({notifications.filter((n) => n.category === 'invoices').length})
                  </button>
                  <button
                    type="button"
                    className={`notification-tab-btn ${notifTab === 'system' ? 'active' : ''}`}
                    onClick={() => setNotifTab('system')}
                  >
                    Sistem ({notifications.filter((n) => n.category === 'system').length})
                  </button>
                </div>
              </div>

              <div className="notification-list">
                {notifLoading ? (
                  <div className="notification-empty">Memuat notifikasi...</div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="notification-item"
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate(n.path);
                      }}
                    >
                      <div className={`notification-icon ${getNotifIconClass(n.type)}`}>
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title-row">
                          <p className="notification-title">{n.title}</p>
                          <span className={`notification-badge-tag ${n.badgeClass}`}>
                            {n.badge}
                          </span>
                        </div>
                        <p className="notification-subtitle">{n.subtitle}</p>
                        <p className="notification-time">{n.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">
                    <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>Tidak ada notifikasi baru</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Semua tagihan dan sistem dalam status aman.
                    </span>
                  </div>
                )}
              </div>

              <div className="notification-footer">
                <button
                  type="button"
                  className="notification-footer-link"
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/invoice-billing');
                  }}
                >
                  Kelola Invoice &rarr;
                </button>
                <button
                  type="button"
                  className="notification-footer-link"
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/tenant-management');
                  }}
                >
                  Kelola Tenant &rarr;
                </button>
              </div>
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
                <button className="profile-menu-item profile-menu-item--reset" onClick={openResetModal}>
                  <KeyRound size={16} />
                  <span>Reset Password</span>
                </button>
                <div className="profile-menu-divider" />
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

      {/* ── Reset Password Modal ── */}
      {showResetModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isResetting && setShowResetModal(false)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">Reset Password</h2>
              {!isResetting && !resetSuccess && (
                <button className="modal-close" onClick={() => setShowResetModal(false)} type="button">
                  <X size={18} />
                </button>
              )}
            </div>

            {resetSuccess ? (
              <div className="reset-success-body">
                <CheckCircle2 size={48} className="reset-success-icon" />
                <p className="reset-success-title">Password berhasil diubah!</p>
                <p className="reset-success-sub">Sesi Anda akan berakhir. Silakan login kembali dengan password baru.</p>
              </div>
            ) : (
              <div style={{ padding: '0 0 4px' }}>
                {resetError && <div className="modal-error-alert">{resetError}</div>}

                <div className="form-group">
                  <label className="form-label">Password Saat Ini</label>
                  <div className="reset-pw-input-wrap">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Password lama"
                      value={resetForm.currentPassword}
                      onChange={(e) => setResetForm({ ...resetForm, currentPassword: e.target.value })}
                      disabled={isResetting}
                    />
                    <button type="button" className="reset-pw-eye" onClick={() => setShowCurrentPw(!showCurrentPw)} tabIndex={-1}>
                      {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password Baru</label>
                  <div className="reset-pw-input-wrap">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Min. 8 karakter"
                      value={resetForm.newPassword}
                      onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                      disabled={isResetting}
                    />
                    <button type="button" className="reset-pw-eye" onClick={() => setShowNewPw(!showNewPw)} tabIndex={-1}>
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Konfirmasi Password Baru</label>
                  <div className="reset-pw-input-wrap">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Ulangi password baru"
                      value={resetForm.confirmPassword}
                      onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                      disabled={isResetting}
                    />
                    <button type="button" className="reset-pw-eye" onClick={() => setShowConfirmPw(!showConfirmPw)} tabIndex={-1}>
                      {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '8px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowResetModal(false)} disabled={isResetting}>
                    Batal
                  </button>
                  <button className="btn btn-primary" onClick={handleResetPassword} disabled={isResetting}>
                    {isResetting ? 'Memproses...' : 'Simpan Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
