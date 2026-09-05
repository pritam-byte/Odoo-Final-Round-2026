import React, { useState, useEffect } from 'react';
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

// Accountant Section Pages
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ContactsPage } from '../features/contacts/pages/ContactsPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { AccountsPage } from '../features/accounts/pages/AccountsPage';
import { JournalsPage } from '../features/journals/pages/JournalsPage';
import { JournalEntriesPage } from '../features/accounting/pages/JournalEntriesPage';
import { AnalyticAccountsPage } from '../features/analytics/pages/AnalyticAccountsPage';
import { BudgetsPage } from '../features/budgets/pages/BudgetsPage';
import { SalesOrdersPage } from '../features/orders/pages/SalesOrdersPage';
import { InvoicesPage } from '../features/orders/pages/InvoicesPage';
import { PurchaseOrdersPage } from '../features/orders/pages/PurchaseOrdersPage';
import { VendorBillsPage } from '../features/orders/pages/VendorBillsPage';
import { ProfitLossReportPage } from '../features/reports/pages/ProfitLossReportPage';
import { BalanceSheetPage } from '../features/reports/pages/BalanceSheetPage';
import { BudgetReportPage } from '../features/reports/pages/BudgetReportPage';

export const AppRouter: React.FC = () => {
  // Session User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStoredUser());
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // Navigation states
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/dashboard';
  });
  const [portalView, setPortalView] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

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

  // Direct role routing
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'User') {
      setPortalView('dashboard');
    } else if (user.role === 'Admin') {
      navigate('/users');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthView('login');
  };

  const handlePortalNavigate = (view: string, docId?: string) => {
    setPortalView(view);
    if (docId) setSelectedDocId(docId);
  };

  // 1. Unauthenticated View
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

  // 2. Client Portal View for Customer Role
  if (currentUser.role === 'User') {
    return (
      <PortalLayout
        activeNav={portalView}
        onNavigate={handlePortalNavigate}
        onSwitchToAdmin={() => {
          const adminUser: UserAccount = {
            id: 'admin_temp',
            loginId: 'admin',
            name: 'Pritam Admin',
            email: 'admin@odoo-flow.com',
            role: 'Admin',
            status: 'Active',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(adminUser);
        }}
      >
        {portalView === 'dashboard' && <PortalDashboardPage onNavigate={handlePortalNavigate} />}
        {portalView === 'invoices' && <PortalDocumentListPage documentType="invoice" onNavigate={handlePortalNavigate} />}
        {portalView === 'bills' && <PortalDocumentListPage documentType="bill" onNavigate={handlePortalNavigate} />}
        {portalView === 'payments' && <PortalPaymentHistoryPage />}
        {portalView === 'detail' && selectedDocId && (
          <PortalDocumentDetailPage documentId={selectedDocId} onBack={() => setPortalView('dashboard')} />
        )}
      </PortalLayout>
    );
  }

  // 3. User Management Page for Admin Role
  if (currentPath === '/users') {
    return (
      <StaffLayout
        currentPath={currentPath}
        onNavigate={navigate}
        user={{ name: currentUser.name, email: currentUser.email, role: currentUser.role }}
        onLogout={handleLogout}
      >
        {isCreatingUser ? (
          <CreateUserPage onCancel={() => setIsCreatingUser(false)} onSuccess={() => setIsCreatingUser(false)} />
        ) : (
          <UserListPage onNavigateToCreate={() => setIsCreatingUser(true)} />
        )}
      </StaffLayout>
    );
  }

  // 4. Staff / Accountant Section Views
  const renderAccountantContent = () => {
    switch (currentPath) {
      case '/contacts':
        return <ContactsPage onNavigate={navigate} />;
      case '/products':
        return <ProductsPage onNavigate={navigate} />;
      case '/accounts':
        return <AccountsPage onNavigate={navigate} />;
      case '/journals':
        return <JournalsPage onNavigate={navigate} />;
      case '/journal-entries':
      case '/accounting':
        return <JournalEntriesPage onNavigate={navigate} />;
      case '/analytics':
        return <AnalyticAccountsPage onNavigate={navigate} />;
      case '/budgets':
        return <BudgetsPage onNavigate={navigate} />;
      case '/sales/orders':
      case '/orders':
        return <SalesOrdersPage onNavigate={navigate} />;
      case '/sales/invoices':
      case '/invoices':
        return <InvoicesPage onNavigate={navigate} />;
      case '/purchase/orders':
        return <PurchaseOrdersPage onNavigate={navigate} />;
      case '/purchase/bills':
      case '/bills':
        return <VendorBillsPage onNavigate={navigate} />;
      case '/reports/pnl':
        return <ProfitLossReportPage onNavigate={navigate} />;
      case '/reports/balance-sheet':
        return <BalanceSheetPage onNavigate={navigate} />;
      case '/reports/budget':
      case '/reports':
        return <BudgetReportPage onNavigate={navigate} />;
      case '/dashboard':
      case '/':
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <StaffLayout
      currentPath={currentPath}
      onNavigate={navigate}
      user={{ name: currentUser.name, email: currentUser.email, role: currentUser.role }}
      onLogout={handleLogout}
    >
      {/* Floating Demo Switcher */}
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
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Quick Nav:</span>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={() => {
            const portalUser: UserAccount = {
              id: 'user_temp',
              loginId: 'alice_client',
              name: 'Alice Client',
              email: 'client@portal.com',
              role: 'User',
              status: 'Active',
              createdAt: new Date().toISOString(),
            };
            setCurrentUser(portalUser);
          }}
        >
          Customer Portal ↗
        </button>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-danger)' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {renderAccountantContent()}
    </StaffLayout>
  );
};

export default AppRouter;
