import React, { useState } from 'react';
import { Plus, Check, ArrowLeft } from 'lucide-react';
import { useAccountingStore, AnalyticAccount } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const AnalyticAccountsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { analytics, addAnalytic } = useAccountingStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setCode(`AN-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setType('Expense');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Analytic Code and Name are required.');
      return;
    }

    addAnalytic({
      code,
      name,
      type,
    });

    setIsModalOpen(false);
  };

  const filteredAnalytics = analytics.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.code?.toLowerCase() || '').includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<AnalyticAccount>[] = [
    {
      key: 'code',
      header: 'Analytic Code',
      width: '140px',
      render: (a) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{a.code}</span>,
    },
    {
      key: 'name',
      header: 'Cost Center / Analytic Name',
      render: (a) => <span style={{ fontWeight: 600 }}>{a.name}</span>,
    },
    {
      key: 'type',
      header: 'Tracking Type',
      render: (a) => (
        <span className={`badge-pill ${a.type === 'Income' ? 'badge-completed' : 'badge-pending'}`}>
          {a.type}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/analytics" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Analytic Cost Centers & Accounts</h1>
          <p className="page-subtitle">Track project profitability, department budgets, and multi-dimensional cost centers</p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Analytic Account
        </Button>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '360px' }}
            placeholder="Search by code or cost center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredAnalytics.length}</strong> analytic accounts
          </span>
        </div>

        <DataTable columns={columns} data={filteredAnalytics} keyExtractor={(a) => a.id} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Analytic Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm Analytic Account
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

          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '14px' }}>
            <FormField
              label="Analytic Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AN-MKT"
              required
            />
            <FormField
              label="Analytic Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing & Outreach"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="an-type">
              Type (Income / Expense)
            </label>
            <select
              id="an-type"
              className="form-input select-filter"
              value={type}
              onChange={(e) => setType(e.target.value as 'Income' | 'Expense')}
            >
              <option value="Expense">Expense (Cost Center Tracking)</option>
              <option value="Income">Income (Revenue Center Tracking)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnalyticAccountsPage;
