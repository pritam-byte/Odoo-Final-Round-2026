import { ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-wrapper">
      {/* Auth Navbar */}
      <header className="auth-header">
        <a href="#/login" className="brand-logo" style={{ textDecoration: 'none' }}>
          <BrandLogo height={44} />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
            }}
          >
            <ShieldCheck size={16} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Viewport */}
      <main className="auth-main">
        {children}
      </main>

      {/* Page Footer (Centered, small light-gray text, two lines) */}
      <footer className="page-footer">
        <p>Urban Furniture Resource Planning • Connected Intelligent Workspace</p>
        <p>© 2026 Urban Furniture Inc. All rights reserved. System Operational.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
