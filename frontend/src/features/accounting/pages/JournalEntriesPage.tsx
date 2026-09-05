import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { useAccountingStore, JournalEntry, JournalEntryLine } from '../store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const JournalEntriesPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { journalEntries, journals, accounts, contacts, addJournalEntry, postJournalEntry, cancelJournalEntry } =
    useAccountingStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalId, setJournalId] = useState(journals[0]?.id || '');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>([
    {
      id: 'l1',
      accountId: accounts[0]?.id || '',
      accountName: accounts[0]?.name || '',
      partnerId: contacts[0]?.id || '',
      partnerName: contacts[0]?.name || '',
      debit: 1000,
      credit: 0,
    },
    {
      id: 'l2',
      accountId: accounts[1]?.id || '',
      accountName: accounts[1]?.name || '',
      partnerId: contacts[0]?.id || '',
      partnerName: contacts[0]?.name || '',
      debit: 0,
      credit: 1000,
    },
  ]);
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setViewingEntry(null);
    setDate(new Date().toISOString().split('T')[0]);
    setJournalId(journals[0]?.id || '');
    setReference('');
    setLines([
      {
        id: `l_${Date.now()}_1`,
        accountId: accounts[0]?.id || '',
        accountName: accounts[0]?.name || '',
        partnerId: contacts[0]?.id || '',
        partnerName: contacts[0]?.name || '',
        debit: 5000,
        credit: 0,
      },
      {
        id: `l_${Date.now()}_2`,
        accountId: accounts[1]?.id || '',
        accountName: accounts[1]?.name || '',
        partnerId: contacts[0]?.id || '',
        partnerName: contacts[0]?.name || '',
        debit: 0,
        credit: 5000,
      },
    ]);
    setFormError('');
    setIsModalOpen(true);
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
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineFieldChange = (idx: number, field: keyof JournalEntryLine, val: any) => {
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

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSaveEntry = (status: 'Draft' | 'Posted') => {
    setFormError('');
    if (!isBalanced) {
      setFormError(
        `Double-entry rule violation: Debit (₹${totalDebit.toFixed(2)}) must equal Credit (₹${totalCredit.toFixed(2)})!`
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
      totalDebit,
      totalCredit,
    });

    if (!result.success) {
      setFormError(result.message || 'Error saving journal entry');
      return;
    }

    setIsModalOpen(false);
  };

  const filteredEntries = journalEntries.filter(
    (je) =>
      je.entryNumber.toLowerCase().includes(search.toLowerCase()) ||
      je.journalName.toLowerCase().includes(search.toLowerCase()) ||
      (je.reference && je.reference.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<JournalEntry>[] = [
    {
      key: 'entryNumber',
      header: 'Number',
      width: '140px',
      render: (je) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{je.entryNumber}</span>,
    },
    {
      key: 'date',
      header: 'Accounting Date',
      width: '130px',
    },
    {
      key: 'journalName',
      header: 'Journal',
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (je) => <span style={{ color: 'var(--color-text-muted)' }}>{je.reference || '—'}</span>,
    },
    {
      key: 'totalDebit',
      header: 'Total Debit / Credit',
      align: 'right',
      render: (je) => (
        <span style={{ fontWeight: 600 }}>₹{je.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (je) => (
        <StatusBadge
          status={je.status === 'Posted' ? 'completed' : je.status === 'Cancelled' ? 'danger' : 'neutral'}
          label={je.status}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/journal-entries" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">General Journal Entries</h1>
          <p className="page-subtitle">
            Immutable balanced double-entry accounting records (Debit Total = Credit Total required)
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Journal Entry
        </Button>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '360px' }}
            placeholder="Search by entry #, journal, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredEntries.length}</strong> journal postings
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredEntries}
          keyExtractor={(je) => je.id}
          onRowClick={(je) => setViewingEntry(je)}
        />
      </div>

      {/* View Existing Entry Modal */}
      {viewingEntry && (
        <Modal
          isOpen={true}
          onClose={() => setViewingEntry(null)}
          title={`Journal Entry: ${viewingEntry.entryNumber} (${viewingEntry.journalName})`}
          maxWidth="700px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {viewingEntry.status === 'Draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      postJournalEntry(viewingEntry.id);
                      setViewingEntry({ ...viewingEntry, status: 'Posted' });
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Post Entry
                  </Button>
                )}
                {viewingEntry.status !== 'Cancelled' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      cancelJournalEntry(viewingEntry.id);
                      setViewingEntry({ ...viewingEntry, status: 'Cancelled' });
                    }}
                    leftIcon={<XCircle size={14} />}
                  >
                    Cancel Entry
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setViewingEntry(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingEntry.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Journal:</span>
                <span style={{ fontWeight: 600 }}>{viewingEntry.journalName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Reference:</span>
                <span style={{ fontWeight: 600 }}>{viewingEntry.reference || '—'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Status:</span>
                <StatusBadge status={viewingEntry.status === 'Posted' ? 'completed' : 'danger'} label={viewingEntry.status} />
              </div>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Partner</th>
                  <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                </tr>
              </thead>
              <tbody>
                {viewingEntry.lines.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.accountName}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{l.partnerName || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: l.debit > 0 ? 600 : 400 }}>
                      {l.debit > 0 ? `₹${l.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: l.credit > 0 ? 600 : 400 }}>
                      {l.credit > 0 ? `₹${l.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, borderTop: '2px solid var(--color-border)' }}>
                  <td colSpan={2} style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>
                    BALANCED SUM:
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>₹{viewingEntry.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>₹{viewingEntry.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Modal>
      )}

      {/* New Journal Entry Modal with strict Debit == Credit Rule */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Journal Entry (Balanced Dr/Cr)"
        maxWidth="750px"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSaveEntry('Draft')}
              disabled={!isBalanced}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSaveEntry('Posted')}
              disabled={!isBalanced}
              leftIcon={<Check size={15} strokeWidth={2.2} />}
            >
              Post to Ledger
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger-text)',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <FormField
              label="Accounting Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div className="form-group">
              <label className="form-label" htmlFor="entry-journal">
                Journal
              </label>
              <select
                id="entry-journal"
                className="form-input select-filter"
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

            <FormField
              label="Reference / Memo"
              placeholder="e.g. Month End Depreciation"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Line Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Debit / Credit Entry Lines</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine} leftIcon={<Plus size={14} />}>
                Add Line
              </Button>
            </div>

            <table className="custom-table" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '180px' }}>Account</th>
                  <th style={{ minWidth: '140px' }}>Partner</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Debit (₹)</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Credit (₹)</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={line.id}>
                    <td>
                      <select
                        className="form-input select-filter"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
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
                    <td>
                      <select
                        className="form-input select-filter"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
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
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        style={{ textAlign: 'right', padding: '6px 8px', fontSize: '12px' }}
                        value={line.debit || ''}
                        placeholder="0.00"
                        onChange={(e) => handleLineFieldChange(idx, 'debit', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        style={{ textAlign: 'right', padding: '6px 8px', fontSize: '12px' }}
                        value={line.credit || ''}
                        placeholder="0.00"
                        onChange={(e) => handleLineFieldChange(idx, 'credit', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {lines.length > 2 && (
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ padding: '2px', color: 'var(--color-danger)' }}
                          onClick={() => handleRemoveLine(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    fontWeight: 700,
                    backgroundColor: isBalanced ? 'var(--color-surface-active)' : 'var(--color-danger-bg)',
                    borderTop: '2px solid var(--color-border)',
                  }}
                >
                  <td colSpan={2} style={{ textAlign: 'right', fontSize: '12px' }}>
                    {isBalanced ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary)' }}>
                        <CheckCircle2 size={14} /> BALANCED TOTALS:
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-danger)' }}>UNBALANCED DISCREPANCY:</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', color: isBalanced ? 'var(--color-text-primary)' : 'var(--color-danger)', fontSize: '13px' }}>₹{totalDebit.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', color: isBalanced ? 'var(--color-text-primary)' : 'var(--color-danger)', fontSize: '13px' }}>₹{totalCredit.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            {!isBalanced && (
              <span style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 600 }}>
                ⚠️ Debit Total must exactly equal Credit Total to save or post.
              </span>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JournalEntriesPage;
