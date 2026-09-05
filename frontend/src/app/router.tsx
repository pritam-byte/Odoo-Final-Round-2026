import React, { useState, useEffect } from 'react';
import { useAuth } from './providers';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignupPage } from '../features/auth/pages/SignupPage';
import { StaffLayout } from '../layouts/StaffLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Eye } from 'lucide-react';

export const AppRouter: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || (isAuthenticated ? '/dashboard' : '/login');
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPath(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  // Auth pages navigation
  if (currentPath === '/login' || (!isAuthenticated && currentPath !== '/signup')) {
    return (
      <div style={{ position: 'relative' }}>
        <LoginPage
          onSuccess={(userData) => {
            login(userData);
            navigate('/dashboard');
          }}
          onNavigateToSignup={() => navigate('/signup')}
        />
        {/* Floating Quick View Switcher for Developer / Showcase Convenience */}
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Preview:</span>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', fontWeight: currentPath === '/login' ? 700 : 500 }}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', fontWeight: currentPath === '/signup' ? 700 : 500 }}
            onClick={() => navigate('/signup')}
          >
            Signup
          </button>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}
            onClick={() => {
              login({ name: 'Pritam Admin', email: 'admin@odoo-flow.com', role: 'Administrator' });
              navigate('/dashboard');
            }}
          >
            Go to App →
          </button>
        </div>
      </div>
    );
  }

  if (currentPath === '/signup') {
    return (
      <div style={{ position: 'relative' }}>
        <SignupPage
          onSuccess={(userData) => {
            login(userData);
            navigate('/dashboard');
          }}
          onNavigateToLogin={() => navigate('/login')}
        />
        {/* Floating Quick View Switcher */}
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Preview:</span>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px' }}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}
            onClick={() => navigate('/signup')}
          >
            Signup
          </button>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}
            onClick={() => {
              login({ name: 'Pritam Admin', email: 'admin@odoo-flow.com', role: 'Administrator' });
              navigate('/dashboard');
            }}
          >
            Go to App →
          </button>
        </div>
      </div>
    );
  }

  // Authenticated App Shell with StaffLayout
  return (
    <StaffLayout
      currentPath={currentPath}
      onNavigate={navigate}
      user={user || { name: 'Pritam Admin', email: 'admin@odoo-flow.com', role: 'Administrator' }}
      onLogout={() => {
        logout();
        navigate('/login');
      }}
    >
      {/* Floating View Switcher to quickly jump back to Login/Signup */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ffffff',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
          fontSize: '12px',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Design Preview:</span>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={() => {
            navigate('/login');
          }}
        >
          View Login Page
        </button>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={() => {
            navigate('/signup');
          }}
        >
          View Signup Page
        </button>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-danger)' }}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>

      {currentPath === '/dashboard' || currentPath === '/' ? (
        <DashboardPage />
      ) : (
        /* Fallback / Other Feature Page Demo showing standard card-panel and consistency rules */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="content-header">
            <div>
              <h1 className="page-title">
                {currentPath.replace('/', '').charAt(0).toUpperCase() +
                  currentPath.replace('/', '').slice(1)}{' '}
                Module
              </h1>
              <p className="page-subtitle">
                System module adhering strictly to the unified Odoo Flow design system
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
              leftIcon={<Eye size={16} strokeWidth={2} />}
            >
              Return to Dashboard
            </Button>
          </div>

          <div className="card-panel">
            <div className="card-header">
              <h2 className="card-title">Module Workspace</h2>
              <StatusBadge status="completed" label="Synchronized" />
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              This section is styled according to the global design system tokens (8-12px rounded-corner panels,
              #f8f9fa background, dark charcoal headers, deep teal primary accents, and thin-line icons).
            </p>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default AppRouter;
