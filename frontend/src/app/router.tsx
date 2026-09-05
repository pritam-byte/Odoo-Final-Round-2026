import React, { useState, useEffect } from 'react';
import { useAuth } from './providers';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignupPage } from '../features/auth/pages/SignupPage';
import { CreateUserPage } from '../features/auth/pages/CreateUserPage';
import { StaffLayout } from '../layouts/StaffLayout';
import { PortalLayout } from '../layouts/PortalLayout';
import { PortalDashboardPage } from '../features/portal/pages/PortalDashboardPage';
import { PortalDocumentListPage } from '../features/portal/pages/PortalDocumentListPage';
import { PortalPaymentHistoryPage } from '../features/portal/pages/PortalPaymentHistoryPage';
import { PortalDocumentDetailPage } from '../features/portal/pages/PortalDocumentDetailPage';
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
  const { user, login, logout, isAuthenticated } = useAuth();
  const [appMode, setAppMode] = useState<'staff' | 'portal'>('staff');
  const [portalView, setPortalView] = useState<'dashboard' | 'invoices' | 'bills' | 'payments' | 'detail'>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

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

  const handlePortalNavigate = (view: 'dashboard' | 'invoices' | 'bills' | 'payments' | 'detail', docId?: string) => {
    setPortalView(view);
    if (docId) setSelectedDocId(docId);
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
        {/* Floating Quick Switcher */}
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
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Demo View:</span>
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
              login({ name: 'Pritam Admin', email: 'accountant@odoo-flow.com', role: 'Chief Accountant' });
              navigate('/dashboard');
            }}
          >
            Accountant App →
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
        {/* Floating Quick Switcher */}
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
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Demo View:</span>
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
              login({ name: 'Pritam Admin', email: 'accountant@odoo-flow.com', role: 'Chief Accountant' });
              navigate('/dashboard');
            }}
          >
            Accountant App →
          </button>
        </div>
      </div>
    );
  }

  // Client Portal Mode
  if (appMode === 'portal') {
    return (
      <PortalLayout
        activeNav={portalView}
        onNavigate={handlePortalNavigate}
        onSwitchToAdmin={() => setAppMode('staff')}
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

  // Render current accountant section page
  const renderContent = () => {
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
      case '/users':
      case '/create-user':
        return <CreateUserPage />;
      case '/dashboard':
      case '/':
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  // Staff Layout
  return (
    <StaffLayout
      currentPath={currentPath}
      onNavigate={navigate}
      user={user || { name: 'Pritam Admin', email: 'accountant@odoo-flow.com', role: 'Chief Accountant' }}
      onLogout={() => {
        logout();
        navigate('/login');
      }}
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
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Switch Mode:</span>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={() => setAppMode('portal')}
        >
          Customer Portal ↗
        </button>
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
          style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-danger)' }}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>

      {renderContent()}
    </StaffLayout>
  );
};

export default AppRouter;
