import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Clock,
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet,
  LogOut,
  Users,
} from 'lucide-react';
import { UserAccount } from '../features/auth/schemas';
import { getStoredUser, CURRENT_USER } from '../lib/auth';

export interface PortalLayoutProps {
  children?: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
  user?: UserAccount | null;
  onLogout?: () => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  activeNav = 'dashboard',
  onNavigate,
  user,
  onLogout,
}) => {
  const [time, setTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const currentUser = user || getStoredUser() || CURRENT_USER;

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

  const pType = currentUser.partnerType || 'Both';

  const navItems = [
    {
      id: 'dashboard',
      label: 'My Dashboard',
      icon: <LayoutDashboard size={17} strokeWidth={1.75} />,
    },
    ...(pType === 'Vendor'
      ? []
      : [
          {
            id: 'invoices',
            label: 'My Invoices',
            icon: <FileText size={17} strokeWidth={1.75} />,
          },
        ]),
    ...(pType === 'Customer'
      ? []
      : [
          {
            id: 'bills',
            label: pType === 'Vendor' ? 'My Supply Bills' : 'My Bills',
            icon: <Receipt size={17} strokeWidth={1.75} />,
          },
        ]),
    {
      id: 'payments',
      label: 'Payment History',
      icon: <Wallet size={17} strokeWidth={1.75} />,
    },
  ];

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        {/* Brand Left */}
        <div className="navbar-left">
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('dashboard')}>
            <div className="brand-logo-icon">
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div>
              <span className="brand-word">Urban</span> <span className="brand-secondary">Furniture</span>
            </div>
          </div>

          {/* Static Locked Portal Badge (No switch dropdown) */}
          <div
            className="badge-pill badge-paid"
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid var(--color-primary-border)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontWeight: 600,
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            <Users size={12} />
            <span>
              {pType === 'Vendor'
                ? 'Vendor Portal'
                : pType === 'Customer'
                ? 'Customer Portal'
                : 'Partner Portal (Customer + Vendor)'}
            </span>
          </div>
        </div>

        {/* Right Section: Search, Clock, User Profile, Logout */}
        <div className="navbar-center-right">
          <div className="search-bar-wrapper">
            <div className="search-bar-icon">
              <Search size={15} strokeWidth={1.75} />
            </div>
            <input
              type="text"
              className="search-bar-input"
              placeholder={
                pType === 'Vendor'
                  ? 'Search supply bills, payments...'
                  : pType === 'Customer'
                  ? 'Search invoices, payments...'
                  : 'Search invoices, bills, payments...'
              }
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
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {pType === 'Vendor'
                  ? 'Vendor Supplier'
                  : pType === 'Customer'
                  ? 'Customer Account'
                  : 'Customer + Vendor'}
              </span>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="btn btn-ghost btn-sm"
                title="Sign Out of Portal"
                style={{
                  color: 'var(--color-danger)',
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-full)',
                  marginLeft: '4px',
                }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
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
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default PortalLayout;
