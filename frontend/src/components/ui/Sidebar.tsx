import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  dividerAfter?: boolean;
}

export interface SidebarProps {
  currentPath?: string;
  onNavigate?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath = 'dashboard', onNavigate }) => {
  const navSections: Array<{ title?: string; items: NavItem[] }> = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', dividerAfter: true },
        { id: 'orders', label: 'Orders & Sales' },
        { id: 'documents', label: 'Invoices & Bills' },
        { id: 'payments', label: 'Payments', dividerAfter: true },
        { id: 'accounting', label: 'Accounting' },
        { id: 'budgets', label: 'Budgets' },
        { id: 'analytics', label: 'Analytics', dividerAfter: true },
        { id: 'contacts', label: 'Contacts' },
        { id: 'products', label: 'Products & Stock' },
        { id: 'reports', label: 'Reports' }
      ]
    }
  ];

  return (
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
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navSections.map((section, sIdx) => (
          <React.Fragment key={sIdx}>
            {section.items.map((item) => {
              const isActive = currentPath === item.id;
              return (
                <React.Fragment key={item.id}>
                  <button
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
                    {/* Line icon placeholder */}
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                    <span>{item.label}</span>
                  </button>
                  {item.dividerAfter && (
                    <div style={{ height: '1px', backgroundColor: 'var(--color-gray-border)', margin: '8px 4px' }} />
                  )}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
