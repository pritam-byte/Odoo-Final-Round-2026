import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Clock,
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet
} from 'lucide-react';
import { CURRENT_USER } from '../lib/auth';

export interface PortalLayoutProps {
  children?: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
  onSwitchToAdmin?: () => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  activeNav = 'dashboard',
  onNavigate,
  onSwitchToAdmin,
}) => {
  const [time, setTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'dashboard',
      label: 'My Dashboard',
      icon: <LayoutDashboard size={17} strokeWidth={1.75} />,
    },
    {
      id: 'invoices',
      label: 'My Invoices',
      icon: <FileText size={17} strokeWidth={1.75} />,
    },
    {
      id: 'bills',
      label: 'My Bills',
      icon: <Receipt size={17} strokeWidth={1.75} />,
    },
    {
      id: 'payments',
      label: 'Payment History',
      icon: <Wallet size={17} strokeWidth={1.75} />,
    },
  ];

  return (
    <div className="app-container">
      {/* Fixed Top Navbar */}
      <header className="top-navbar">
        {/* Brand / Logo (Left) */}
        <div className="navbar-left">
          <a
            href="#/dashboard"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('dashboard');
            }}
          >
            <div className="brand-logo-icon">
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div>
              <span className="brand-word">Odoo</span> <span className="brand-secondary">Flow</span>
            </div>
          </a>
          <span className="badge-pill badge-paid" style={{ fontSize: '11px', padding: '2px 8px' }}>
            User Portal
          </span>
        </div>

        {/* Search Bar, Live Clock & User Profile (Right) */}
        <div className="navbar-center-right">
          <div className="search-bar-wrapper">
            <div className="search-bar-icon">
              <Search size={15} strokeWidth={1.75} />
            </div>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search invoices, bills, payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="navbar-clock" title="Current Local Time (Live)">
            <Clock size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
            <span>{time || 'Loading...'}</span>
          </div>

          {/* User Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 4px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="navbar-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
              {CURRENT_USER.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {CURRENT_USER.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Customer User</span>
            </div>
          </div>

          {onSwitchToAdmin && (
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="btn btn-outline btn-sm"
              title="Switch to Staff Admin View"
            >
              Staff View
            </button>
          )}
        </div>
      </header>

      {/* Body: Left Sidebar + Main Content */}
      <div className="layout-body">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-group">
            <span className="sidebar-group-title">My Self-Service</span>
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(item.id);
                  }}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {children}

          {/* Page Footer */}
          <footer className="page-footer">
            <p>Odoo Flow Enterprise • Partner Self-Service Settlement Portal</p>
            <p>© {new Date().getFullYear()} Odoo Flow Inc. All transactions securely recorded.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
