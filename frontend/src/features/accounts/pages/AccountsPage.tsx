import React, { useState } from 'react';
import { Plus, Check, ArrowLeft } from 'lucide-react';
import { useAccountingStore, Account, AccountCategory } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const AccountsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { accounts, addAccount } = useAccountingStore();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountCategory>('Asset');
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setCode(`${Math.floor(1000 + Math.random() * 8000)}`);
    setName('');
    setType('Asset');
    setBalance(0);
    setError('');
    setIsModalOpen(true);
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

    setIsModalOpen(false);
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.includes(search) ||
      a.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || a.type === selectedType;
    return matchesSearch && matchesType;
  });

  const columns: Column<Account>[] = [
    {
      key: 'code',
      header: 'Code',
      width: '100px',
      render: (a) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{a.code}</span>,
    },
    {
      key: 'name',
      header: 'Account Name',
      render: (a) => <span style={{ fontWeight: 600 }}>{a.name}</span>,
    },
    {
      key: 'type',
      header: 'Account Category / Type',
      render: (a) => (
        <span
          className={`badge-pill ${
            ['Asset', 'Bank', 'Cash'].includes(a.type)
              ? 'badge-completed'
              : ['Liability', 'Capital'].includes(a.type)
              ? 'badge-pending'
              : a.type === 'Income'
              ? 'badge-completed'
              : 'badge-overdue'
          }`}
        >
          {a.type}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Current Balance (₹)',
      align: 'right',
      render: (a) => (
        <span style={{ fontWeight: 600, color: a.balance >= 0 ? 'var(--color-text-primary)' : 'var(--color-danger)' }}>₹{a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/accounts" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Chart of Accounts</h1>
          <p className="page-subtitle">
            Pre-seeded double-entry accounting general ledger accounts (Assets, Liabilities, Incomes, Expenses)
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Account
        </Button>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '500px' }}>
            <input
              type="text"
              className="form-input search-bar-input"
              style={{ flex: 1 }}
              placeholder="Search by code, account name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="form-input select-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Asset">Assets</option>
              <option value="Liability">Liabilities</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
              <option value="Capital">Capital / Equity</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Total accounts: <strong>{filteredAccounts.length}</strong>
          </span>
        </div>

        <DataTable columns={columns} data={filteredAccounts} keyExtractor={(a) => a.id} />
      </div>

      {/* Account Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add General Ledger Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px' }}>
            <FormField
              label="Account Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 1050"
              required
            />
            <FormField
              label="Account Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Accounts Receivable"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="acc-category">
              Account Category / Classification Type
            </label>
            <select
              id="acc-category"
              className="form-input select-filter"
              value={type}
              onChange={(e) => setType(e.target.value as AccountCategory)}
            >
              <option value="Asset">Asset (Receivables, Current Assets, Equipment)</option>
              <option value="Liability">Liability (Payables, Loans, Provisions)</option>
              <option value="Bank">Bank (Checking / Savings Operating Accounts)</option>
              <option value="Capital">Capital (Shareholder Equity / Capital Fund)</option>
              <option value="Cash">Cash (Petty Cash Drawer / Vault)</option>
              <option value="Income">Income (Operating Sales & Revenue)</option>
              <option value="Expense">Expense (Direct Cost & Operational Expenses)</option>
            </select>
          </div>

          <FormField
            label="Initial Opening Balance (₹)"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            placeholder="0.00"
          />
        </form>
      </Modal>
    </div>
  );
};

export default AccountsPage;
