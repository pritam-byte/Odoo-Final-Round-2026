import React from 'react';
import { getMyPayments } from '../api';

export const PortalPaymentHistoryPage: React.FC = () => {
  const payments = getMyPayments();

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: '0 0 4px 0' }}>Payment History</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Direct transaction ledger and receipts for settled dues.
        </p>
      </div>

      <div className="ds-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ds-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Document</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Reference</th>
              <th style={{ textAlign: 'right' }}>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-gray-medium)' }}>
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.reference}</strong></td>
                  <td>{p.documentNumber} ({p.documentType})</td>
                  <td>{p.date}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--pill-radius)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: p.paymentMethod === 'Bank' ? 'var(--color-primary-teal-light)' : 'var(--color-warning-bg)',
                      color: p.paymentMethod === 'Bank' ? 'var(--color-primary-teal-text)' : 'var(--color-warning-text)'
                    }}>
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td>{p.reference}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary-teal-text)' }}>
                    ${p.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortalPaymentHistoryPage;
