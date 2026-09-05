import React, { useState, useEffect } from 'react';
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
  onSwitchToAdmin
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const portalNavItems = [
    { id: 'dashboard', label: 'My Dashboard' },
    { id: 'invoices', label: 'My Invoices' },
    { id: 'bills', label: 'My Bills' },
    { id: 'payments', label: 'Payment History' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Fixed Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000
      }}>
        {/* Brand Logo & Portal Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-purple)' }}>Odoo</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>ERP</span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--pill-radius)',
            backgroundColor: 'var(--color-primary-teal-light)',
            color: 'var(--color-primary-teal-text)'
          }}>
            User Portal
          </span>
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)', fontWeight: 500 }}>
            {time}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px',
            backgroundColor: 'var(--color-gray-bg)',
            borderRadius: 'var(--pill-radius)',
            border: '1px solid var(--color-gray-border)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-purple)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}>
              {CURRENT_USER.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-charcoal-dark)' }}>{CURRENT_USER.name}</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-gray-medium)' }}>User Role</span>
            </div>
          </div>

          {onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 10px' }}
              title="Switch to Admin / Staff view"
            >
              Staff View
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1, marginTop: 'var(--navbar-height)' }}>
        {/* Scoped Sidebar */}
        <aside style={{
          position: 'fixed',
          top: 'var(--navbar-height)',
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--color-white)',
          borderRight: '1px solid var(--color-gray-border)',
          padding: '16px 12px',
          overflowY: 'auto',
          zIndex: 900
        }}>
          <div style={{ padding: '0 8px 12px 8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            My Self-Service
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {portalNavItems.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--color-gray-bg)' : 'transparent',
                    color: isActive ? 'var(--color-charcoal-dark)' : 'var(--color-gray-dark)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Shell */}
        <main style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          padding: '28px 32px',
          backgroundColor: 'var(--color-gray-bg)',
          minHeight: 'calc(100vh - var(--navbar-height))'
        }}>
          {children}

          {/* Consistent Footer */}
          <footer style={{
            marginTop: '48px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-gray-border)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-gray-medium)',
            lineHeight: 1.6
          }}>
            <div>Odoo Client Portal • Partner Self-Service Settlement System</div>
            <div>All transactions securely recorded &copy; {new Date().getFullYear()}</div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
