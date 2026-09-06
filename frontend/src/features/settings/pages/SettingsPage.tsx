import React, { useState, useEffect } from 'react';
import {
  Server,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Database,
} from 'lucide-react';
import { useAccountingStore } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { checkBackendHealth } from '../../../lib/apiClient';

export const SettingsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { isBackendConnected, isSyncing, refreshFromBackend, accounts, journals } = useAccountingStore();
  const [healthStatus, setHealthStatus] = useState<{ isOnline: boolean; message: string }>({
    isOnline: isBackendConnected,
    message: isBackendConnected ? 'Backend API Connected (Port 5000)' : 'Checking backend status...',
  });

  const checkStatus = async () => {
    const res = await checkBackendHealth();
    setHealthStatus(res);
  };

  useEffect(() => {
    checkStatus();
  }, [isBackendConnected]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/settings" onNavigate={onNavigate} />

      {/* Header */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Enterprise System Configuration</h1>
          <p className="page-subtitle">
            API connection status, double-entry validation rules, and ledger parameters
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            onClick={async () => {
              await checkStatus();
              await refreshFromBackend();
            }}
            isLoading={isSyncing}
            leftIcon={<RefreshCw size={15} className={isSyncing ? 'spin' : ''} />}
          >
            Sync with Backend
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Card 1: Backend API Health & Live Connection */}
        <div className="card-panel">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 className="card-title">Backend API Health & Gateway</h2>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: healthStatus.isOnline ? 'var(--color-primary-light)' : 'var(--color-danger-bg)',
              border: `1px solid ${healthStatus.isOnline ? 'var(--color-primary-border)' : 'var(--color-danger)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {healthStatus.isOnline ? (
                <CheckCircle2 size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={24} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: healthStatus.isOnline ? 'var(--color-primary)' : 'var(--color-danger-text)' }}>
                  {healthStatus.isOnline ? 'Live Express API Online' : 'Offline / Mock Storage Active'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Endpoint: <code>http://localhost:5000/api</code>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={checkStatus}>
              Recheck
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '14px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>PostgreSQL Database:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Prisma Connected</span>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Chart of Accounts:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{accounts.length} Accounts</span>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Active Journals:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{journals.length} Journals</span>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Authentication:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>JWT Bearer Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Double-Entry Ledger Security & Enforcements */}
        <div className="card-panel">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 className="card-title">Double-Entry Accounting Hard Invariants</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                <FileCheck2 size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Debit = Credit Balance Constraint</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Strict blocking validation: Journal entries cannot be posted unless sum of debits equals sum of credits with zero discrepancy.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                <Database size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Automated Invoice & Bill Posting</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                On confirming Sales Invoices or Vendor Bills, the backend AccountingEngine generates and posts corresponding journal lines.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Analytical Budget Variance Tracking</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Real-time calculation of achieved revenue/expense against committed amounts with non-blocking budget warnings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
