import React, { useState } from 'react';
import { Plus, Check, ArrowLeft, Wallet, Printer, Send, CheckCircle2 } from 'lucide-react';
import { useAccountingStore, VendorBill, OrderLine } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { LineItemsTable } from '../../../components/ui/LineItemsTable';
import { Many2OneSelect } from '../../../components/ui/Many2OneSelect';
import { PaymentModal } from '../../../components/ui/PaymentModal';
import { JournalEntryPreview } from '../../../components/ui/JournalEntryPreview';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const VendorBillsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { bills, contacts, products, accounts, analytics, journalEntries, addBill, confirmBill, payBill } =
    useAccountingStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Draft' | 'Paid'>('All');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState<VendorBill | null>(null);
  const [payingBill, setPayingBill] = useState<VendorBill | null>(null);

  // Form State
  const [partnerId, setPartnerId] = useState(contacts[0]?.id || '');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setPartnerId(contacts[0]?.id || '');
    setReference('');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);

    const defaultProd = products[0];
    const defaultAcc = accounts.find((a) => a.type === 'Expense') || accounts[0];
    setLines([
      {
        id: `l_${Date.now()}`,
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || '',
        accountId: defaultAcc?.id || '',
        accountName: defaultAcc?.name || '',
        analyticId: analytics[0]?.id || '',
        analyticName: analytics[0]?.name || '',
        quantity: 1,
        unitPrice: defaultProd?.cost || 50,
        total: defaultProd?.cost || 50,
      },
    ]);
    setError('');
    setIsCreateModalOpen(true);
  };

  const handleSaveBill = (status: 'Draft' | 'Confirmed') => {
    if (lines.length === 0) {
      setError('Please add at least one line item to this bill.');
      return;
    }

    const partner = contacts.find((c) => c.id === partnerId) || contacts[0];
    const total = lines.reduce((s: number, l: OrderLine) => s + l.total, 0);

    const created = addBill({
      reference,
      partnerId: partner?.id || 'c1',
      partnerName: partner?.name || 'Supplier',
      date,
      dueDate,
      lines,
      total,
      status: 'Draft',
    });

    if (status === 'Confirmed') {
      confirmBill(created.id);
    }

    setIsCreateModalOpen(false);
  };

  const filteredBills = bills.filter((b) => {
    const matchesTab = activeTab === 'All' || b.status === activeTab;
    const matchesSearch =
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      b.reference.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns: Column<VendorBill>[] = [
    {
      key: 'billNumber',
      header: 'Bill #',
      width: '140px',
      render: (b) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{b.billNumber}</span>,
    },
    {
      key: 'partnerName',
      header: 'Vendor / Supplier',
      render: (b) => <span style={{ fontWeight: 500 }}>{b.partnerName}</span>,
    },
    {
      key: 'date',
      header: 'Bill Date',
      width: '120px',
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      width: '120px',
    },
    {
      key: 'total',
      header: 'Total ($)',
      align: 'right',
      render: (b) => <span>₹{b.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'amountDue',
      header: 'Amount Due ($)',
      align: 'right',
      render: (b) => (
        <span style={{ fontWeight: 700, color: b.amountDue > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>₹{b.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (b) => (
        <StatusBadge
          status={b.status === 'Paid' ? 'paid' : b.status === 'Confirmed' ? 'due' : 'neutral'}
          label={b.status}
        />
      ),
    },
  ];

  const matchedJournalEntry = viewingBill?.journalEntryId
    ? journalEntries.find((je) => je.id === viewingBill.journalEntryId)
    : journalEntries.find((je) => je.reference === viewingBill?.billNumber);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/purchase/bills" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Vendor Bills & Accounts Payable</h1>
          <p className="page-subtitle">
            Procurement expense ledger with automated double-entry postings (Purchase Dr, Creditor Cr) and disbursements
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Vendor Bill
        </Button>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Tabs */}
          <div className="auth-tabs" style={{ width: 'auto', minWidth: '340px' }}>
            {(['All', 'Confirmed', 'Draft', 'Paid'] as const).map((tab) => {
              const count = bills.filter((b) => tab === 'All' || b.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`auth-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '320px' }}
            placeholder="Search bill #, vendor, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredBills}
          keyExtractor={(b) => b.id}
          onRowClick={(b) => setViewingBill(b)}
        />
      </div>

      {/* Bill Detail & Payment Modal */}
      {viewingBill && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBill(null)}
          title={`Vendor Bill: ${viewingBill.billNumber}`}
          maxWidth="750px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {viewingBill.status === 'Draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      confirmBill(viewingBill.id);
                      setViewingBill({ ...viewingBill, status: 'Confirmed' });
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Confirm Bill (Post to Ledger)
                  </Button>
                )}

                {viewingBill.status !== 'Draft' && viewingBill.amountDue > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setPayingBill(viewingBill);
                    }}
                    leftIcon={<Wallet size={14} />}
                  >
                    Register Payment
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer size={14} />}>
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Bill confirmation sent to vendor.`)}
                  leftIcon={<Send size={14} />}
                >
                  Send
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setViewingBill(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Vendor:</span>
                <span style={{ fontWeight: 600 }}>{viewingBill.partnerName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Bill Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingBill.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Payment Due:</span>
                <span style={{ fontWeight: 600 }}>{viewingBill.dueDate}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Status:</span>
                <StatusBadge
                  status={viewingBill.status === 'Paid' ? 'paid' : viewingBill.status === 'Confirmed' ? 'due' : 'neutral'}
                  label={viewingBill.status}
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="card-panel" style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Amount:</span>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>₹{viewingBill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="card-panel" style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Amount Paid:</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{viewingBill.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="card-panel" style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Amount Due:</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: viewingBill.amountDue > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>₹{viewingBill.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Line items table */}
            <LineItemsTable lines={viewingBill.lines} onChange={() => {}} readOnly defaultAccountType="Expense" />

            {/* Auto-generated Journal Entry Preview */}
            {matchedJournalEntry && (
              <JournalEntryPreview
                entry={matchedJournalEntry}
                onViewEntry={() => {
                  setViewingBill(null);
                  onNavigate('/journal-entries');
                }}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {payingBill && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPayingBill(null)}
          type="Send"
          partnerName={payingBill.partnerName}
          sourceDocNumber={payingBill.billNumber}
          maxAmount={payingBill.amountDue}
          onConfirmPayment={(amt, via, dt) => {
            payBill(payingBill.id, amt, via, dt);
            setPayingBill(null);
            setViewingBill(null);
          }}
        />
      )}

      {/* Create Bill Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Vendor Bill"
        maxWidth="750px"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="outline" onClick={() => handleSaveBill('Draft')}>
              Save as Draft
            </Button>
            <Button variant="primary" onClick={() => handleSaveBill('Confirmed')} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm & Post to Ledger
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Many2OneSelect
              label="Vendor (Creditor Account Cr)"
              options={contacts.map((c) => ({ id: c.id, name: c.name, subtitle: c.email }))}
              value={partnerId}
              onChange={(id) => setPartnerId(id)}
              createEntityName="Vendor"
              required
            />

            <FormField
              label="Vendor Bill Reference / Invoice #"
              placeholder="e.g. SUPP-BILL-8821"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField
              label="Bill Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <FormField
              label="Payment Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <LineItemsTable lines={lines} onChange={setLines} defaultAccountType="Expense" />
        </form>
      </Modal>
    </div>
  );
};

export default VendorBillsPage;
