import React from 'react';
import { Header } from '../components/ui/Header';
import { Sidebar } from '../components/ui/Sidebar';
import { UserRole } from '../features/auth/schemas';

export interface StaffLayoutProps {
  children?: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  userRole?: UserRole;
  onLogout?: () => void;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({
  children,
  currentPath = '/dashboard',
  onNavigate,
  user,
  userRole = 'Admin',
  onLogout,
}) => {
  return (
    <div className="app-container">
      <Header user={user} onLogout={onLogout} />

      <div className="layout-body">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} userRole={userRole} />

        <main className="main-content">
          {children}

          <footer className="page-footer">
            <p>Odoo Enterprise Resource Planning • Connected Intelligent Workspace</p>
            <p>© {new Date().getFullYear()} Odoo Flow Inc. All rights reserved. System Operational.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
