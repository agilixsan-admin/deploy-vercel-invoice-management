import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth > 1024;
  });
  const location = useLocation();

  // Handle auto-close on route change only for mobile/tablet screens
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize to adjust default state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        // Desktop
      } else {
        // Tablet / Mobile default closed
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && window.innerWidth <= 1024) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Overlay — visible only when sidebar is open on mobile/tablet */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} isSidebarOpen={sidebarOpen} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
