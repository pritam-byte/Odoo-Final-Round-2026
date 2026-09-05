import React, { useState } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Receipt,
  FileCheck2,
  FileClock,
  CircleDollarSign,
  Clock,
  MoreHorizontal,
  Building,
  Coins,
  FileText,
} from 'lucide-react';
import { useAccountingStore, JournalType } from '../../accounting/store';
import { SlideOverDrawer } from '../../../components/ui/SlideOverDrawer';

export const JournalsPage: React.FC<{ onNavigate?: (route: string) => void }> = () => {
  const { journals, accounts, journalEntries, addJournal } = useAccountingStore();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<JournalType>('Sales');
  const [defaultAccountId, setDefaultAccountId] = useState(accounts[0]?.id || '');
  const [sequencePrefix, setSequencePrefix] = useState('INV/');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  const postedCount = journalEntries.filter((e) => e.status === 'Posted').length || 248;
  const draftCount = journalEntries.filter((e) => e.status === 'Draft').length || 12;
  const totalVolume = '₹46,70,000';

  const openCreateDrawer = () => {
    setCode('JRNL');
    setName('');
    setType('Sales');
    setDefaultAccountId(accounts[0]?.id || '');
    setSequencePrefix('JRNL/');
    setIsActive(true);
    setError('');
    setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Journal Name and Short Code are required.');
      return;
    }

    const defaultAcc = accounts.find((a) => a.id === defaultAccountId) || accounts[0];

    addJournal({
      code: code.toUpperCase(),
      name,
      type,
      defaultAccountId: defaultAcc?.id || '',
      defaultAccountName: defaultAcc?.name || 'General Account',
    });

    setIsDrawerOpen(false);
  };

  const filteredJournals = journals.filter((j) => {
    const matchesSearch =
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.code.toLowerCase().includes(search.toLowerCase()) ||
      j.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || j.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getJournalIcon = (journalType: string) => {
    switch (journalType) {
      case 'Sales':
        return <FileText size={15} color="#0284c7" />;
      case 'Purchase':
        return <Receipt size={15} color="#ea580c" />;
      case 'Bank':
        return <Building size={15} color="#16a34a" />;
      case 'Cash':
        return <Coins size={15} color="#ca8a04" />;
      default:
        return <BookOpen size={15} color="#6366f1" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Heading */}
      <div className="page-heading-row">
        <div>
          <h1 className="page-title-text">Journals</h1>
          <p className="page-subtitle-text">
            Configure posting journals for sales, purchases, bank, cash, and general entries
          </p>
        </div>

        <button type="button" className="btn-terracotta" onClick={openCreateDrawer}>
          <Plus size={16} strokeWidth={2.4} />
          <span>New Journal</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-cards-4">
        <div className="stat-metric-card">
          <div className="stat-card-header">
            <BookOpen size={15} style={{ color: 'var(--color-teal)' }} />
            <span>Total Journals</span>
          </div>
          <div className="stat-card-number">{journals.length || 5}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Configured Books</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <FileCheck2 size={15} style={{ color: '#10b981' }} />
            <span>Posted Entries</span>
          </div>
          <div className="stat-card-number">{postedCount}</div>
          <div style={{ fontSize: '11.5px', color: '#10b981' }}>Active Ledger Postings</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <FileClock size={15} style={{ color: '#f59e0b' }} />
            <span>Draft Entries</span>
          </div>
          <div className="stat-card-number">{draftCount}</div>
          <div style={{ fontSize: '11.5px', color: '#f59e0b' }}>Pending Review</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <CircleDollarSign size={15} style={{ color: '#6366f1' }} />
            <span>This Month</span>
          </div>
          <div className="stat-card-number">{totalVolume}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Total Transaction Volume</div>
        </div>
      </div>

      {/* Layout Grid: Left Table + Right Activity Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Main Table Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Filter Bar */}
          <div className="filter-bar-row">
            <div className="filter-left-group">
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-light)' }} />
                <input
                  type="text"
                  className="filter-input"
                  style={{ width: '100%', paddingLeft: '32px' }}
                  placeholder="Search journals..."
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
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchases</option>
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="General">Miscellaneous</option>
              </select>
            </div>
          </div>

          {/* Journals Table */}
          <div className="table-card">
            <table className="urban-table">
              <thead>
                <tr>
                  <th>JOURNAL NAME</th>
                  <th>TYPE</th>
                  <th>SHORT CODE</th>
                  <th>DEFAULT ACCOUNT</th>
                  <th>PREFIX</th>
                  <th style={{ textAlign: 'center' }}>STATUS</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredJournals.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getJournalIcon(j.type)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{j.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Auto-sequenced Ledger</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge-type ${
                          j.type === 'Sales'
                            ? 'badge-assets'
                            : j.type === 'Purchase'
                            ? 'badge-liability'
                            : j.type === 'Bank'
                            ? 'badge-income'
                            : 'badge-equity'
                        }`}
                      >
                        {j.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{j.code}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{j.defaultAccountName || 'General Account'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {j.code}/
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
        </div>

        {/* Right Activity Panel */}
        <div className="table-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Recent Activity</h3>
            <Clock size={15} style={{ color: 'var(--color-text-muted)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '6px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>INV/2026/0142</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Customer Invoices • Posted by Admin</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>2 hours ago • ₹1,24,000</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7', marginTop: '6px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>BILL/2026/0086</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Vendor Bills • Posted by Accountant</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>5 hours ago • ₹85,000</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', marginTop: '6px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>BNK1/2026/0034</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Bank HDFC • Reconciled</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>Yesterday • ₹42,500</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', marginTop: '6px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>MISC/2026/0008</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Depreciation Adjustments</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>2 days ago • ₹15,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer: Create Journal */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Journal"
        subtitle="Configure a new dedicated accounting posting book"
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
              Save Journal
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
              Journal Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="drawer-input"
              placeholder="e.g. Customer Invoices"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">
              Short Code <span className="required">*</span>
            </label>
            <input
              type="text"
              className="drawer-input"
              placeholder="e.g. INV"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Journal Type</label>
            <select
              className="drawer-input"
              value={type}
              onChange={(e) => setType(e.target.value as JournalType)}
            >
              <option value="Sales">Sales (Invoicing & Revenue Book)</option>
              <option value="Purchase">Purchase (Vendor Bills & Procurement Book)</option>
              <option value="Bank">Bank (Wire Transfers & Bank Statements)</option>
              <option value="Cash">Cash (Petty Cash Receipts & Disbursals)</option>
              <option value="General">Miscellaneous / General Operations</option>
            </select>
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Default General Ledger Account</label>
            <select
              className="drawer-input"
              value={defaultAccountId}
              onChange={(e) => setDefaultAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Sequence Prefix</label>
            <input
              type="text"
              className="drawer-input"
              placeholder="e.g. INV/2026/"
              value={sequencePrefix}
              onChange={(e) => setSequencePrefix(e.target.value)}
            />
          </div>

          {/* Active Status */}
          <div className="toggle-switch-wrap">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Active Status</div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Enable this journal for transaction entry and reports
              </div>
            </div>
            <div
              className={`toggle-switch ${isActive ? 'active' : ''}`}
              onClick={() => setIsActive(!isActive)}
            >
              <div className="toggle-handle" />
            </div>
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
};

export default JournalsPage;
