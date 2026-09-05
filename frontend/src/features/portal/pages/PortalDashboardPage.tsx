import React from 'react';
import {
  IndianRupee,
  CheckCircle,
  FileText,
  Receipt,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getMyScopedDocuments } from '../api';
import { getStoredUser } from '../../../lib/auth';

export interface PortalDashboardPageProps {
  onNavigate: (view: string, docId?: string) => void;
}

export const PortalDashboardPage: React.FC<PortalDashboardPageProps> = ({ onNavigate }) => {
  const currentUser = getStoredUser();
  const userName = currentUser?.name || 'Customer';
  const pType = currentUser?.partnerType || 'Both';

  const allDocs = getMyScopedDocuments();
  const documents = allDocs.filter((d) => {
    if (pType === 'Customer') return d.type === 'invoice';
    if (pType === 'Vendor') return d.type === 'bill';
    return true;
  });

  const unpaidDocs = documents.filter((d) => d.status === 'Unpaid');
  const paidDocs = documents.filter((d) => d.status === 'Paid');

  const totalDue = unpaidDocs.reduce((acc, d) => acc + d.amountDue, 0);
  const totalPaid = paidDocs.reduce((acc, d) => acc + d.amountPaid, 0);

  const invoicesCount = allDocs.filter((d) => d.type === 'invoice').length;
  const billsCount = allDocs.filter((d) => d.type === 'bill').length;
  const totalLineItems = documents.reduce((acc, d) => acc + (d.lines?.length || 0), 0);

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
        {/* Total Outstanding Dues / Payables */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">
              {pType === 'Vendor' ? 'OUTSTANDING SUPPLY PAYABLES' : 'TOTAL OUTSTANDING DUES'}
            </span>
            <div className="stat-icon-badge amber">
              <IndianRupee size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-number" style={{ color: totalDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>
            ₹{totalDue.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {unpaidDocs.length} pending {pType === 'Vendor' ? 'bill' : 'document'}{unpaidDocs.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Total Settled */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">
              {pType === 'Vendor' ? 'TOTAL PAYMENTS RECEIVED' : 'TOTAL SETTLED'}
            </span>
            <div className="stat-icon-badge teal">
              <CheckCircle size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-number">
            ₹{totalPaid.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {paidDocs.length} paid in full
          </div>
        </div>

        {/* Primary Operational Card */}
        {pType === 'Vendor' ? (
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">MY SUPPLY BILLS</span>
              <div className="stat-icon-badge teal">
                <Receipt size={20} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-number">
              {billsCount}
            </div>
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
        ) : (
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">MY INVOICES</span>
              <div className="stat-icon-badge purple">
                <FileText size={20} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-number">
              {invoicesCount}
            </div>
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
        )}

        {/* Secondary Card */}
        {pType === 'Both' ? (
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">MY VENDOR BILLS</span>
              <div className="stat-icon-badge teal">
                <Receipt size={20} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-number">
              {billsCount}
            </div>
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
        ) : (
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">
                {pType === 'Vendor' ? 'RAW MATERIAL LOTS' : 'PURCHASED FURNITURE'}
              </span>
              <div className="stat-icon-badge purple">
                <FileText size={20} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-number">
              {totalLineItems}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {pType === 'Vendor' ? 'Supply line items delivered' : 'Furniture order items'}
            </div>
          </div>
        )}
      </div>

      {/* Recent Dues & Transactions Panel */}
      <div className="card-panel">
        <div className="card-header">
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
                : 'Click any invoice or bill to inspect line items or trigger settlement.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate(pType === 'Vendor' ? 'bills' : 'invoices')}
          >
            View All Records
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Doc #</th>
                <th>Type</th>
                <th>Total</th>
                <th>Amount Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate('detail', doc.id)}
                >
                  <td style={{ fontWeight: 500 }}>{doc.date}</td>
                  <td>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{doc.number}</strong>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      {doc.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{doc.total.toFixed(2)}</td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: doc.amountDue > 0 ? 'var(--color-warning-text)' : 'var(--color-text-muted)',
                    }}
                  >₹{doc.amountDue.toFixed(2)}
                  </td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortalDashboardPage;
