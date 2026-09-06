import React from 'react';
import { BrandLogo } from '../components/ui/BrandLogo';

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-wrapper">
      {/* Top Navbar with Brand Logo */}
      <header className="auth-header">
        <a href="#/login" className="brand-logo" style={{ textDecoration: 'none' }}>
          <BrandLogo height={42} />
        </a>
      </header>

      {/* Main Responsive Authentication Viewport */}
      <main className="auth-main">
        {children}
        <footer className="page-footer" style={{ marginTop: '24px' }}>
          <p>© {new Date().getFullYear()} Urban Furniture Inc. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;
