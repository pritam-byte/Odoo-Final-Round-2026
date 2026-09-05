import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  CheckCircle,
  FileText,
  Receipt,
  ArrowRight,
  CreditCard,
  Building2,
  Package,
} from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { getMyScopedDocuments } from '../api';
import { UserAccount } from '../../auth/schemas';
import { getStoredUser, CURRENT_USER } from '../../../lib/auth';

export interface PortalDashboardPageProps {
  onNavigate: (view: string, docId?: string) => void;
  user?: UserAccount | null;
}

export const PortalDashboardPage: React.FC<PortalDashboardPageProps> = ({ onNavigate, user }) => {
  const currentUser = user || getStoredUser() || CURRENT_USER;
  const pType = currentUser?.partnerType || 'Both';
  const userName = currentUser?.name || 'User';

  const [dualFilter, setDualFilter] = useState<'ALL' | 'invoice' | 'bill'>('ALL');
  const [allScopedDocs, setAllScopedDocs] = useState(() => getMyScopedDocuments());

  useEffect(() => {
    const reload = () => setAllScopedDocs(getMyScopedDocuments());
    reload();
    window.addEventListener('portal:payment', reload);
    return () => window.removeEventListener('portal:payment', reload);
  }, [currentUser?.partnerType]);

  // Filter based on dual filter if in Dual mode
  const displayedDocs = allScopedDocs.filter((d) => {
    if (pType === 'Both' && dualFilter !== 'ALL') {
      return d.type === dualFilter;
    }
    return true;
  });

  const unpaidDocs = displayedDocs.filter((d) => d.status === 'Unpaid');
  const paidDocs = displayedDocs.filter((d) => d.status === 'Paid');

  const totalDue = unpaidDocs.reduce((acc, d) => acc + d.amountDue, 0);
  const totalPaid = paidDocs.reduce((acc, d) => acc + d.amountPaid, 0);

  const invoices = allScopedDocs.filter((d) => d.type === 'invoice');
  const bills = allScopedDocs.filter((d) => d.type === 'bill');

  const customerDue = invoices
    .filter((d) => d.status === 'Unpaid')
    .reduce((acc, d) => acc + d.amountDue, 0);
  const vendorDue = bills
    .filter((d) => d.status === 'Unpaid')
    .reduce((acc, d) => acc + d.amountDue, 0);

  const totalFurnitureItems = invoices.reduce(
    (acc, d) => acc + (d.lines?.reduce((lAcc, l) => lAcc + l.quantity, 0) || 0),
    0
  );
  const totalSupplyLots = bills.reduce(
    (acc, d) => acc + (d.lines?.reduce((lAcc, l) => lAcc + l.quantity, 0) || 0),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner Card */}
      <div
        className="card-panel"
        style={{
          borderLeft: '4px solid var(--color-primary)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="page-title" style={{ fontSize: '22px' }}>
            Welcome, {userName} 👋
          </h1>
          <p className="page-subtitle" style={{ fontSize: '14px' }}>
            {pType === 'Vendor'
              ? 'Here is your vendor procurement portal overview. Track raw material supply bills, outstanding payables, and settlement history.'
              : pType === 'Both'
              ? 'Here is your dual partner portal overview. View customer billing invoices, raw material vendor bills, and directly manage dues.'
              : 'Here is your customer billing portal overview. View your furniture purchases, invoices, and directly pay outstanding dues.'}
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stat-grid">
        {pType === 'Both' ? (
          <>
            {/* Card 1: Customer Dues */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">CUSTOMER INVOICE DUES</span>
                <div className="stat-icon-badge amber">
                  <IndianRupee size={20} strokeWidth={2} />
                </div>
              </div>
              <div
                className="stat-number"
                style={{ color: customerDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}
              >
                ₹{customerDue.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {invoices.filter((d) => d.status === 'Unpaid').length} unpaid sales invoices
              </div>
            </div>

            {/* Card 2: Vendor Supply Payables */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">SUPPLY BILL PAYABLES</span>
                <div className="stat-icon-badge teal">
                  <Receipt size={20} strokeWidth={2} />
                </div>
              </div>
              <div
                className="stat-number"
                style={{ color: vendorDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}
              >
                ₹{vendorDue.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {bills.filter((d) => d.status === 'Unpaid').length} pending vendor bills
              </div>
            </div>

            {/* Card 3: Invoices Navigation */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">MY INVOICES</span>
                <div className="stat-icon-badge purple">
                  <FileText size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">{invoices.length}</div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('invoices')}
                style={{ marginTop: '4px', width: '100%' }}
              >
                <span>Open Invoices</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 4: Bills Navigation */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">MY VENDOR BILLS</span>
                <div className="stat-icon-badge teal">
                  <Building2 size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">{bills.length}</div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('bills')}
                style={{ marginTop: '4px', width: '100%' }}
              >
                <span>Open Bills</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        ) : pType === 'Vendor' ? (
          <>
            {/* Vendor Card 1: Outstanding Supply Payables */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">OUTSTANDING SUPPLY BALANCE</span>
                <div className="stat-icon-badge amber">
                  <IndianRupee size={20} strokeWidth={2} />
                </div>
              </div>
              <div
                className="stat-number"
                style={{ color: totalDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}
              >
                ₹{totalDue.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {unpaidDocs.length} pending supply bill{unpaidDocs.length === 1 ? '' : 's'}
              </div>
            </div>

            {/* Vendor Card 2: Total Received */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">TOTAL PAYOUTS RECEIVED</span>
                <div className="stat-icon-badge teal">
                  <CheckCircle size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">₹{totalPaid.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {paidDocs.length} bills settled in full
              </div>
            </div>

            {/* Vendor Card 3: Supply Bills */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">MY SUPPLY BILLS</span>
                <div className="stat-icon-badge teal">
                  <Receipt size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">{displayedDocs.length}</div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('bills')}
                style={{ marginTop: '4px', width: '100%' }}
              >
                <span>Open Supply Bills</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Vendor Card 4: Raw Material Lots */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">RAW MATERIAL LOTS</span>
                <div className="stat-icon-badge purple">
                  <Package size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">{totalSupplyLots}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Total supply lots delivered
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Customer Card 1: Outstanding Dues */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">TOTAL OUTSTANDING DUES</span>
                <div className="stat-icon-badge amber">
                  <IndianRupee size={20} strokeWidth={2} />
                </div>
              </div>
              <div
                className="stat-number"
                style={{ color: totalDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}
              >
                ₹{totalDue.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {unpaidDocs.length} pending invoice{unpaidDocs.length === 1 ? '' : 's'}
              </div>
            </div>

            {/* Customer Card 2: Total Settled */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">TOTAL SETTLED</span>
                <div className="stat-icon-badge teal">
                  <CheckCircle size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">₹{totalPaid.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {paidDocs.length} invoices paid in full
              </div>
            </div>

            {/* Customer Card 3: Invoices */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">MY INVOICES</span>
                <div className="stat-icon-badge purple">
                  <FileText size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">{displayedDocs.length}</div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('invoices')}
                style={{ marginTop: '4px', width: '100%' }}
              >
                <span>Open Invoices</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Customer Card 4: Purchased Furniture */}
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">PURCHASED FURNITURE</span>
                <div className="stat-icon-badge purple">
                  <Package size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-number">{totalFurnitureItems}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Total furniture items purchased
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Dues & Transactions Panel */}
      <div className="card-panel">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title">
              {pType === 'Vendor'
                ? 'Recent Vendor Supply Bills'
                : pType === 'Customer'
                ? 'Recent Customer Invoices'
                : 'Recent Dues & Transactions'}
            </h3>
            <p className="card-subtitle">
              {pType === 'Vendor'
                ? 'Click any raw material bill to inspect supply line items and settlement status.'
                : pType === 'Customer'
                ? 'Click any invoice to inspect furniture items or pay outstanding balance.'
                : 'Click any document to inspect line items or trigger settlement.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {pType === 'Both' && (
              <CustomSelect<'ALL' | 'invoice' | 'bill'>
                value={dualFilter}
                onChange={(val) => setDualFilter(val)}
                size="sm"
                options={[
                  { value: 'ALL', label: 'All Document Types' },
                  { value: 'invoice', label: 'Customer Invoices' },
                  { value: 'bill', label: 'Vendor Supply Bills' },
                ]}
              />
            )}

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate(pType === 'Vendor' ? 'bills' : 'invoices')}
            >
              View All Records
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Document #</th>
                <th>{pType === 'Vendor' ? 'Supplier (Self)' : 'Customer / Recipient'}</th>
                {pType === 'Both' && <th>Type</th>}
                <th>Total</th>
                <th>{pType === 'Vendor' ? 'Balance Due' : 'Amount Due'}</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedDocs.length === 0 ? (
                <tr>
                  <td
                    colSpan={pType === 'Both' ? 8 : 7}
                    style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}
                  >
                    No records found matching the filter.
                  </td>
                </tr>
              ) : (
                displayedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate('detail', doc.id)}
                  >
                    <td style={{ fontWeight: 500 }}>{doc.date}</td>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{doc.number}</strong>
                    </td>
                    <td>{doc.partnerName}</td>
                    {pType === 'Both' && (
                      <td>
                        <span
                          className={`badge-pill ${
                            doc.type === 'invoice' ? 'badge-paid' : 'badge-pending'
                          }`}
                          style={{ fontSize: '11px', textTransform: 'capitalize' }}
                        >
                          {doc.type === 'invoice' ? 'Invoice' : 'Supply Bill'}
                        </span>
                      </td>
                    )}
                    <td style={{ fontWeight: 600 }}>₹{doc.total.toFixed(2)}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: doc.amountDue > 0 ? 'var(--color-warning-text)' : 'var(--color-text-muted)',
                      }}
                    >
                      ₹{doc.amountDue.toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {doc.type === 'invoice' ? (
                        <button
                          type="button"
                          className={`btn btn-sm ${doc.status === 'Unpaid' ? 'btn-primary' : 'btn-outline'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('detail', doc.id);
                          }}
                        >
                          {doc.status === 'Unpaid' ? (
                            <>
                              <CreditCard size={13} />
                              <span>Pay Now</span>
                            </>
                          ) : (
                            <span>View Details</span>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('detail', doc.id);
                          }}
                        >
                          {doc.status === 'Paid' ? (
                            <>
                              <Receipt size={13} />
                              <span>View Voucher</span>
                            </>
                          ) : (
                            <span>View Bill</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortalDashboardPage;
