import React from 'react';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';

export interface StaffLayoutProps {
  children?: React.ReactNode;
  activeNav?: string;
  onNavigate?: (id: string) => void;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children, activeNav = 'dashboard', onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, marginTop: 'var(--navbar-height)' }}>
        <Sidebar currentPath={activeNav} onNavigate={onNavigate} />
        <main style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          padding: '28px 32px',
          backgroundColor: 'var(--color-gray-bg)',
          minHeight: 'calc(100vh - var(--navbar-height))'
        }}>
          {children}

          {/* Consistent Page Footer */}
          <footer style={{
            marginTop: '48px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-gray-border)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-gray-medium)',
            lineHeight: 1.6
          }}>
            <div>Odoo Enterprise System • Internal Management Portal</div>
            <div>All rights reserved &copy; {new Date().getFullYear()}</div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
