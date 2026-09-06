import React, { useState } from 'react';
import {
  Plus,
  Check,
  ArrowLeft,
  Wallet,
  Printer,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PieChart,
  ExternalLink,
  Download,
} from 'lucide-react';
import { useAccountingStore, VendorBill, OrderLine } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { LineItemsTable } from '../../../components/ui/LineItemsTable';
import { Many2OneSelect } from '../../../components/ui/Many2OneSelect';
import { PaymentModal } from '../../../components/ui/PaymentModal';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { exportVendorBillPdf } from '../../../lib/pdfExport';
import { DocumentSignatureStamp } from '../../../components/ui/DocumentSignatureStamp';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';

export const VendorBillsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const {
    bills,
    contacts,
    products,
    accounts,
    analytics,
    budgets,
    addBill,
    confirmBill,
    payBill,
  } = useAccountingStore();

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

  // Check whether order lines exceed approved budget
  const checkBudgetExceeded = (targetLines: OrderLine[]) => {
    for (const line of targetLines) {
      if (line.analyticId) {
        const budget = budgets.find((b) => b.analyticId === line.analyticId && b.state === 'Confirmed');
        if (budget && line.total > budget.committedAmount) {
          return true;
        }
      }
    }
    return false;
  };

  const openCreateModal = () => {
    setPartnerId(contacts[0]?.id || '');
    setReference('');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);

    const defaultProd = products[0];
    const purchaseAcc =
      accounts.find((a) => a.code === '5000' || a.name.toLowerCase().includes('purchase')) ||
      accounts.find((a) => a.type === 'Expense') ||
      accounts[0];

    setLines([
      {
        id: `l_${Date.now()}`,
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || '',
        accountId: purchaseAcc?.id || '',
        accountName: purchaseAcc?.name || 'Purchase A/c',
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
      reference: reference || 'ABC-26-001',
      partnerId: partner?.id || contacts[0]?.id || '',
      partnerName: partner?.name || 'Vendor',
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

  const getPaymentStatusBadge = (b: VendorBill) => {
    if (b.amountDue <= 0.01) {
      return <StatusBadge status="paid" label="Paid" />;
    }
    if (b.amountDue < b.total) {
      return <StatusBadge status="due" label="Partial" />;
    }
    return <StatusBadge status="neutral" label="Not Paid" />;
  };

  const columns: Column<VendorBill>[] = [
    {
      key: 'billNumber',
      header: 'Vendor Bill No.',
      width: '150px',
      render: (b) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{b.billNumber}</span>,
    },
    {
      key: 'partnerName',
      header: 'Vendor Name',
      render: (b) => <span style={{ fontWeight: 600 }}>{b.partnerName}</span>,
    },
    {
      key: 'reference',
      header: 'Bill Reference',
      width: '140px',
      render: (b) => <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{b.reference || '—'}</span>,
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
      header: 'Total',
      align: 'right',
      render: (b) => <span>₹{b.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'amountDue',
      header: 'Amount Due',
      align: 'right',
      render: (b) => (
        <span style={{ fontWeight: 700, color: b.amountDue > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
          ₹{b.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (b) => getPaymentStatusBadge(b),
    },
  ];

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
          <div className="auth-tabs" style={{ width: 'auto', flexWrap: 'nowrap' }}>
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

      {/* Bill Detail & Workflow Modal */}
      {viewingBill && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBill(null)}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '18px' }}>Vendor Bill: {viewingBill.billNumber}</span>
                {getPaymentStatusBadge(viewingBill)}
              </div>

              {/* Smart Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {viewingBill.poNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewingBill(null);
                      onNavigate('/purchase/orders');
                    }}
                    leftIcon={<FileText size={14} />}
                  >
                    PO ({viewingBill.poNumber})
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingBill(null);
                    onNavigate('/budgets');
                  }}
                  leftIcon={<PieChart size={14} />}
                >
                  Budgets
                </Button>
              </div>
            </div>
          }
          maxWidth="820px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                    onClick={() => setPayingBill(viewingBill)}
                    leftIcon={<Wallet size={14} />}
                  >
                    Pay
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportVendorBillPdf(viewingBill)}
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
                  onClick={() => alert(`Vendor Bill notification sent.`)}
                  leftIcon={<Send size={14} />}
                >
                  Send
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" size="sm" onClick={() => setViewingBill(null)}>
                  Back
                </Button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Non-blocking Warning if Budget Exceeded */}
            {checkBudgetExceeded(viewingBill.lines) && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Non-Blocking Warning on Bill: Exceeds Approved Budget</strong>
                  The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget.
                </div>
              </div>
            )}

            {/* Bill Header Info */}
            <div
              className="responsive-modal-grid-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                padding: '14px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Vendor Name:</span>
                <span style={{ fontWeight: 600 }}>{viewingBill.partnerName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Bill Reference:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{viewingBill.reference || '—'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Bill Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingBill.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Due Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingBill.dueDate}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <LineItemsTable lines={viewingBill.lines} onChange={() => {}} readOnly defaultAccountType="Expense" />

            {/* Financial Summary & Disbursement Breakdown */}
            <div
              className="responsive-modal-grid-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                backgroundColor: '#f8fafc',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Total Bill:</span>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>₹{viewingBill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Paid Via Cash:</span>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>₹{(viewingBill.paidViaCash || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Paid Via Bank:</span>
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary)' }}>₹{(viewingBill.paidViaBank || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Amount Due:</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: viewingBill.amountDue > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                  ₹{viewingBill.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Auto-Generated Double Entry Journal Entry */}
            {viewingBill.status !== 'Draft' && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                    <span style={{ fontWeight: 700, color: '#166534', fontSize: '14px' }}>
                      Auto-Generated Journal Entry (Purchase Journal) — Balanced Debit & Credit
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewingBill(null);
                      onNavigate('/journal-entries');
                    }}
                    leftIcon={<ExternalLink size={13} />}
                  >
                    View in Journal Entries
                  </Button>
                </div>

                <table className="custom-table" style={{ backgroundColor: '#ffffff', borderRadius: '4px' }}>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Partner</th>
                      <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                      <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Purchase A/c (Expense / Cost of Goods)</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{viewingBill.partnerName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{viewingBill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>—</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Creditor A/c (Accounts Payable)</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{viewingBill.partnerName}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>—</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{viewingBill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ fontWeight: 700, borderTop: '2px solid var(--color-border)' }}>
                      <td colSpan={2} style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        MATCHED TOTAL:
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>
                        ₹{viewingBill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>
                        ₹{viewingBill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <DocumentSignatureStamp
              documentRef={`UF-BILL-${viewingBill.billNumber}`}
              firstDesignation="Procurement Auditor"
              secondDesignation="Accounts Payable Head"
              compact
            />
          </div>
        </Modal>
      )}

      {/* Bill Payment Modal */}
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
            setViewingBill((prev) => {
              if (!prev || prev.id !== payingBill.id) return prev;
              const newPaid = prev.amountPaid + amt;
              const newDue = Math.max(0, prev.total - newPaid);
              const paidBank = (prev.paidViaBank || 0) + (via === 'Bank' ? amt : 0);
              const paidCash = (prev.paidViaCash || 0) + (via === 'Cash' ? amt : 0);
              return {
                ...prev,
                amountPaid: newPaid,
                amountDue: newDue,
                paidViaBank: paidBank,
                paidViaCash: paidCash,
                status: newDue <= 0.01 ? 'Paid' : 'Confirmed',
              };
            });
          }}
        />
      )}

      {/* Create Bill Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Vendor Bill"
        maxWidth="820px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Cancel
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" onClick={() => handleSaveBill('Draft')}>
                Save Draft
              </Button>
              <Button variant="primary" onClick={() => handleSaveBill('Confirmed')} leftIcon={<Check size={15} strokeWidth={2.2} />}>
                Confirm Bill (Auto-Post Journal Entry)
              </Button>
            </div>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {checkBudgetExceeded(lines) && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <AlertTriangle size={16} style={{ color: '#d97706', flexShrink: 0 }} />
              <span>
                <strong>Non-Blocking Warning: Exceeds Approved Budget.</strong> The entered amount exceeds the remaining budget line allocation.
              </span>
            </div>
          )}

          <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Many2OneSelect
              label="Vendor Name (Many-to-One)"
              options={contacts.map((c) => ({ id: c.id, name: c.name, subtitle: c.email }))}
              value={partnerId}
              onChange={(id) => setPartnerId(id)}
              createEntityName="Vendor"
              required
            />

            <FormField
              label="Bill Reference (Alphanumeric)"
              placeholder="e.g. ABC-26-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Bill Date *</label>
              <CustomDatePicker
                value={date}
                onChange={setDate}
                placeholder="Bill Date"
                width="100%"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <CustomDatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Due Date"
                width="100%"
              />
            </div>
          </div>

          <LineItemsTable lines={lines} onChange={setLines} defaultAccountType="Expense" />
        </form>
      </Modal>
    </div>
  );
};

export default VendorBillsPage;
