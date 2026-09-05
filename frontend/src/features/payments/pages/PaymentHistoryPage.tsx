import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Download,
  Search,
  Eye,
  AlertCircle,
  CheckCircle2,
  Users,
  Receipt,
  FileText,
} from 'lucide-react';
import { useAccountingStore, PaymentRecord, CustomerInvoice, VendorBill } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { PaymentStatusBadge, PaymentDirectionBadge, PaymentMethodBadge } from '../components/PaymentStatusBadge';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';
import { RegisterPaymentModal } from '../components/RegisterPaymentModal';

export const PaymentHistoryPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { payments, invoices, bills, contacts } = useAccountingStore();

  // Active view tab: 'payments' | 'receivables' | 'payables' | 'partners'
  const [activeTab, setActiveTab] = useState<'payments' | 'receivables' | 'payables' | 'partners'>('payments');

  // Filters for Payments tab
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Receive' | 'Send'>('All');
  const [methodFilter, setMethodFilter] = useState<'All' | 'Bank' | 'Cash'>('All');

  // Filters for Receivables / Payables tabs
  const [dueSearch, setDueSearch] = useState('');
  const [dueStatusFilter, setDueStatusFilter] = useState<'All' | 'Overdue' | 'Partial' | 'Unpaid'>('All');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerModalProps, setRegisterModalProps] = useState<{
    defaultType: 'Send' | 'Receive';
    defaultPartnerId?: string;
    defaultDocType?: 'Invoice' | 'Bill';
    defaultDocId?: string;
    defaultAmount?: number;
  }>({ defaultType: 'Receive' });

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  // Computations
  const totalReceived = useMemo(() => {
    return payments.filter((p) => p.type === 'Receive').reduce((s, p) => s + p.amount, 0);
  }, [payments]);

  const totalSent = useMemo(() => {
    return payments.filter((p) => p.type === 'Send').reduce((s, p) => s + p.amount, 0);
  }, [payments]);

  const netCashflow = totalReceived - totalSent;

  // Receivables (Invoices with dues)
  const totalReceivablesDue = useMemo(() => {
    return invoices.reduce((s, inv) => s + inv.amountDue, 0);
  }, [invoices]);

  const unpaidInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.amountDue > 0);
  }, [invoices]);

  // Payables (Bills with dues)
  const totalPayablesDue = useMemo(() => {
    return bills.reduce((s, b) => s + b.amountDue, 0);
  }, [bills]);

  const unpaidBills = useMemo(() => {
    return bills.filter((b) => b.amountDue > 0);
  }, [bills]);

  // Overdue counters
  const today = new Date().toISOString().split('T')[0];

  const overdueInvoicesCount = useMemo(() => {
    return unpaidInvoices.filter((inv) => inv.dueDate && inv.dueDate < today).length;
  }, [unpaidInvoices, today]);

  const overdueBillsCount = useMemo(() => {
    return unpaidBills.filter((b) => b.dueDate && b.dueDate < today).length;
  }, [unpaidBills, today]);

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.partnerName.toLowerCase().includes(search.toLowerCase()) ||
        p.reference.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'All' || p.type === typeFilter;
      const matchesMethod = methodFilter === 'All' || p.paymentVia === methodFilter;
      return matchesSearch && matchesType && matchesMethod;
    });
  }, [payments, search, typeFilter, methodFilter]);

  // Helper for invoice payment status
  const getInvoicePaymentStatus = (inv: CustomerInvoice): 'Paid' | 'Partially Paid' | 'Overdue' | 'Unpaid' => {
    if (inv.amountDue <= 0.01) return 'Paid';
    if (inv.dueDate && inv.dueDate < today) return 'Overdue';
    if (inv.amountPaid > 0) return 'Partially Paid';
    return 'Unpaid';
  };

  // Helper for bill payment status
  const getBillPaymentStatus = (b: VendorBill): 'Paid' | 'Partially Paid' | 'Overdue' | 'Unpaid' => {
    if (b.amountDue <= 0.01) return 'Paid';
    if (b.dueDate && b.dueDate < today) return 'Overdue';
    if (b.amountPaid > 0) return 'Partially Paid';
    return 'Unpaid';
  };

  // Filtered Receivables Due
  const filteredReceivables = useMemo(() => {
    return unpaidInvoices.filter((inv) => {
      const status = getInvoicePaymentStatus(inv);
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(dueSearch.toLowerCase()) ||
        inv.partnerName.toLowerCase().includes(dueSearch.toLowerCase()) ||
        (inv.reference && inv.reference.toLowerCase().includes(dueSearch.toLowerCase()));
      const matchesStatus =
        dueStatusFilter === 'All' ||
        (dueStatusFilter === 'Overdue' && status === 'Overdue') ||
        (dueStatusFilter === 'Partial' && status === 'Partially Paid') ||
        (dueStatusFilter === 'Unpaid' && (status === 'Unpaid' || status === 'Overdue'));
      return matchesSearch && matchesStatus;
    });
  }, [unpaidInvoices, dueSearch, dueStatusFilter, today]);

  // Filtered Payables Due
  const filteredPayables = useMemo(() => {
    return unpaidBills.filter((b) => {
      const status = getBillPaymentStatus(b);
      const matchesSearch =
        b.billNumber.toLowerCase().includes(dueSearch.toLowerCase()) ||
        b.partnerName.toLowerCase().includes(dueSearch.toLowerCase()) ||
        (b.reference && b.reference.toLowerCase().includes(dueSearch.toLowerCase()));
      const matchesStatus =
        dueStatusFilter === 'All' ||
        (dueStatusFilter === 'Overdue' && status === 'Overdue') ||
        (dueStatusFilter === 'Partial' && status === 'Partially Paid') ||
        (dueStatusFilter === 'Unpaid' && (status === 'Unpaid' || status === 'Overdue'));
      return matchesSearch && matchesStatus;
    });
  }, [unpaidBills, dueSearch, dueStatusFilter, today]);

  // Partner Summary Matrix
  const partnerBalances = useMemo(() => {
    return contacts.map((c) => {
      // Invoices for this customer
      const partnerInvoices = invoices.filter(
        (i) => i.partnerId === c.id || (i.partnerName && c.name && i.partnerName.toLowerCase() === c.name.toLowerCase())
      );
      const totalInvoiced = partnerInvoices.reduce((s, i) => s + i.total, 0);
      const totalCollected = partnerInvoices.reduce((s, i) => s + i.amountPaid, 0);
      const receivablesDue = partnerInvoices.reduce((s, i) => s + i.amountDue, 0);

      // Bills for this vendor
      const partnerBills = bills.filter(
        (b) => b.partnerId === c.id || (b.partnerName && c.name && b.partnerName.toLowerCase() === c.name.toLowerCase())
      );
      const totalBilled = partnerBills.reduce((s, b) => s + b.total, 0);
      const totalPaid = partnerBills.reduce((s, b) => s + b.amountPaid, 0);
      const payablesDue = partnerBills.reduce((s, b) => s + b.amountDue, 0);

      const netDue = receivablesDue - payablesDue;

      return {
        contact: c,
        totalInvoiced,
        totalCollected,
        receivablesDue,
        totalBilled,
        totalPaid,
        payablesDue,
        netDue,
      };
    });
  }, [contacts, invoices, bills]);

  const handleOpenRegisterForDoc = (type: 'Invoice' | 'Bill', doc: CustomerInvoice | VendorBill) => {
    if (type === 'Invoice') {
      const inv = doc as CustomerInvoice;
      setRegisterModalProps({
        defaultType: 'Receive',
        defaultPartnerId: inv.partnerId,
        defaultDocType: 'Invoice',
        defaultDocId: inv.id,
        defaultAmount: inv.amountDue,
      });
    } else {
      const bill = doc as VendorBill;
      setRegisterModalProps({
        defaultType: 'Send',
        defaultPartnerId: bill.partnerId,
        defaultDocType: 'Bill',
        defaultDocId: bill.id,
        defaultAmount: bill.amountDue,
      });
    }
    setIsRegisterModalOpen(true);
  };

  const handleOpenGeneralRegister = (type: 'Receive' | 'Send' = 'Receive') => {
    setRegisterModalProps({
      defaultType: type,
      defaultPartnerId: contacts[0]?.id,
      defaultAmount: 10000,
    });
    setIsRegisterModalOpen(true);
  };

  // Helper for timeline calculation
  const getDueTimelineBadge = (dueDateStr: string) => {
    const dueTime = new Date(dueDateStr).getTime();
    const nowTime = new Date(today).getTime();
    const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span
          style={{
            fontSize: '11px',
            color: '#991b1b',
            backgroundColor: '#fee2e2',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertCircle size={11} />
          {Math.abs(diffDays)}d overdue
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span
          style={{
            fontSize: '11px',
            color: '#b45309',
            backgroundColor: '#fef3c7',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 700,
          }}
        >
          Due today
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: '11px',
          color: '#0f766e',
          backgroundColor: '#ccfbf1',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: 600,
        }}
      >
        In {diffDays} days
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/payments" onNavigate={onNavigate} />

      {/* Content Header */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Payments & Due Register</h1>
          <p className="page-subtitle">
            Liquid cash and bank ledger: Customer collections, vendor disbursements, receivables & payables tracking
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            onClick={() => window.print()}
            leftIcon={<Download size={15} />}
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            onClick={() => handleOpenGeneralRegister('Receive')}
            leftIcon={<Plus size={16} strokeWidth={2.2} />}
          >
            Register Payment
          </Button>
        </div>
      </div>

      {/* Stat Tiles: 5 Core Treasury KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Collections */}
        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <ArrowDownLeft size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="stat-number">₹{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Collections Received</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {payments.filter((p) => p.type === 'Receive').length} customer receipts
            </div>
          </div>
        </div>

        {/* Disbursements */}
        <div className="stat-card">
          <div className="stat-icon-badge amber">
            <ArrowUpRight size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="stat-number">₹{totalSent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Disbursements Paid</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {payments.filter((p) => p.type === 'Send').length} vendor payouts
            </div>
          </div>
        </div>

        {/* Customer Receivables Due */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('receivables')}
          title="Click to view all unpaid customer invoices"
        >
          <div className="stat-icon-badge teal" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <FileText size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="stat-number" style={{ color: '#0369a1' }}>
              ₹{totalReceivablesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="stat-label">Receivables Due (Inflow)</div>
            <div style={{ fontSize: '11px', color: overdueInvoicesCount > 0 ? '#b91c1c' : 'var(--color-text-muted)', marginTop: '2px', fontWeight: overdueInvoicesCount > 0 ? 700 : 400 }}>
              {unpaidInvoices.length} invoices ({overdueInvoicesCount} overdue)
            </div>
          </div>
        </div>

        {/* Vendor Payables Due */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('payables')}
          title="Click to view all unpaid vendor bills"
        >
          <div className="stat-icon-badge amber" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            <Receipt size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="stat-number" style={{ color: '#b91c1c' }}>
              ₹{totalPayablesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="stat-label">Payables Due (Outflow)</div>
            <div style={{ fontSize: '11px', color: overdueBillsCount > 0 ? '#b91c1c' : 'var(--color-text-muted)', marginTop: '2px', fontWeight: overdueBillsCount > 0 ? 700 : 400 }}>
              {unpaidBills.length} bills ({overdueBillsCount} overdue)
            </div>
          </div>
        </div>

        {/* Net Liquidity Movement */}
        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <Wallet size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div
              className="stat-number"
              style={{ color: netCashflow >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}
            >
              {netCashflow >= 0 ? '+' : ''}₹{netCashflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="stat-label">Net Liquidity Movement</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Liquid Bank + Cash Net
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Tab Navigation */}
      <div className="card-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            padding: '12px 20px 0 20px',
            backgroundColor: '#f8fafc',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              style={{ padding: '8px 16px', borderRadius: '6px 6px 0 0', fontWeight: 700, fontSize: '13px' }}
              onClick={() => setActiveTab('payments')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Receipt size={15} />
                <span>All Payments Ledger ({payments.length})</span>
              </div>
            </button>

            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'receivables' ? 'active' : ''}`}
              style={{ padding: '8px 16px', borderRadius: '6px 6px 0 0', fontWeight: 700, fontSize: '13px' }}
              onClick={() => setActiveTab('receivables')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowDownLeft size={15} />
                <span>Customer Receivables Due ({unpaidInvoices.length})</span>
              </div>
            </button>

            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'payables' ? 'active' : ''}`}
              style={{ padding: '8px 16px', borderRadius: '6px 6px 0 0', fontWeight: 700, fontSize: '13px' }}
              onClick={() => setActiveTab('payables')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpRight size={15} />
                <span>Vendor Payables Due ({unpaidBills.length})</span>
              </div>
            </button>

            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'partners' ? 'active' : ''}`}
              style={{ padding: '8px 16px', borderRadius: '6px 6px 0 0', fontWeight: 700, fontSize: '13px' }}
              onClick={() => setActiveTab('partners')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} />
                <span>User Balances Summary ({contacts.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab 1: All Payments Ledger */}
        {activeTab === 'payments' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <div className="search-bar-wrapper" style={{ maxWidth: '320px', width: '100%' }}>
                  <div className="search-bar-icon">
                    <Search size={15} strokeWidth={1.75} />
                  </div>
                  <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Search partner, voucher #, memo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-input select-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  style={{ width: '170px' }}
                >
                  <option value="All">All Transactions</option>
                  <option value="Receive">Incoming Collections</option>
                  <option value="Send">Outgoing Disbursements</option>
                </select>

                <select
                  className="form-input select-filter"
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value as any)}
                  style={{ width: '150px' }}
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

            {/* Table */}
            <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher / Ref #</th>
                    <th>Direction / Type</th>
                    <th>User / Partner Account</th>
                    <th>Method</th>
                    <th>Reference / Source Document</th>
                    <th style={{ textAlign: 'right' }}>Amount Settled (₹)</th>
                    <th>Status</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Voucher Slip</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                        No payment records found matching the active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedReceiptPayment(p)}
                        style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                        title="Click to view official settlement voucher"
                      >
                        <td style={{ fontWeight: 600 }}>{p.date}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Receipt size={14} color="var(--color-primary)" />
                            <strong style={{ color: 'var(--color-text-primary)' }}>{p.reference}</strong>
                          </div>
                        </td>
                        <td>
                          <PaymentDirectionBadge type={p.type} size="sm" />
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.partnerName}</span>
                        </td>
                        <td>
                          <PaymentMethodBadge method={p.paymentVia} size="sm" />
                        </td>
                        <td>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                            {p.sourceDocType ? `${p.sourceDocType} (${p.sourceDocId})` : p.reference}
                          </span>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: p.type === 'Receive' ? 'var(--color-primary)' : 'var(--color-danger)',
                          }}
                        >
                          {p.type === 'Receive' ? '+' : '-'}₹{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <PaymentStatusBadge status="Posted" size="sm" />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-ghost"
                            style={{ padding: '4px 8px', borderRadius: '6px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReceiptPayment(p);
                            }}
                            title="View Official Voucher"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Customer Receivables Due */}
        {activeTab === 'receivables' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header & Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <div className="search-bar-wrapper" style={{ maxWidth: '320px', width: '100%' }}>
                  <div className="search-bar-icon">
                    <Search size={15} strokeWidth={1.75} />
                  </div>
                  <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Search customer, invoice #..."
                    value={dueSearch}
                    onChange={(e) => setDueSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-input select-filter"
                  value={dueStatusFilter}
                  onChange={(e) => setDueStatusFilter(e.target.value as any)}
                  style={{ width: '160px' }}
                >
                  <option value="All">All Outstanding</option>
                  <option value="Overdue">Overdue Only</option>
                  <option value="Partial">Partially Paid</option>
                  <option value="Unpaid">Unpaid Invoices</option>
                </select>
              </div>

              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Total Outstanding Receivables: <strong style={{ color: '#0369a1' }}>₹{totalReceivablesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>

            {/* Invoices Due Table */}
            <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer Name</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th>Due Timeline</th>
                    <th style={{ textAlign: 'right' }}>Total Invoiced (₹)</th>
                    <th style={{ textAlign: 'right' }}>Amount Paid (₹)</th>
                    <th style={{ textAlign: 'right' }}>Amount Due (₹)</th>
                    <th>Payment Status</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceivables.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                        No outstanding customer invoices found. All receivables are settled!
                      </td>
                    </tr>
                  ) : (
                    filteredReceivables.map((inv) => {
                      const status = getInvoicePaymentStatus(inv);
                      return (
                        <tr key={inv.id}>
                          <td>
                            <strong style={{ color: 'var(--color-primary)' }}>{inv.invoiceNumber}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{inv.partnerName}</div>
                            {inv.reference && (
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Ref: {inv.reference}</div>
                            )}
                          </td>
                          <td>{inv.date}</td>
                          <td style={{ fontWeight: 600 }}>{inv.dueDate}</td>
                          <td>{getDueTimelineBadge(inv.dueDate)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            ₹{inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontWeight: 600 }}>
                            ₹{inv.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#0369a1', fontSize: '14px' }}>
                            ₹{inv.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <PaymentStatusBadge status={status} size="sm" />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenRegisterForDoc('Invoice', inv)}
                              leftIcon={<ArrowDownLeft size={13} />}
                            >
                              Collect Payment
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Vendor Payables Due */}
        {activeTab === 'payables' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header & Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <div className="search-bar-wrapper" style={{ maxWidth: '320px', width: '100%' }}>
                  <div className="search-bar-icon">
                    <Search size={15} strokeWidth={1.75} />
                  </div>
                  <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Search vendor, bill #, reference..."
                    value={dueSearch}
                    onChange={(e) => setDueSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-input select-filter"
                  value={dueStatusFilter}
                  onChange={(e) => setDueStatusFilter(e.target.value as any)}
                  style={{ width: '160px' }}
                >
                  <option value="All">All Outstanding</option>
                  <option value="Overdue">Overdue Only</option>
                  <option value="Partial">Partially Paid</option>
                  <option value="Unpaid">Unpaid Bills</option>
                </select>
              </div>

              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Total Outstanding Payables: <strong style={{ color: '#b91c1c' }}>₹{totalPayablesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>

            {/* Bills Due Table */}
            <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vendor Bill #</th>
                    <th>Vendor / Supplier</th>
                    <th>Supplier Reference</th>
                    <th>Bill Date</th>
                    <th>Due Date</th>
                    <th>Due Timeline</th>
                    <th style={{ textAlign: 'right' }}>Total Billed (₹)</th>
                    <th style={{ textAlign: 'right' }}>Amount Paid (₹)</th>
                    <th style={{ textAlign: 'right' }}>Amount Due (₹)</th>
                    <th>Payment Status</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayables.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                        No outstanding vendor bills found. All payables are settled!
                      </td>
                    </tr>
                  ) : (
                    filteredPayables.map((b) => {
                      const status = getBillPaymentStatus(b);
                      return (
                        <tr key={b.id}>
                          <td>
                            <strong style={{ color: 'var(--color-primary)' }}>{b.billNumber}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{b.partnerName}</div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{b.reference || '—'}</span>
                          </td>
                          <td>{b.date}</td>
                          <td style={{ fontWeight: 600 }}>{b.dueDate}</td>
                          <td>{getDueTimelineBadge(b.dueDate)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            ₹{b.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontWeight: 600 }}>
                            ₹{b.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#b91c1c', fontSize: '14px' }}>
                            ₹{b.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <PaymentStatusBadge status={status} size="sm" />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenRegisterForDoc('Bill', b)}
                              leftIcon={<ArrowUpRight size={13} />}
                            >
                              Pay Bill
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Partner Balances & Dues Summary */}
        {activeTab === 'partners' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>User & Entity Account Balances</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Consolidated receivables, payables, and net credit/debit balances across all business partners
                </p>
              </div>
            </div>

            <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User / Partner Entity</th>
                    <th>Role / Type</th>
                    <th>Email & Contact</th>
                    <th style={{ textAlign: 'right' }}>Total Invoiced (₹)</th>
                    <th style={{ textAlign: 'right' }}>Receivables Due (₹)</th>
                    <th style={{ textAlign: 'right' }}>Total Billed (₹)</th>
                    <th style={{ textAlign: 'right' }}>Payables Due (₹)</th>
                    <th style={{ textAlign: 'right' }}>Net Exposure (₹)</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Quick Settle</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerBalances.map((pb) => (
                    <tr key={pb.contact.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{pb.contact.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{pb.contact.address.city}, {pb.contact.address.state}</div>
                      </td>
                      <td>
                        <span
                          className={`badge-pill ${
                            pb.contact.type === 'customer'
                              ? 'badge-completed'
                              : pb.contact.type === 'vendor'
                              ? 'badge-pending'
                              : 'badge-neutral'
                          }`}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {pb.contact.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px' }}>{pb.contact.email}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{pb.contact.phone}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{pb.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: pb.receivablesDue > 0 ? '#0369a1' : 'var(--color-text-muted)' }}>
                        ₹{pb.receivablesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{pb.totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: pb.payablesDue > 0 ? '#b91c1c' : 'var(--color-text-muted)' }}>
                        ₹{pb.payablesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: '13px',
                          color:
                            pb.netDue > 0
                              ? '#0369a1'
                              : pb.netDue < 0
                              ? '#b91c1c'
                              : 'var(--color-text-muted)',
                        }}
                      >
                        {pb.netDue > 0 ? `+₹${pb.netDue.toLocaleString()}` : pb.netDue < 0 ? `-₹${Math.abs(pb.netDue).toLocaleString()}` : '₹0.00'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {pb.receivablesDue > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const inv = invoices.find((i) => i.partnerId === pb.contact.id && i.amountDue > 0);
                              if (inv) {
                                handleOpenRegisterForDoc('Invoice', inv);
                              } else {
                                handleOpenGeneralRegister('Receive');
                              }
                            }}
                          >
                            Receive
                          </Button>
                        ) : pb.payablesDue > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const bill = bills.find((b) => b.partnerId === pb.contact.id && b.amountDue > 0);
                              if (bill) {
                                handleOpenRegisterForDoc('Bill', bill);
                              } else {
                                handleOpenGeneralRegister('Send');
                              }
                            }}
                          >
                            Disburse
                          </Button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                            <CheckCircle2 size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Register Payment Modal */}
      <RegisterPaymentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        defaultType={registerModalProps.defaultType}
        defaultPartnerId={registerModalProps.defaultPartnerId}
        defaultDocType={registerModalProps.defaultDocType}
        defaultDocId={registerModalProps.defaultDocId}
        defaultAmount={registerModalProps.defaultAmount}
        onSuccess={() => {}}
      />

      {/* Interactive Official Payment Receipt Modal */}
      {selectedReceiptPayment && (
        <PaymentReceiptModal
          payment={selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
          onNavigateToJournal={() => {
            setSelectedReceiptPayment(null);
            onNavigate('/journal-entries');
          }}
        />
      )}
    </div>
  );
};

export default PaymentHistoryPage;
