import React, { useState } from 'react';
import { Plus, Check, ArrowLeft, Search } from 'lucide-react';
import { useAccountingStore, Account, AccountCategory } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { CustomSelect } from '../../../components/ui/CustomSelect';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '320px', maxWidth: '640px' }}>
            <div className="search-bar-wrapper" style={{ flex: 1, position: 'relative' }}>
              <div className="search-bar-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)', pointerEvents: 'none' }}>
                <Search size={15} strokeWidth={1.75} />
              </div>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%', height: '38px', borderRadius: 'var(--radius-sm)' }}
                placeholder="Search by code, account name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <CustomSelect
              value={selectedType}
              onChange={(v) => setSelectedType(v)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'Asset', label: 'Assets' },
                { value: 'Liability', label: 'Liabilities' },
                { value: 'Bank', label: 'Bank' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Capital', label: 'Capital / Equity' },
                { value: 'Income', label: 'Income' },
                { value: 'Expense', label: 'Expense' },
              ]}
              width={180}
            />
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

          <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px' }}>
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
            <CustomSelect<AccountCategory>
              value={type}
              onChange={(v) => setType(v)}
              options={[
                { value: 'Asset', label: 'Asset (Receivables, Current Assets, Equipment)' },
                { value: 'Liability', label: 'Liability (Payables, Loans, Provisions)' },
                { value: 'Bank', label: 'Bank (Checking / Savings Operating Accounts)' },
                { value: 'Capital', label: 'Capital (Shareholder Equity / Capital Fund)' },
                { value: 'Cash', label: 'Cash (Petty Cash Drawer / Vault)' },
                { value: 'Income', label: 'Income (Operating Sales & Revenue)' },
                { value: 'Expense', label: 'Expense (Direct Cost & Operational Expenses)' },
              ]}
              width="100%"
            />
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
