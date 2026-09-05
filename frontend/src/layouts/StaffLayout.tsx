import React from 'react';
import { Header } from '../components/ui/Header';
import { Sidebar } from '../components/ui/Sidebar';

export interface StaffLayoutProps {
  children?: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  onLogout?: () => void;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({
  children,
  currentPath = '/dashboard',
  onNavigate,
  user,
  onLogout,
}) => {
  return (
    <div className="app-container">
      {/* Fixed Top Navbar */}
      <Header user={user} onLogout={onLogout} />

      {/* Body: Left Sidebar + Main Content */}
      <div className="layout-body">
        {/* Fixed Left Sidebar */}
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

        {/* Main Content Area */}
        <main className="main-content">
          {children}

          {/* Page Footer (Centered, small light-gray text, two lines) */}
          <footer className="page-footer">
            <p>Odoo Enterprise Resource Planning • Connected Intelligent Workspace</p>
            <p>© 2026 Odoo Flow Inc. All rights reserved. System Operational.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
