import React, { useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import StaffLayout from '../layouts/StaffLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import PortalDashboardPage from '../features/portal/pages/PortalDashboardPage';
import PortalDocumentListPage from '../features/portal/pages/PortalDocumentListPage';
import PortalDocumentDetailPage from '../features/portal/pages/PortalDocumentDetailPage';
import PortalPaymentHistoryPage from '../features/portal/pages/PortalPaymentHistoryPage';
import UserListPage from '../features/auth/pages/UserListPage';
import CreateUserPage from '../features/auth/pages/CreateUserPage';
import { UserAccount } from '../features/auth/schemas';
import { getStoredUser, logoutUser } from '../lib/auth';

export const AppRouter: React.FC = () => {
  // Session User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStoredUser());
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // Navigation states
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [portalView, setPortalView] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

  // When user logs in or creates account, direct them to their role-specific dashboard
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'User') {
      setPortalView('dashboard');
    } else if (user.role === 'Admin') {
      setCurrentPath('/users');
    } else {
      setCurrentPath('/dashboard');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthView('login');
  };

  // ----------------------------------------------------
  // 1. UNATHENTICATED STATE -> Show Login or Signup Form
  // ----------------------------------------------------
  if (!currentUser) {
    if (authView === 'signup') {
      return (
        <SignupPage
          onSuccess={handleAuthSuccess}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onNavigateToSignup={() => setAuthView('signup')}
      />
    );
  }

  // ----------------------------------------------------
  // 2. USER ROLE -> Customer Portal Dashboard
  // ----------------------------------------------------
  if (currentUser.role === 'User') {
    return (
      <PortalLayout
        activeNav={portalView}
        onNavigate={(navId: string) => {
          setPortalView(navId);
        }}
        onSwitchToAdmin={handleLogout}
      >
        {/* Active User session bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Logged in as:
            </span>
            <strong>{currentUser.name}</strong>
            <span className="badge-pill badge-paid">User Portal Role</span>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
            style={{ color: 'var(--color-danger-text)' }}
          >
            Sign Out / Switch Account
          </button>
        </div>

        {portalView === 'dashboard' && (
          <PortalDashboardPage
            onNavigate={(view, id) => {
              setPortalView(view);
              if (id) setSelectedDocId(id);
            }}
          />
        )}
        {portalView === 'invoices' && (
          <PortalDocumentListPage
            documentType="invoice"
            onNavigate={(view, id) => {
              setPortalView(view);
              if (id) setSelectedDocId(id);
            }}
          />
        )}
        {portalView === 'bills' && (
          <PortalDocumentListPage
            documentType="bill"
            onNavigate={(view, id) => {
              setPortalView(view);
              if (id) setSelectedDocId(id);
            }}
          />
        )}
        {portalView === 'payments' && <PortalPaymentHistoryPage />}
        {portalView === 'detail' && selectedDocId && (
          <PortalDocumentDetailPage
            documentId={selectedDocId}
            onBack={() => setPortalView('dashboard')}
          />
        )}
      </PortalLayout>
    );
  }

  // ----------------------------------------------------
  // 3. ADMIN & ACCOUNTANT ROLES -> Staff Management View
  // ----------------------------------------------------
  return (
    <StaffLayout
      currentPath={currentPath}
      onNavigate={(path) => {
        setCurrentPath(path);
        setIsCreatingUser(false);
      }}
      user={{
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      }}
      userRole={currentUser.role}
      onLogout={handleLogout}
    >
      {/* Session Top Bar */}
      <div className="card-panel" style={{ padding: '12px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Logged In:
            </span>
            <strong>{currentUser.name}</strong>
            <span
              className={`badge-pill ${
                currentUser.role === 'Admin' ? 'badge-overdue' : 'badge-pending'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
            style={{ color: 'var(--color-danger-text)' }}
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>

      {/* Route: User Management (Admin Only) */}
      {currentPath === '/users' && (
        currentUser.role === 'Admin' ? (
          isCreatingUser ? (
            <CreateUserPage
              onSuccess={() => setIsCreatingUser(false)}
              onCancel={() => setIsCreatingUser(false)}
            />
          ) : (
            <UserListPage onNavigateToCreate={() => setIsCreatingUser(true)} />
          )
        ) : (
          <div className="card-panel" style={{ textAlign: 'center', padding: '48px' }}>
            <h3 className="card-title" style={{ color: 'var(--color-danger-text)' }}>
              403 - Permission Denied
            </h3>
            <p className="card-subtitle" style={{ marginTop: '8px' }}>
              The <strong>/users</strong> management module is strictly restricted to Administrators. Your current role is <strong>{currentUser.role}</strong>.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setCurrentPath('/dashboard')}
              style={{ marginTop: '16px' }}
            >
              Back to Dashboard
            </button>
          </div>
        )
      )}

      {/* Default Dashboard & Other Modules */}
      {currentPath !== '/users' && (
        <div className="card-panel">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                {currentPath.replace('/', '').toUpperCase() || 'DASHBOARD'} MODULE
              </h2>
              <p className="card-subtitle">
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.role}).
              </p>
            </div>
            {currentUser.role === 'Admin' && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPath('/users')}
              >
                Go to User Management &rarr;
              </button>
            )}
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            {currentUser.role === 'Admin'
              ? 'As an Administrator, you have full master permissions across Sales, Purchases, Chart of Accounts, Journal Entries, Budgets, Financial Reports, and User Management.'
              : 'As an Accountant, you have operational access to Sales, Purchases, Chart of Accounts, Journal Entries, Budgets, and Financial Reports.'}
          </p>
        </div>
      )}
    </StaffLayout>
  );
};

export default AppRouter;
