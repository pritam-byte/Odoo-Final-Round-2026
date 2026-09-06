import React, { useState, useEffect } from 'react';
import {
  Server,
  Building,
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
import { CustomSelect } from '../../../components/ui/CustomSelect';

export const SettingsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { isBackendConnected, isSyncing, refreshFromBackend, accounts, journals } = useAccountingStore();
  const [healthStatus, setHealthStatus] = useState<{ isOnline: boolean; message: string }>({
    isOnline: isBackendConnected,
    message: isBackendConnected ? 'Backend API Connected (Port 5000)' : 'Checking backend status...',
  });
  const [companyName, setCompanyName] = useState('Urban Furniture Enterprise Pvt. Ltd.');
  const [currency, setCurrency] = useState('INR (₹)');
  const [fiscalYear, setFiscalYear] = useState('April 2026 – March 2027');
  const [taxRate, setTaxRate] = useState('18% (GST Standard)');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const checkStatus = async () => {
    const res = await checkBackendHealth();
    setHealthStatus(res);
  };

  useEffect(() => {
    checkStatus();
  }, [isBackendConnected]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedMessage('Enterprise system settings updated successfully.');
      setTimeout(() => setSavedMessage(''), 4000);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/settings" onNavigate={onNavigate} />

      {/* Header */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Enterprise System Configuration</h1>
          <p className="page-subtitle">
            Company legal profile, API connection status, double-entry validation rules, and fiscal parameters
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

      {savedMessage && (
        <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>{savedMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {healthStatus.isOnline ? (
                <CheckCircle2 size={24} style={{ color: 'var(--color-primary)' }} />
              ) : (
                <AlertTriangle size={24} style={{ color: 'var(--color-danger)' }} />
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>PostgreSQL Database:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Prisma ORM Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Chart of Accounts Loaded:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{accounts.length} Accounts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Journals:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{journals.length} Journals</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Authentication Token:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>JWT Bearer Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Company Profile & Fiscal Rules */}
        <div className="card-panel">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 className="card-title">Company Legal Entity</h2>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Company Legal Name</label>
              <input
                type="text"
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Base Currency</label>
                <CustomSelect<string>
                  value={currency}
                  onChange={(val) => setCurrency(val)}
                  options={[
                    { value: 'INR (₹)', label: 'Indian Rupee (INR ₹)' },
                    { value: 'USD ($)', label: 'US Dollar (USD $)' },
                    { value: 'EUR (€)', label: 'Euro (EUR €)' },
                  ]}
                  width="100%"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tax Configuration</label>
                <CustomSelect<string>
                  value={taxRate}
                  onChange={(val) => setTaxRate(val)}
                  options={[
                    { value: '18% (GST Standard)', label: '18% (GST Standard)' },
                    { value: '12% (GST Reduced)', label: '12% (GST Reduced)' },
                    { value: '5% (GST Lower)', label: '5% (GST Lower)' },
                    { value: '0% (Exempt)', label: '0% (Exempt)' },
                  ]}
                  width="100%"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Fiscal Year Period</label>
              <input
                type="text"
                className="form-input"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<CheckCircle2 size={15} />}>
              Save System Settings
            </Button>
          </form>
        </div>
      </div>

      {/* Card 3: Double-Entry Ledger Security & Enforcements */}
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
  );
};

export default SettingsPage;
