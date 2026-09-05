import React, { useState } from 'react';
import { Plus, Check, ArrowLeft, Wallet, Printer, Send, CheckCircle2, Download } from 'lucide-react';
import { useAccountingStore, CustomerInvoice, OrderLine } from '../../accounting/store';
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
import { exportCustomerInvoicePdf } from '../../../lib/pdfExport';
import { DocumentSignatureStamp } from '../../../components/ui/DocumentSignatureStamp';

export const InvoicesPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { invoices, contacts, products, accounts, analytics, journalEntries, addInvoice, confirmInvoice, payInvoice } =
    useAccountingStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Draft' | 'Paid'>('All');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<CustomerInvoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<CustomerInvoice | null>(null);

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
    const defaultAcc = accounts.find((a) => a.type === 'Income') || accounts[0];
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
        unitPrice: defaultProd?.salesPrice || 100,
        total: defaultProd?.salesPrice || 100,
      },
    ]);
    setError('');
    setIsCreateModalOpen(true);
  };

  const handleSaveInvoice = (status: 'Draft' | 'Confirmed') => {
    if (lines.length === 0) {
      setError('Please add at least one line item to this invoice.');
      return;
    }

    const partner = contacts.find((c) => c.id === partnerId) || contacts[0];
    const total = lines.reduce((s: number, l: OrderLine) => s + l.total, 0);

    const created = addInvoice({
      reference,
      partnerId: partner?.id || contacts[0]?.id || '',
      partnerName: partner?.name || 'Customer',
      date,
      dueDate,
      lines,
      total,
      status: 'Draft',
    });

    if (status === 'Confirmed') {
      confirmInvoice(created.id);
    }

    setIsCreateModalOpen(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab = activeTab === 'All' || inv.status === activeTab;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.reference.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns: Column<CustomerInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      width: '140px',
      render: (inv) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</span>,
    },
    {
      key: 'partnerName',
      header: 'Customer',
      render: (inv) => <span style={{ fontWeight: 500 }}>{inv.partnerName}</span>,
    },
    {
      key: 'date',
      header: 'Invoice Date',
      width: '120px',
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      width: '120px',
    },
    {
      key: 'total',
      header: 'Total (₹)',
      align: 'right',
      render: (inv) => <span>₹{inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'amountDue',
      header: 'Amount Due (₹)',
      align: 'right',
      render: (inv) => (
        <span style={{ fontWeight: 700, color: inv.amountDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>₹{inv.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (inv) => (
        <StatusBadge
          status={inv.status === 'Paid' ? 'paid' : inv.status === 'Confirmed' ? 'pending' : 'neutral'}
          label={inv.status}
        />
      ),
    },
  ];

  const matchedJournalEntry = viewingInvoice?.journalEntryId
    ? journalEntries.find((je) => je.id === viewingInvoice.journalEntryId)
    : journalEntries.find((je) => je.reference === viewingInvoice?.invoiceNumber);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/sales/invoices" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Customer Invoices & Receivables</h1>
          <p className="page-subtitle">
            Sales billing ledger with automated double-entry postings (Sales Cr, Debtor Dr) and payment tracking
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          Create Customer Invoice
        </Button>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Tabs */}
          <div className="auth-tabs" style={{ width: 'auto', minWidth: '340px' }}>
            {(['All', 'Confirmed', 'Draft', 'Paid'] as const).map((tab) => {
              const count = invoices.filter((inv) => tab === 'All' || inv.status === tab).length;
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
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredInvoices}
          keyExtractor={(inv) => inv.id}
          onRowClick={(inv) => setViewingInvoice(inv)}
        />
      </div>

      {/* Invoice Detail & Payment Modal */}
      {viewingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setViewingInvoice(null)}
          title={`Customer Invoice: ${viewingInvoice.invoiceNumber}`}
          maxWidth="750px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {viewingInvoice.status === 'Draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      confirmInvoice(viewingInvoice.id);
                      setViewingInvoice({ ...viewingInvoice, status: 'Confirmed' });
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Confirm Invoice (Post to Ledger)
                  </Button>
                )}

                {viewingInvoice.status !== 'Draft' && viewingInvoice.amountDue > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setPayingInvoice(viewingInvoice);
                    }}
                    leftIcon={<Wallet size={14} />}
                  >
                    Register Payment
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCustomerInvoicePdf(viewingInvoice)}
                  leftIcon={<Download size={14} />}
                >
                  Export PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer size={14} />}>
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Invoice ${viewingInvoice.invoiceNumber} sent via email to customer.`)}
                  leftIcon={<Send size={14} />}
                >
                  Send
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setViewingInvoice(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Customer:</span>
                <span style={{ fontWeight: 600 }}>{viewingInvoice.partnerName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Invoice Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingInvoice.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Payment Due:</span>
                <span style={{ fontWeight: 600 }}>{viewingInvoice.dueDate}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Status:</span>
                <StatusBadge
                  status={viewingInvoice.status === 'Paid' ? 'paid' : viewingInvoice.status === 'Confirmed' ? 'pending' : 'neutral'}
                  label={viewingInvoice.status}
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="card-panel" style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Amount:</span>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>₹{viewingInvoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="card-panel" style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Amount Paid:</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{viewingInvoice.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="card-panel" style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Amount Due:</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: viewingInvoice.amountDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>₹{viewingInvoice.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Line items table */}
            <LineItemsTable lines={viewingInvoice.lines} onChange={() => {}} readOnly />

            <DocumentSignatureStamp
              documentRef={`UF-INV-${viewingInvoice.invoiceNumber}`}
              firstDesignation="Billing Accountant"
              secondDesignation="Authorized Signatory"
              compact
            />

            {/* Auto-generated Journal Entry Preview */}
            {matchedJournalEntry && (
              <JournalEntryPreview
                entry={matchedJournalEntry}
                onViewEntry={() => {
                  setViewingInvoice(null);
                  onNavigate('/journal-entries');
                }}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Payment Registration Modal */}
      {payingInvoice && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPayingInvoice(null)}
          type="Receive"
          partnerName={payingInvoice.partnerName}
          sourceDocNumber={payingInvoice.invoiceNumber}
          maxAmount={payingInvoice.amountDue}
          onConfirmPayment={(amt, via, dt) => {
            payInvoice(payingInvoice.id, amt, via, dt);
            setPayingInvoice(null);
            setViewingInvoice(null);
          }}
        />
      )}

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Customer Invoice"
        maxWidth="750px"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="outline" onClick={() => handleSaveInvoice('Draft')}>
              Save as Draft
            </Button>
            <Button variant="primary" onClick={() => handleSaveInvoice('Confirmed')} leftIcon={<Check size={15} strokeWidth={2.2} />}>
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
              label="Customer (Debtor Account Dr)"
              options={contacts.map((c) => ({ id: c.id, name: c.name, subtitle: c.email }))}
              value={partnerId}
              onChange={(id) => setPartnerId(id)}
              createEntityName="Customer"
              required
            />

            <FormField
              label="Customer Reference / Order #"
              placeholder="e.g. PO-CLIENT-994"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField
              label="Invoice Date"
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

          <LineItemsTable lines={lines} onChange={setLines} defaultAccountType="Income" />
        </form>
      </Modal>
    </div>
  );
};

export default InvoicesPage;
