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
      </main>
    </div>
  );
};

export default AuthLayout;
