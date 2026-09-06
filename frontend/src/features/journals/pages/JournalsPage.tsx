import React, { useState } from 'react';
import { Plus, Check, ArrowLeft } from 'lucide-react';
import { useAccountingStore, Journal, JournalType } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Many2OneSelect } from '../../../components/ui/Many2OneSelect';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export const JournalsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { journals, accounts, addJournal } = useAccountingStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<JournalType>('Sales');
  const [defaultAccountId, setDefaultAccountId] = useState(accounts[0]?.id || '');
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setCode('JRNL');
    setName('');
    setType('Sales');
    setDefaultAccountId(accounts[0]?.id || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Journal Name and Code are required.');
      return;
    }

    const defaultAcc = accounts.find((a) => a.id === defaultAccountId) || accounts[0];

    addJournal({
      code,
      name,
      type,
      defaultAccountId: defaultAcc.id,
      defaultAccountName: defaultAcc.name,
    });

    setIsModalOpen(false);
  };

  const filteredJournals = journals.filter(
    (j) =>
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.code.toLowerCase().includes(search.toLowerCase()) ||
      j.type.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Journal>[] = [
    {
      key: 'code',
      header: 'Short Code',
      width: '120px',
      render: (j) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{j.code}</span>,
    },
    {
      key: 'name',
      header: 'Journal Name',
      render: (j) => <span style={{ fontWeight: 600 }}>{j.name}</span>,
    },
    {
      key: 'type',
      header: 'Journal Type',
      render: (j) => (
        <span
          className={`badge-pill ${
            j.type === 'Sales'
              ? 'badge-completed'
              : j.type === 'Purchase'
              ? 'badge-pending'
              : j.type === 'Bank'
              ? 'badge-active'
              : 'badge-neutral'
          }`}
        >
          {j.type}
        </span>
      ),
    },
    {
      key: 'defaultAccountName',
      header: 'Default General Ledger Account',
      render: (j) => <span style={{ color: 'var(--color-text-secondary)' }}>{j.defaultAccountName}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/journals" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Accounting Journals</h1>
          <p className="page-subtitle">Configure dedicated posting books for sales, purchases, bank, and cash ledgers</p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Journal
        </Button>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '360px' }}
            placeholder="Search by journal name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Total journals: <strong>{filteredJournals.length}</strong>
          </span>
        </div>

        <DataTable columns={columns} data={filteredJournals} keyExtractor={(j) => j.id} />
      </div>

      {/* Journal Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Accounting Journal"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm Journal
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
              label="Journal Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. INV"
              required
            />
            <FormField
              label="Journal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Invoices"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="journal-type">
              Journal Type
            </label>
            <CustomSelect<JournalType>
              value={type}
              onChange={(newVal) => setType(newVal)}
              options={[
                { value: 'Sales', label: 'Sales (Invoicing & Revenue Book)' },
                { value: 'Purchase', label: 'Purchase (Vendor Bills & Procurement Book)' },
                { value: 'Bank', label: 'Bank (Wire Transfers & Bank Statements)' },
                { value: 'Cash', label: 'Cash (Petty Cash Receipts & Disbursals)' },
              ]}
              width="100%"
            />
          </div>

          <Many2OneSelect
            label="Default Ledger Account (many2one → Chart of Accounts)"
            options={accounts.map((a) => ({ id: a.id, name: `${a.code} - ${a.name}`, subtitle: a.type }))}
            value={defaultAccountId}
            onChange={(id) => setDefaultAccountId(id)}
            placeholder="Select default ledger account..."
            createEntityName="Account"
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default JournalsPage;
