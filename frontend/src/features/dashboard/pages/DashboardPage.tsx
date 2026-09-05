import React, { useState } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Clock,
  Plus,
  ShoppingCart,
  Truck,
  BookOpen,
  Scale,
  Users,
  Package,
  Target,
  FileSpreadsheet,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { useAccountingStore } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const DashboardPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { invoices, bills, accounts, budgets } = useAccountingStore();
  const [salesTab, setSalesTab] = useState<'All' | 'Confirmed' | 'Draft'>('All');
  const [purchaseTab, setPurchaseTab] = useState<'All' | 'Confirmed' | 'Draft'>('All');

  // Compute Metrics
  const totalReceivables = invoices
    .filter((inv) => inv.status !== 'Draft' && inv.status !== 'Cancelled')
    .reduce((s, inv) => s + inv.amountDue, 0);

  const totalPayables = bills
    .filter((b) => b.status !== 'Draft' && b.status !== 'Cancelled')
    .reduce((s, b) => s + b.amountDue, 0);

  const bankBalance = accounts.find((a) => a.type === 'Bank')?.balance || 350000;
  const cashBalance = accounts.find((a) => a.type === 'Cash')?.balance || 25000;
  const totalLiquidCash = bankBalance + cashBalance;

  // Filter Sales Panel Invoices
  const filteredSalesInvoices = invoices.filter(
    (inv) => salesTab === 'All' || inv.status === salesTab
  );

  // Filter Purchase Panel Bills
  const filteredPurchaseBills = bills.filter(
    (b) => purchaseTab === 'All' || b.status === purchaseTab
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Dashboard Top Nav: Sales | Purchase | Account | Report */}
      <AccountantNav currentRoute="/dashboard" onNavigate={onNavigate} />

      {/* Header */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Executive Accounting Command Center</h1>
          <p className="page-subtitle">
            Unified financial control: Real-time ledger, sales receivables, purchase payables, and analytical budgets
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            onClick={() => onNavigate('/reports/balance-sheet')}
            leftIcon={<Scale size={15} strokeWidth={1.75} />}
          >
            Balance Sheet
          </Button>
          <Button
            variant="primary"
            onClick={() => onNavigate('/sales/invoices')}
            leftIcon={<Plus size={16} strokeWidth={2.2} />}
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="stat-grid">
        <div className="stat-card" onClick={() => onNavigate('/sales/invoices')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge teal">
            <IndianRupee size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Outstanding Receivables (Debtors)</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/purchase/bills')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge amber">
            <Clock size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalPayables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Outstanding Payables (Creditors)</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/accounts')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge teal">
            <TrendingUp size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalLiquidCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Liquid Cash & Bank Position</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/budgets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge purple">
            <Target size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">{budgets.length} Active</div>
            <div className="stat-label">Analytical Cost Budgets</div>
          </div>
        </div>
      </div>

      {/* 2 & 3: Sales Panel and Purchase Panel side by side as required by spec */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Sales Panel: New button, counts tabs (All / Confirmed / Draft) */}
        <div className="card-panel">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 className="card-title">Sales Panel (Customer Billing)</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/sales/invoices')}
              leftIcon={<Plus size={14} />}
            >
              New
            </Button>
          </div>

          {/* Counts Tabs */}
          <div className="auth-tabs" style={{ width: '100%' }}>
            {(['All', 'Confirmed', 'Draft'] as const).map((tab) => {
              const count = invoices.filter((inv) => tab === 'All' || inv.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`auth-tab-btn ${salesTab === tab ? 'active' : ''}`}
                  onClick={() => setSalesTab(tab)}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          {/* Sales Invoices List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {filteredSalesInvoices.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No customer invoices found in {salesTab} tab.
              </div>
            ) : (
              filteredSalesInvoices.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => onNavigate('/sales/invoices')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{inv.partnerName} • {inv.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>₹{inv.total.toLocaleString()}</div>
                    <StatusBadge status={inv.status === 'Paid' ? 'paid' : inv.status === 'Confirmed' ? 'pending' : 'neutral'} label={inv.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Purchase Panel: New button, counts tabs (All / Confirmed / Draft) */}
        <div className="card-panel">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} style={{ color: 'var(--color-warning-text)' }} />
              <h2 className="card-title">Purchase Panel (Vendor Procurement)</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/purchase/bills')}
              leftIcon={<Plus size={14} />}
            >
              New
            </Button>
          </div>

          {/* Counts Tabs */}
          <div className="auth-tabs" style={{ width: '100%' }}>
            {(['All', 'Confirmed', 'Draft'] as const).map((tab) => {
              const count = bills.filter((b) => tab === 'All' || b.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`auth-tab-btn ${purchaseTab === tab ? 'active' : ''}`}
                  onClick={() => setPurchaseTab(tab)}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          {/* Purchase Bills List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {filteredPurchaseBills.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No vendor bills found in {purchaseTab} tab.
              </div>
            ) : (
              filteredPurchaseBills.map((bill) => (
                <div
                  key={bill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => onNavigate('/purchase/bills')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>{bill.billNumber}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{bill.partnerName} • {bill.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>₹{bill.total.toLocaleString()}</div>
                    <StatusBadge status={bill.status === 'Paid' ? 'paid' : bill.status === 'Confirmed' ? 'due' : 'neutral'} label={bill.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4 & 5: Account & Report Navigation Hub Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Account Hub */}
        <div className="card-panel">
          <div className="card-header">
            <h2 className="card-title">Account & Ledger Modules</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/contacts')}>
              <Users size={16} /> <span>Contacts / CRM</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/products')}>
              <Package size={16} /> <span>Products & Catalog</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/accounts')}>
              <Receipt size={16} /> <span>Chart of Accounts</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/journals')}>
              <BookOpen size={16} /> <span>Journals</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/journal-entries')}>
              <FileSpreadsheet size={16} /> <span>Journal Entries</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/budgets')}>
              <Target size={16} /> <span>Analytical Budgets</span>
            </button>
          </div>
        </div>

        {/* Report Hub */}
        <div className="card-panel">
          <div className="card-header">
            <h2 className="card-title">Audited Financial Reports</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="card-panel"
              style={{
                padding: '12px 16px',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('/reports/pnl')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Profit & Loss (P&L Statement)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Revenue vs Cost of Goods vs Overhead</div>
                </div>
              </div>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              className="card-panel"
              style={{
                padding: '12px 16px',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('/reports/balance-sheet')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Scale size={18} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Balance Sheet (Financial Position)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Assets = Liabilities + Owner Equity</div>
                </div>
              </div>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              className="card-panel"
              style={{
                padding: '12px 16px',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('/reports/budget')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Analytical Budget Variance Report</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Committed vs Actual Achieved Invoices</div>
                </div>
              </div>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
