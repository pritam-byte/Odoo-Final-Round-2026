import React from 'react';
import { getMyPayments } from '../api';

export const PortalPaymentHistoryPage: React.FC = () => {
  const payments = getMyPayments();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="content-header">
        <div>
          <h1 className="page-title">Payment History</h1>
          <p className="page-subtitle">Direct transaction receipts for settled dues.</p>
        </div>
      </div>

      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt / Memo #</th>
                <th>Document Ref</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
                <th style={{ textAlign: 'right' }}>Amount Settled</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{p.reference}</strong>
                    </td>
                    <td>
                      {p.documentNumber} ({p.documentType})
                    </td>
                    <td>{p.date}</td>
                    <td>
                      <span className={`badge-pill ${p.paymentMethod === 'Bank' ? 'badge-paid' : 'badge-pending'}`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>₹{p.amount.toFixed(2)}
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

export default PortalPaymentHistoryPage;
