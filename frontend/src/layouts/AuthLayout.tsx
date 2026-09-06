import React from 'react';

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-wrapper">
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

