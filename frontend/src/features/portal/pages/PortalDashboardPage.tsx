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

  const documents = getMyScopedDocuments();
  const unpaidDocs = documents.filter((d) => d.status === 'Unpaid');
  const paidDocs = documents.filter((d) => d.status === 'Paid');

  const totalDue = unpaidDocs.reduce((acc, d) => acc + d.amountDue, 0);
  const totalPaid = paidDocs.reduce((acc, d) => acc + d.amountPaid, 0);

  const invoicesCount = documents.filter((d) => d.type === 'invoice').length;
  const billsCount = documents.filter((d) => d.type === 'bill').length;

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
            Here is your personal settlement portal overview. View your invoices, vendor bills, and directly pay outstanding dues.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stat-grid">
        {/* Total Outstanding Dues */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">TOTAL OUTSTANDING DUES</span>
            <div className="stat-icon-badge amber">
              <IndianRupee size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-number" style={{ color: totalDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>₹{totalDue.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {unpaidDocs.length} pending document{unpaidDocs.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Total Settled */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">TOTAL SETTLED</span>
            <div className="stat-icon-badge teal">
              <CheckCircle size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-number">₹{totalPaid.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {paidDocs.length} paid in full
          </div>
        </div>

        {/* My Invoices Count */}
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

        {/* My Bills Count */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">MY BILLS</span>
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
      </div>

      {/* Recent Dues & Transactions Panel */}
      <div className="card-panel">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Dues & Transactions</h3>
            <p className="card-subtitle">Click any invoice or bill to inspect line items or trigger settlement.</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('invoices')}
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
