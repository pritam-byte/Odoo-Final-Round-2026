import React, { useState, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when navigating routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  return (
    <div className="app-container">
      <Header
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="layout-body">
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          userRole={userRole}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="main-content">
          {children}

          <footer className="page-footer">
            <p>© {new Date().getFullYear()} Urban Furniture Inc. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
