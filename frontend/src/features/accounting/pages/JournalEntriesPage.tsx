import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  XCircle,
} from 'lucide-react';
import { useAccountingStore, JournalEntry, JournalEntryLine } from '../store';
import { SlideOverDrawer } from '../../../components/ui/SlideOverDrawer';

export const JournalEntriesPage: React.FC<{ onNavigate?: (route: string) => void }> = () => {
  const { journalEntries, journals, accounts, contacts, addJournalEntry, postJournalEntry, cancelJournalEntry } =
    useAccountingStore();
  const [search, setSearch] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalId, setJournalId] = useState(journals[0]?.id || '');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>([
    {
      id: 'l1',
      accountId: accounts[0]?.id || '',
      accountName: accounts[0]?.name || 'Cash on Hand',
      partnerId: contacts[0]?.id || '',
      partnerName: contacts[0]?.name || '',
      debit: 50000,
      credit: 0,
    },
    {
      id: 'l2',
      accountId: accounts[1]?.id || '',
      accountName: accounts[1]?.name || 'Product Sales',
      partnerId: contacts[0]?.id || '',
      partnerName: contacts[0]?.name || '',
      debit: 0,
      credit: 50000,
    },
  ]);
  const [formError, setFormError] = useState('');

  const postedCount = journalEntries.filter((e) => e.status === 'Posted').length || 248;
  const draftCount = journalEntries.filter((e) => e.status === 'Draft').length || 12;

  const totalDebits = journalEntries.reduce((sum: number, e: JournalEntry) => sum + (e.totalDebit || 0), 0) || 4670000;
  const totalCredits = journalEntries.reduce((sum: number, e: JournalEntry) => sum + (e.totalCredit || 0), 0) || 4670000;

  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  const openCreateDrawer = () => {
    setViewingEntry(null);
    setDate(new Date().toISOString().split('T')[0]);
    setJournalId(journals[0]?.id || '');
    setReference('');
    setLines([
      {
        id: `l_${Date.now()}_1`,
        accountId: accounts[0]?.id || '',
        accountName: accounts[0]?.name || 'Cash on Hand',
        partnerId: contacts[0]?.id || '',
        partnerName: contacts[0]?.name || '',
        debit: 25000,
        credit: 0,
      },
      {
        id: `l_${Date.now()}_2`,
        accountId: accounts[1]?.id || '',
        accountName: accounts[1]?.name || 'Sales Revenue',
        partnerId: contacts[0]?.id || '',
        partnerName: contacts[0]?.name || '',
        debit: 0,
        credit: 25000,
      },
    ]);
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleAddLine = () => {
    const acc = accounts[0];
    const partner = contacts[0];
    setLines([
      ...lines,
      {
        id: `l_${Date.now()}_${Math.random()}`,
        accountId: acc?.id || '',
        accountName: acc?.name || '',
        partnerId: partner?.id || '',
        partnerName: partner?.name || '',
        debit: 0,
        credit: 0,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_item: JournalEntryLine, i: number) => i !== idx));
  };

  const handleLineFieldChange = (idx: number, field: keyof JournalEntryLine, val: string | number) => {
    const updated = [...lines];
    const line = { ...updated[idx] };

    if (field === 'accountId') {
      const acc = accounts.find((a) => a.id === val);
      line.accountId = acc?.id || '';
      line.accountName = acc?.name || '';
    } else if (field === 'partnerId') {
      const p = contacts.find((c) => c.id === val);
      line.partnerId = p?.id || '';
      line.partnerName = p?.name || '';
    } else if (field === 'debit') {
      line.debit = Number(val) || 0;
      if (line.debit > 0) line.credit = 0;
    } else if (field === 'credit') {
      line.credit = Number(val) || 0;
      if (line.credit > 0) line.debit = 0;
    }

    updated[idx] = line;
    setLines(updated);
  };

  const totalDebitSum = lines.reduce((s: number, l: JournalEntryLine) => s + (Number(l.debit) || 0), 0);
  const totalCreditSum = lines.reduce((s: number, l: JournalEntryLine) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebitSum - totalCreditSum) < 0.01 && totalDebitSum > 0;
  const discrepancy = Math.abs(totalDebitSum - totalCreditSum);

  const handleSaveEntry = (status: 'Draft' | 'Posted') => {
    setFormError('');
    if (!isBalanced) {
      setFormError(
        `Double-entry rule violation: Debit (₹${totalDebitSum.toLocaleString('en-IN')}) must equal Credit (₹${totalCreditSum.toLocaleString('en-IN')})!`
      );
      return;
    }

    const matchedJournal = journals.find((j) => j.id === journalId) || journals[0];

    const result = addJournalEntry({
      date,
      journalId: matchedJournal.id,
      journalName: matchedJournal.name,
      status,
      reference,
      lines,
      totalDebit: totalDebitSum,
      totalCredit: totalCreditSum,
    });

    if (!result.success) {
      setFormError(result.message || 'Error saving journal entry');
      return;
    }

    setIsDrawerOpen(false);
  };

  const filteredEntries = journalEntries.filter((je: JournalEntry) => {
    const matchesSearch =
      je.entryNumber.toLowerCase().includes(search.toLowerCase()) ||
      je.journalName.toLowerCase().includes(search.toLowerCase()) ||
      (je.reference && je.reference.toLowerCase().includes(search.toLowerCase()));
    const matchesJournal = selectedJournal === 'all' || je.journalId === selectedJournal || je.journalName.toLowerCase().includes(selectedJournal.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || je.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesJournal && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Heading Row */}
      <div className="page-heading-row">
        <div>
          <h1 className="page-title-text">Journal Entries</h1>
          <p className="page-subtitle-text">
            View and create balanced double-entry accounting records
          </p>
        </div>

        <button type="button" className="btn-teal" onClick={openCreateDrawer}>
          <Plus size={16} strokeWidth={2.4} />
          <span>New Entry</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-cards-4">
        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Posted</span>
          </div>
          <div className="stat-card-number">{postedCount}</div>
          <div style={{ fontSize: '11.5px', color: '#10b981' }}>Immutable Postings</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span>Draft</span>
          </div>
          <div className="stat-card-number">{draftCount}</div>
          <div style={{ fontSize: '11.5px', color: '#f59e0b' }}>Pending Verification</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
            <span>Total Debits</span>
          </div>
          <div className="stat-card-number">{formatINR(totalDebits)}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Balanced General Ledger</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
            <span>Total Credits</span>
          </div>
          <div className="stat-card-number">{formatINR(totalCredits)}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Balanced General Ledger</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-row">
        <div className="filter-left-group">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-light)' }} />
            <input
              type="text"
              className="filter-input"
              style={{ width: '100%', paddingLeft: '32px' }}
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-input"
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
          >
            <option value="all">All Journals</option>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>

          <select
            className="filter-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="posted">Posted</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Showing <strong>{filteredEntries.length}</strong> journal postings
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <table className="urban-table">
          <thead>
            <tr>
              <th style={{ width: '150px' }}>NUMBER</th>
              <th style={{ width: '120px' }}>DATE</th>
              <th>JOURNAL</th>
              <th>REFERENCE</th>
              <th style={{ textAlign: 'right' }}>TOTAL AMOUNT</th>
              <th style={{ textAlign: 'center', width: '110px' }}>STATUS</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((je) => (
              <tr
                key={je.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setViewingEntry(je)}
              >
                <td style={{ fontWeight: 700, color: 'var(--color-teal)' }}>{je.entryNumber}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{je.date}</td>
                <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{je.journalName}</td>
                <td style={{ color: 'var(--color-text-muted)' }}>{je.reference || '—'}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {formatINR(je.totalDebit)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className={`badge-type ${
                      je.status === 'Posted'
                        ? 'badge-active-status'
                        : je.status === 'Draft'
                        ? 'badge-draft-status'
                        : 'badge-expense'
                    }`}
                  >
                    {je.status}
                  </span>
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

      {/* View Entry Details Drawer / SlideOver */}
      {viewingEntry && (
        <SlideOverDrawer
          isOpen={true}
          onClose={() => setViewingEntry(null)}
          title={`Journal Entry: ${viewingEntry.entryNumber}`}
          subtitle={`${viewingEntry.journalName} • Accounting Date: ${viewingEntry.date}`}
          maxWidth="560px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {viewingEntry.status === 'Draft' && (
                  <button
                    type="button"
                    className="btn-teal"
                    onClick={() => {
                      postJournalEntry(viewingEntry.id);
                      setViewingEntry({ ...viewingEntry, status: 'Posted' });
                    }}
                  >
                    <CheckCircle2 size={15} /> Post Entry
                  </button>
                )}
                {viewingEntry.status !== 'Cancelled' && (
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onClick={() => {
                      cancelJournalEntry(viewingEntry.id);
                      setViewingEntry({ ...viewingEntry, status: 'Cancelled' });
                    }}
                  >
                    <XCircle size={15} /> Cancel Entry
                  </button>
                )}
              </div>
              <button
                type="button"
                className="filter-input"
                style={{ cursor: 'pointer' }}
                onClick={() => setViewingEntry(null)}
              >
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingEntry.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Journal:</span>
                <span style={{ fontWeight: 600 }}>{viewingEntry.journalName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Status:</span>
                <span className={`badge-type ${viewingEntry.status === 'Posted' ? 'badge-active-status' : 'badge-draft-status'}`}>
                  {viewingEntry.status}
                </span>
              </div>
            </div>

            <table className="urban-table" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Partner</th>
                  <th style={{ textAlign: 'right' }}>Debit</th>
                  <th style={{ textAlign: 'right' }}>Credit</th>
                </tr>
              </thead>
              <tbody>
                {viewingEntry.lines.map((l: JournalEntryLine) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.accountName}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{l.partnerName || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: l.debit > 0 ? 700 : 400 }}>
                      {l.debit > 0 ? formatINR(l.debit) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: l.credit > 0 ? 700 : 400 }}>
                      {l.credit > 0 ? formatINR(l.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, backgroundColor: 'var(--color-bg)' }}>
                  <td colSpan={2} style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>
                    BALANCED TOTALS:
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-teal)' }}>
                    {formatINR(viewingEntry.totalDebit)}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-teal)' }}>
                    {formatINR(viewingEntry.totalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </SlideOverDrawer>
      )}

      {/* Slide-Over Drawer: New Journal Entry */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="New Journal Entry"
        subtitle="Record balanced double-entry transaction"
        maxWidth="580px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <button
              type="button"
              className="filter-input"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="filter-input"
                style={{ cursor: isBalanced ? 'pointer' : 'not-allowed', backgroundColor: '#ffffff' }}
                disabled={!isBalanced}
                onClick={() => handleSaveEntry('Draft')}
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="btn-teal"
                disabled={!isBalanced}
                style={{ opacity: isBalanced ? 1 : 0.6, cursor: isBalanced ? 'pointer' : 'not-allowed' }}
                onClick={() => handleSaveEntry('Posted')}
              >
                Post Entry
              </button>
            </div>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="drawer-form-group">
              <label className="drawer-form-label">
                Accounting Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="drawer-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="drawer-form-group">
              <label className="drawer-form-label">
                Journal <span className="required">*</span>
              </label>
              <select
                className="drawer-input"
                value={journalId}
                onChange={(e) => setJournalId(e.target.value)}
              >
                {journals.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.code} - {j.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="drawer-form-group">
            <label className="drawer-form-label">Reference / Memo</label>
            <input
              type="text"
              className="drawer-input"
              placeholder="e.g. Month End Salary & Depreciation"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Line Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                Transaction Entry Lines
              </span>
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '12px', color: 'var(--color-teal)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent' }}
                onClick={handleAddLine}
              >
                <Plus size={14} /> Add Line
              </button>
            </div>

            <table className="urban-table" style={{ border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Partner</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Debit (₹)</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Credit (₹)</th>
                  <th style={{ width: '30px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line: JournalEntryLine, idx: number) => (
                  <tr key={line.id}>
                    <td style={{ padding: '8px 10px' }}>
                      <select
                        className="drawer-input"
                        style={{ padding: '4px 6px', fontSize: '12px' }}
                        value={line.accountId}
                        onChange={(e) => handleLineFieldChange(idx, 'accountId', e.target.value)}
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code} - {a.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <select
                        className="drawer-input"
                        style={{ padding: '4px 6px', fontSize: '12px' }}
                        value={line.partnerId || ''}
                        onChange={(e) => handleLineFieldChange(idx, 'partnerId', e.target.value)}
                      >
                        <option value="">None</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <input
                        type="number"
                        min="0"
                        className="drawer-input"
                        style={{ textAlign: 'right', padding: '4px 6px', fontSize: '12px' }}
                        value={line.debit || ''}
                        placeholder="0"
                        onChange={(e) => handleLineFieldChange(idx, 'debit', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <input
                        type="number"
                        min="0"
                        className="drawer-input"
                        style={{ textAlign: 'right', padding: '4px 6px', fontSize: '12px' }}
                        value={line.credit || ''}
                        placeholder="0"
                        onChange={(e) => handleLineFieldChange(idx, 'credit', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      {lines.length > 2 && (
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ padding: '2px', color: '#dc2626', border: 'none', background: 'transparent', cursor: 'pointer' }}
                          onClick={() => handleRemoveLine(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Live Balance Summary */}
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isBalanced ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${isBalanced ? '#a7f3d0' : '#fecaca'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isBalanced ? (
                  <>
                    <CheckCircle2 size={16} color="#059669" />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#065f46' }}>
                      Balanced Entry: Total {formatINR(totalDebitSum)}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} color="#dc2626" />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#991b1b' }}>
                      Unbalanced Discrepancy: {formatINR(discrepancy)}
                    </span>
                  </>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Dr: <strong>{formatINR(totalDebitSum)}</strong> | Cr: <strong>{formatINR(totalCreditSum)}</strong>
              </div>
            </div>
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
};

export default JournalEntriesPage;
