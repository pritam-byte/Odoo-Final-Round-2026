import React, { useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import StaffLayout from '../layouts/StaffLayout';
import PortalDashboardPage from '../features/portal/pages/PortalDashboardPage';
import PortalDocumentListPage from '../features/portal/pages/PortalDocumentListPage';
import PortalDocumentDetailPage from '../features/portal/pages/PortalDocumentDetailPage';
import PortalPaymentHistoryPage from '../features/portal/pages/PortalPaymentHistoryPage';
import CreateUserPage from '../features/auth/pages/CreateUserPage';

export const AppRouter: React.FC = () => {
  const [appMode, setAppMode] = useState<'portal' | 'staff'>('portal');
  const [portalView, setPortalView] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [staffNav, setStaffNav] = useState<string>('/contacts');

  const handlePortalNavigate = (view: string, docId?: string) => {
    setPortalView(view);
    if (docId) setSelectedDocId(docId);
  };

  if (appMode === 'staff') {
    return (
      <StaffLayout currentPath={staffNav} onNavigate={(path) => setStaffNav(path)}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setAppMode('portal')}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            &larr; Switch to User Portal View
          </button>
        </div>
        <CreateUserPage />
      </StaffLayout>
    );
  }

  return (
    <PortalLayout
      activeNav={portalView}
      onNavigate={handlePortalNavigate}
      onSwitchToAdmin={() => setAppMode('staff')}
    >
      {portalView === 'dashboard' && (
        <PortalDashboardPage onNavigate={handlePortalNavigate} />
      )}
      {portalView === 'invoices' && (
        <PortalDocumentListPage documentType="invoice" onNavigate={handlePortalNavigate} />
      )}
      {portalView === 'bills' && (
        <PortalDocumentListPage documentType="bill" onNavigate={handlePortalNavigate} />
      )}
      {portalView === 'payments' && (
        <PortalPaymentHistoryPage />
      )}
      {portalView === 'detail' && selectedDocId && (
        <PortalDocumentDetailPage
          documentId={selectedDocId}
          onBack={() => setPortalView('dashboard')}
        />
      )}
    </PortalLayout>
  );
};

export default AppRouter;
