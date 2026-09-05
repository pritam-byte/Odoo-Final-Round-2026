import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Check,
  ArrowLeft,
  Download,
  Building,
  CreditCard,
} from 'lucide-react';
import { useAccountingStore, PaymentRecord } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { registerPaymentApi } from '../api';

export const PaymentHistoryPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { payments, contacts, accounts, journals, addJournalEntry } = useAccountingStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Receive' | 'Send'>('All');
  const [methodFilter, setMethodFilter] = useState<'All' | 'Bank' | 'Cash'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Payment Form State
  const [paymentType, setPaymentType] = useState<'Send' | 'Receive'>('Receive');
  const [partnerId, setPartnerId] = useState(contacts[0]?.id || '');
  const [amount, setAmount] = useState<number>(10000);
  const [paymentVia, setPaymentVia] = useState<'Bank' | 'Cash'>('Bank');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  // Computations
  const totalReceived = payments
    .filter((p) => p.type === 'Receive')
    .reduce((s, p) => s + p.amount, 0);

  const totalSent = payments
    .filter((p) => p.type === 'Send')
    .reduce((s, p) => s + p.amount, 0);

  const netCashflow = totalReceived - totalSent;

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const matchesMethod = methodFilter === 'All' || p.paymentVia === methodFilter;
    return matchesSearch && matchesType && matchesMethod;
  });

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
      setError('Partner / Contact is required.');
      return;
    }
    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    const partner = contacts.find((c) => c.id === partnerId) || contacts[0];
    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      type: paymentType,
      date,
      partnerId: partner.id,
      partnerName: partner.name,
      paymentVia,
      amount,
      sourceDocType: paymentType === 'Receive' ? 'Invoice' : 'Bill',
      sourceDocId: `doc_${Date.now()}`,
      reference: reference || `Direct ${paymentType} Payment`,
    };

    // Auto-record balanced journal entry
    const bankCashAcc = accounts.find((a) => a.type === paymentVia) || accounts.find((a) => a.type === 'Bank') || accounts[0];
    const offsetAcc = paymentType === 'Receive'
      ? (accounts.find((a) => a.code === '1050') || accounts.find((a) => a.type === 'Asset') || accounts[0])
      : (accounts.find((a) => a.code === '2010') || accounts.find((a) => a.type === 'Liability') || accounts[0]);

    if (paymentType === 'Receive') {
      addJournalEntry({
        date,
        journalId: journals.find((j) => j.type === paymentVia)?.id || 'j3',
        journalName: `${paymentVia} Register Journal`,
        status: 'Posted',
        reference: newPayment.reference,
        lines: [
          { id: `jel_rec1_${Date.now()}`, accountId: bankCashAcc.id, accountName: bankCashAcc.name, partnerId: partner.id, partnerName: partner.name, debit: amount, credit: 0 },
          { id: `jel_rec2_${Date.now()}`, accountId: offsetAcc.id, accountName: offsetAcc.name, partnerId: partner.id, partnerName: partner.name, debit: 0, credit: amount },
        ],
      });
    } else {
      addJournalEntry({
        date,
        journalId: journals.find((j) => j.type === paymentVia)?.id || 'j3',
        journalName: `${paymentVia} Register Journal`,
        status: 'Posted',
        reference: newPayment.reference,
        lines: [
          { id: `jel_send1_${Date.now()}`, accountId: offsetAcc.id, accountName: offsetAcc.name, partnerId: partner.id, partnerName: partner.name, debit: amount, credit: 0 },
          { id: `jel_send2_${Date.now()}`, accountId: bankCashAcc.id, accountName: bankCashAcc.name, partnerId: partner.id, partnerName: partner.name, debit: 0, credit: amount },
        ],
      });
    }

    // Backend sync
    registerPaymentApi({
      paymentType: paymentType === 'Receive' ? 'RECEIVE' : 'SEND',
      partnerId: partner.id,
      amount,
      paymentVia: paymentVia === 'Bank' ? 'BANK' : 'CASH',
      note: reference || 'Direct Payment Ledger Entry',
    }).catch((err) => console.warn('Backend payment sync error:', err));

    setIsModalOpen(false);
  };

  const columns: Column<PaymentRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (p) => <span style={{ fontWeight: 500 }}>{p.date}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (p) => (
        <span
          className={`badge-pill ${p.type === 'Receive' ? 'badge-completed' : 'badge-pending'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {p.type === 'Receive' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
          {p.type === 'Receive' ? 'Collection (In)' : 'Disbursement (Out)'}
        </span>
      ),
    },
    {
      key: 'partnerName',
      header: 'Partner / Entity',
      render: (p) => <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{p.partnerName}</span>,
    },
    {
      key: 'paymentVia',
      header: 'Method',
      render: (p) => (
        <span className="badge-pill badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {p.paymentVia === 'Bank' ? <Building size={12} /> : <CreditCard size={12} />}
          {p.paymentVia} Account
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference / Source',
      render: (p) => <span style={{ color: 'var(--color-text-secondary)' }}>{p.reference}</span>,
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      align: 'right',
      render: (p) => (
        <span style={{ fontWeight: 700, color: p.type === 'Receive' ? 'var(--color-primary)' : 'var(--color-danger)' }}>
          {p.type === 'Receive' ? '+' : '-'}₹{p.amount.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/payments" onNavigate={onNavigate} />

      {/* Header */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Payments & Due Register</h1>
          <p className="page-subtitle">
            Liquid cash and bank ledger: Customer collections, vendor disbursements, and bank transactions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="outline" onClick={() => alert('Exporting Payment Ledger PDF...')} leftIcon={<Download size={15} />}>
            Export PDF
          </Button>
          <Button variant="primary" onClick={() => { setError(''); setIsModalOpen(true); }} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
            Register Payment
          </Button>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <ArrowDownLeft size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalReceived.toLocaleString()}</div>
            <div className="stat-label">Total Collections Received</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-badge amber">
            <ArrowUpRight size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalSent.toLocaleString()}</div>
            <div className="stat-label">Total Disbursements Sent</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <Wallet size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number" style={{ color: netCashflow >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
              {netCashflow >= 0 ? '+' : ''}₹{netCashflow.toLocaleString()}
            </div>
            <div className="stat-label">Net Liquidity Movement</div>
          </div>
        </div>
      </div>

      {/* Data Panel */}
      <div className="card-panel" style={{ padding: '16px 20px', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              className="form-input search-bar-input"
              style={{ maxWidth: '340px' }}
              placeholder="Search partner or payment reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="form-input select-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="All">All Types</option>
              <option value="Receive">Incoming Collections</option>
              <option value="Send">Outgoing Disbursements</option>
            </select>

            <select
              className="form-input select-filter"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
            >
              <option value="All">All Methods</option>
              <option value="Bank">Bank Account</option>
              <option value="Cash">Cash Account</option>
            </select>
          </div>

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredPayments.length}</strong> transactions
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No payment records found. Click <strong>Register Payment</strong> to record a transaction.
          </div>
        ) : (
          <DataTable columns={columns} data={filteredPayments} keyExtractor={(p) => p.id} />
        )}
      </div>

      {/* Register Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Direct Payment"
        maxWidth="500px"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRegisterPayment} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm & Post
            </Button>
          </>
        }
      >
        <form onSubmit={handleRegisterPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Payment Direction</label>
            <div className="auth-tabs" style={{ width: '100%' }}>
              <button
                type="button"
                className={`auth-tab-btn ${paymentType === 'Receive' ? 'active' : ''}`}
                onClick={() => setPaymentType('Receive')}
              >
                Receive (From Customer)
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${paymentType === 'Send' ? 'active' : ''}`}
                onClick={() => setPaymentType('Send')}
              >
                Send (To Vendor)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Partner / Contact</label>
            <select
              className="form-input select-filter"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-input select-filter"
                value={paymentVia}
                onChange={(e) => setPaymentVia(e.target.value as any)}
              >
                <option value="Bank">Bank Account</option>
                <option value="Cash">Cash Account</option>
              </select>
            </div>
          </div>

          <FormField
            label="Payment Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <FormField
            label="Memo / Reference Note"
            placeholder="e.g. Bank wire transfer ref #84920"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

export default PaymentHistoryPage;
