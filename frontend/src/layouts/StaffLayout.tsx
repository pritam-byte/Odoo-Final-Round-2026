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
      {/* Deep Emerald Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} userRole={userRole} />

      {/* Main Wrapper with Top Header & Page Body */}
      <div className="main-wrapper">
        <Header user={user} onLogout={onLogout} />

        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
