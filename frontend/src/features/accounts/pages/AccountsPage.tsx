import React, { useState } from 'react';
import { Plus, Search, TrendingUp, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { useAccountingStore, AccountCategory } from '../../accounting/store';
import { SlideOverDrawer } from '../../../components/ui/SlideOverDrawer';

export const AccountsPage: React.FC<{ onNavigate?: (route: string) => void }> = () => {
  const { accounts, addAccount } = useAccountingStore();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedParent, setSelectedParent] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State for Drawer
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountCategory>('Asset');
  const [parentAccount, setParentAccount] = useState('Current Assets');
  const [currency, setCurrency] = useState('INR (₹)');
  const [allowReconciliation, setAllowReconciliation] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState('');

  // Calculate Aggregates
  const totalAssets = accounts
    .filter((a) => ['Asset', 'Bank', 'Cash'].includes(a.type))
    .reduce((sum, a) => sum + (a.balance || 0), 0) || 4250000;

  const totalLiabilities = accounts
    .filter((a) => a.type === 'Liability')
    .reduce((sum, a) => sum + (a.balance || 0), 0) || 1280000;

  const totalEquity = accounts
    .filter((a) => a.type === 'Capital')
    .reduce((sum, a) => sum + (a.balance || 0), 0) || 1820000;

  const totalIncome = accounts
    .filter((a) => a.type === 'Income')
    .reduce((sum, a) => sum + (a.balance || 0), 0) || 3140000;

  const totalExpenses = accounts
    .filter((a) => a.type === 'Expense')
    .reduce((sum, a) => sum + (a.balance || 0), 0) || 1960000;

  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  const openCreateDrawer = () => {
    setCode(`${Math.floor(1000 + Math.random() * 8000)}`);
    setName('');
    setType('Asset');
    setParentAccount('Current Assets');
    setCurrency('INR (₹)');
    setAllowReconciliation(true);
    setIsActive(true);
    setDescription('');
    setBalance(0);
    setError('');
    setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Account Code and Name are required.');
      return;
    }

    addAccount({
      code,
      name,
      type,
      balance: Number(balance) || 0,
    });

    setIsDrawerOpen(false);
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.includes(search) ||
      a.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || a.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'asset':
      case 'bank':
      case 'cash':
        return 'badge-type badge-assets';
      case 'liability':
        return 'badge-type badge-liability';
      case 'capital':
      case 'equity':
        return 'badge-type badge-equity';
      case 'income':
        return 'badge-type badge-income';
      case 'expense':
        return 'badge-type badge-expense';
      default:
        return 'badge-type badge-assets';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Heading Row */}
      <div className="page-heading-row">
        <div>
          <h1 className="page-title-text">Chart of Accounts</h1>
          <p className="page-subtitle-text">
            Manage your general ledger accounts and financial structure
          </p>
        </div>

        <button type="button" className="btn-terracotta" onClick={openCreateDrawer}>
          <Plus size={16} strokeWidth={2.4} />
          <span>New Account</span>
        </button>
      </div>

      {/* 5 Stat Cards */}
      <div className="stat-cards-5">
        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
            <span>Assets</span>
          </div>
          <div className="stat-card-number">{formatINR(totalAssets)}</div>
          <div style={{ fontSize: '11.5px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> Active Assets
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
            <span>Liabilities</span>
          </div>
          <div className="stat-card-number">{formatINR(totalLiabilities)}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Payables & Obligations</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
            <span>Equity</span>
          </div>
          <div className="stat-card-number">{formatINR(totalEquity)}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Retained Capital</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <span>Income</span>
          </div>
          <div className="stat-card-number">{formatINR(totalIncome)}</div>
          <div style={{ fontSize: '11.5px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> Revenue Stream
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
            <span>Expenses</span>
          </div>
          <div className="stat-card-number">{formatINR(totalExpenses)}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Operational Outflow</div>
        </div>
      </div>

      {/* Filter Bar Row */}
      <div className="filter-bar-row">
        <div className="filter-left-group">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-light)' }} />
            <input
              type="text"
              className="filter-input"
              style={{ width: '100%', paddingLeft: '32px' }}
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Asset">Assets</option>
            <option value="Liability">Liabilities</option>
            <option value="Capital">Equity</option>
            <option value="Income">Income</option>
            <option value="Expense">Expenses</option>
          </select>

          <select
            className="filter-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="filter-input"
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
          >
            <option value="all">All Parent Accounts</option>
            <option value="current_assets">Current Assets</option>
            <option value="fixed_assets">Fixed Assets</option>
            <option value="current_liabilities">Current Liabilities</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredAccounts.length}</strong> accounts
          </span>
        </div>
      </div>

      {/* Accounts Table Card */}
      <div className="table-card">
        <table className="urban-table">
          <thead>
            <tr>
              <th style={{ width: '90px' }}>CODE</th>
              <th>ACCOUNT NAME</th>
              <th>TYPE</th>
              <th>PARENT ACCOUNT</th>
              <th>RECONCILIATION</th>
              <th style={{ textAlign: 'right' }}>BALANCE</th>
              <th style={{ textAlign: 'center', width: '90px' }}>STATUS</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
              <tr key={acc.id}>
                <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{acc.code}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{acc.name}</td>
                <td>
                  <span className={getBadgeClass(acc.type)}>{acc.type}</span>
                </td>
                <td style={{ color: 'var(--color-text-muted)' }}>
                  {acc.type === 'Asset' ? 'Current Assets' : acc.type === 'Liability' ? 'Current Liabilities' : 'Operating'}
                </td>
                <td>
                  <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                    <ShieldCheck size={14} /> Allowed
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: acc.balance >= 0 ? 'var(--color-text-primary)' : '#dc2626' }}>
                  {formatINR(acc.balance || 0)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge-type badge-active-status">Active</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer' }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-Over Drawer: Create Account */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Account"
        subtitle="Add a new general ledger account to your financial structure"
        footer={
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              type="button"
              className="filter-input"
              style={{ flex: 1, cursor: 'pointer', textAlign: 'center' }}
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-terracotta"
              style={{ flex: 1.5 }}
              onClick={handleSave}
            >
              Save Account
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px' }}>
              {error}
            </div>
          )}

          <div className="drawer-form-group">
            <label className="drawer-form-label">
              Account Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="drawer-input"
              placeholder="e.g. Accounts Receivable"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">
              Code <span className="required">*</span>
            </label>
            <input
              type="text"
              className="drawer-input"
              placeholder="e.g. 1010"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Account Type</label>
            <select
              className="drawer-input"
              value={type}
              onChange={(e) => setType(e.target.value as AccountCategory)}
            >
              <option value="Asset">Current Assets</option>
              <option value="Asset">Fixed Assets</option>
              <option value="Liability">Current Liabilities</option>
              <option value="Liability">Non-Current Liabilities</option>
              <option value="Capital">Equity</option>
              <option value="Income">Income / Revenue</option>
              <option value="Expense">Expenses</option>
              <option value="Bank">Bank Account</option>
              <option value="Cash">Cash Drawer</option>
            </select>
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Parent Account</label>
            <select
              className="drawer-input"
              value={parentAccount}
              onChange={(e) => setParentAccount(e.target.value)}
            >
              <option value="Current Assets">1000 - Current Assets</option>
              <option value="Fixed Assets">1500 - Fixed Assets</option>
              <option value="Current Liabilities">2000 - Current Liabilities</option>
              <option value="Operating Revenue">4000 - Operating Revenue</option>
            </select>
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Currency</label>
            <select
              className="drawer-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR (₹)">INR - Indian Rupee (₹)</option>
              <option value="USD ($)">USD - US Dollar ($)</option>
              <option value="EUR (€)">EUR - Euro (€)</option>
            </select>
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Opening Balance (₹)</label>
            <input
              type="number"
              step="0.01"
              className="drawer-input"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
            />
          </div>

          {/* Toggle Switches */}
          <div className="toggle-switch-wrap">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Allow Reconciliation</div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Enable matching invoices and payments against this account
              </div>
            </div>
            <div
              className={`toggle-switch ${allowReconciliation ? 'active' : ''}`}
              onClick={() => setAllowReconciliation(!allowReconciliation)}
            >
              <div className="toggle-handle" />
            </div>
          </div>

          <div className="toggle-switch-wrap">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Active Status</div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Account is currently active and can accept transactions
              </div>
            </div>
            <div
              className={`toggle-switch ${isActive ? 'active' : ''}`}
              onClick={() => setIsActive(!isActive)}
            >
              <div className="toggle-handle" />
            </div>
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Notes & Description</label>
            <textarea
              className="drawer-input"
              rows={2}
              placeholder="Add optional notes for this account..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
};

export default AccountsPage;
