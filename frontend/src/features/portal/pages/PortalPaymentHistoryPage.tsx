import React, { useState, useEffect } from 'react';
import { getMyPayments, PortalPayment } from '../api';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';
import { Receipt, Eye } from 'lucide-react';

export const PortalPaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<PortalPayment[]>(() => getMyPayments());
  const [selectedPayment, setSelectedPayment] = useState<PortalPayment | null>(null);

  // Auto-open modal if URL has ref query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      const matched = payments.find((p) => p.reference.toLowerCase() === refParam.toLowerCase());
      if (matched) {
        setSelectedPayment(matched);
      }
    }
  }, [payments]);

  const handleUpdatePayment = (updated: PortalPayment) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedPayment(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="content-header">
        <div>
          <h1 className="page-title">Payment History</h1>
          <p className="page-subtitle">
            Direct transaction receipts for settled dues. Click on any record to view, print, or share the official receipt.
          </p>
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
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPayment(p)}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    title="Click to view & print payment receipt"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Receipt size={16} color="#818cf8" />
                        <strong style={{ color: 'var(--color-text-primary)' }}>{p.reference}</strong>
                      </div>
                    </td>
                    <td>
                      {p.documentNumber} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>({p.documentType})</span>
                    </td>
                    <td>{p.date}</td>
                    <td>
                      <span className={`badge-pill ${p.paymentMethod === 'Bank' ? 'badge-paid' : 'badge-pending'}`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(p);
                        }}
                        title="View Details"
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

      {/* Interactive Payment Receipt Modal */}
      {selectedPayment && (
        <PaymentReceiptModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onUpdate={handleUpdatePayment}
        />
      )}
    </div>
  );
};

export default PortalPaymentHistoryPage;

