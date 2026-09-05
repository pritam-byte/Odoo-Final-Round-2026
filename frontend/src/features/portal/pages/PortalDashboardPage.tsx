import React from 'react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getMyScopedDocuments } from '../api';
import { CURRENT_USER } from '../../../lib/auth';

export interface PortalDashboardPageProps {
  onNavigate: (view: string, docId?: string) => void;
}

export const PortalDashboardPage: React.FC<PortalDashboardPageProps> = ({ onNavigate }) => {
  const documents = getMyScopedDocuments();
  const unpaidDocs = documents.filter(d => d.status === 'Unpaid');
  const paidDocs = documents.filter(d => d.status === 'Paid');

  const totalDue = unpaidDocs.reduce((acc, d) => acc + d.amountDue, 0);
  const totalPaid = paidDocs.reduce((acc, d) => acc + d.amountPaid, 0);

  const invoicesCount = documents.filter(d => d.type === 'invoice').length;
  const billsCount = documents.filter(d => d.type === 'bill').length;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="ds-card" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
        borderLeft: '4px solid var(--color-primary-teal)',
        padding: '24px 28px',
        marginBottom: '24px'
      }}>
        <h1 className="page-title" style={{ margin: '0 0 6px 0', fontSize: '1.4rem' }}>
          Welcome, {CURRENT_USER.name} 👋
        </h1>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Here is your personal settlement portal overview. View your invoices, vendor bills, and directly pay outstanding dues.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Total Outstanding Dues */}
        <div className="ds-card" style={{ padding: '20px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-gray-medium)', textTransform: 'uppercase' }}>
              Total Outstanding Dues
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: totalDue > 0 ? 'var(--color-warning-amber)' : 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: totalDue > 0 ? 'var(--color-warning-text)' : 'var(--color-primary-teal-text)' }}>
            ${totalDue.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', marginTop: '4px', display: 'block' }}>
            {unpaidDocs.length} pending document{unpaidDocs.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Total Settled */}
        <div className="ds-card" style={{ padding: '20px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-gray-medium)', textTransform: 'uppercase' }}>
              Total Settled
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
            ${totalPaid.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', marginTop: '4px', display: 'block' }}>
            {paidDocs.length} paid in full
          </span>
        </div>

        {/* My Invoices Count */}
        <div className="ds-card" style={{ padding: '20px', margin: 0 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-gray-medium)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            My Invoices
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
            {invoicesCount}
          </div>
          <Button
            variant="secondary"
            onClick={() => onNavigate('invoices')}
            style={{ marginTop: '8px', padding: '4px 10px', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
          >
            Open Invoices &rarr;
          </Button>
        </div>

        {/* My Bills Count */}
        <div className="ds-card" style={{ padding: '20px', margin: 0 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-gray-medium)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            My Bills
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
            {billsCount}
          </div>
          <Button
            variant="secondary"
            onClick={() => onNavigate('bills')}
            style={{ marginTop: '8px', padding: '4px 10px', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
          >
            Open Bills &rarr;
          </Button>
        </div>
      </div>

      {/* Actionable Unpaid / Recent Invoices Section */}
      <div className="ds-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 className="section-header" style={{ margin: '0 0 4px 0' }}>Recent Dues & Transactions</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-medium)' }}>
              Click any invoice or bill to inspect line items or trigger settlement.
            </span>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('invoices')}>
            View All Records
          </Button>
        </div>

        <div className="ds-table-container">
          <table className="ds-table">
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
                <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('detail', doc.id)}>
                  <td>{doc.date}</td>
                  <td><strong>{doc.number}</strong></td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontSize: '0.8125rem', color: 'var(--color-gray-medium)' }}>
                      {doc.type}
                    </span>
                  </td>
                  <td>${doc.total.toFixed(2)}</td>
                  <td style={{ fontWeight: doc.amountDue > 0 ? 600 : 400, color: doc.amountDue > 0 ? 'var(--color-warning-text)' : 'var(--color-gray-medium)' }}>
                    ${doc.amountDue.toFixed(2)}
                  </td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant={doc.status === 'Unpaid' ? 'primary' : 'secondary'}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('detail', doc.id);
                      }}
                    >
                      {doc.status === 'Unpaid' ? 'Pay Now' : 'View Details'}
                    </Button>
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
