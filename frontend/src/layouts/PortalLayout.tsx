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
  ChevronDown,
  Check,
} from 'lucide-react';
import { UserAccount } from '../features/auth/schemas';
import { getStoredUser, setStoredUser, CURRENT_USER } from '../lib/auth';

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
  const [showPersonaMenu, setShowPersonaMenu] = useState<boolean>(false);
  const [currentUser, setCurrentUserState] = useState<UserAccount>(
    () => user || getStoredUser() || CURRENT_USER
  );

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

  const handleSwitchPersona = (newType: 'Customer' | 'Vendor' | 'Both') => {
    const updatedUser: UserAccount = {
      ...currentUser,
      partnerType: newType,
      name:
        newType === 'Customer'
          ? 'John Doe (Customer)'
          : newType === 'Vendor'
          ? 'Urban Timbers Ltd (Vendor)'
          : 'John Doe (Customer + Vendor)',
    };
    setCurrentUserState(updatedUser);
    setStoredUser(updatedUser);
    setShowPersonaMenu(false);
    // Reset to dashboard to avoid view mismatch
    onNavigate?.('dashboard');
  };

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

          {/* Persona Badge Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowPersonaMenu((prev) => !prev)}
              className="badge-pill badge-paid"
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: '1px solid var(--color-primary-border)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
              title="Click to switch portal view mode"
            >
              <Users size={12} />
              <span>
                {pType === 'Vendor'
                  ? 'Vendor Portal'
                  : pType === 'Customer'
                  ? 'Customer Portal'
                  : 'Partner Portal (Customer + Vendor)'}
              </span>
              <ChevronDown size={12} />
            </button>

            {showPersonaMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 2000,
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-dropdown)',
                  padding: '6px',
                  width: '240px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    padding: '4px 8px 6px',
                    letterSpacing: '0.04em',
                  }}
                >
                  Switch Portal View
                </div>

                <div
                  onClick={() => handleSwitchPersona('Customer')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: pType === 'Customer' ? 'var(--color-primary-light)' : 'transparent',
                    color: pType === 'Customer' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: pType === 'Customer' ? 600 : 400,
                  }}
                >
                  <div>
                    <div>Customer Portal</div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      Invoices & Furniture Purchases
                    </span>
                  </div>
                  {pType === 'Customer' && <Check size={14} />}
                </div>

                <div
                  onClick={() => handleSwitchPersona('Vendor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: pType === 'Vendor' ? 'var(--color-primary-light)' : 'transparent',
                    color: pType === 'Vendor' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: pType === 'Vendor' ? 600 : 400,
                  }}
                >
                  <div>
                    <div>Vendor Portal</div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      Supply Bills & Timber Lots
                    </span>
                  </div>
                  {pType === 'Vendor' && <Check size={14} />}
                </div>

                <div
                  onClick={() => handleSwitchPersona('Both')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: pType === 'Both' ? 'var(--color-primary-light)' : 'transparent',
                    color: pType === 'Both' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: pType === 'Both' ? 600 : 400,
                  }}
                >
                  <div>
                    <div>Customer + Vendor (Dual)</div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      Full Combined Access
                    </span>
                  </div>
                  {pType === 'Both' && <Check size={14} />}
                </div>
              </div>
            )}
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
