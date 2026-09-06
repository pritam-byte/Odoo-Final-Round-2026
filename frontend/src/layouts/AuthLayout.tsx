import React from 'react';

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-wrapper">
      {/* Main Responsive Authentication Viewport */}
      <main className="auth-main">
        <div className="auth-container">
          {children}
          <footer className="auth-footer">
            <p>© {new Date().getFullYear()} Urban Furniture Inc. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;


