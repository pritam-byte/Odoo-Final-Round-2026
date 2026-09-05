import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getMyScopedDocumentById, PortalDocument, DocumentLineItem } from '../api';
import { DemoBankPaymentForm } from '../components/DemoBankPaymentForm';

export interface PortalDocumentDetailPageProps {
  documentId: string;
  onBack: () => void;
}

export const PortalDocumentDetailPage: React.FC<PortalDocumentDetailPageProps> = ({
  documentId,
  onBack
}) => {
  const [doc, setDoc] = useState<PortalDocument | null>(() => getMyScopedDocumentById(documentId));
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  if (!doc) {
    return (
      <div className="ds-card" style={{ textAlign: 'center', padding: '48px' }}>
        <h3>Document Not Found or Access Denied</h3>
        <p className="text-muted">You do not have permission to view this document or it does not exist.</p>
        <Button variant="secondary" onClick={onBack}>&larr; Back to My List</Button>
      </div>
    );
  }

  const handlePaymentSuccess = (updatedDoc: PortalDocument) => {
    setDoc(updatedDoc);
    setShowPaymentModal(false);
  };

  return (
    <div>
      {/* Top Back Action & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--color-primary-teal)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          &larr; Back to List
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusBadge status={doc.status} />
          {doc.status === 'Unpaid' && (
            <Button variant="primary" onClick={() => setShowPaymentModal(true)}>
              💳 Pay Outstanding ($${doc.amountDue.toFixed(2)})
            </Button>
          )}
        </div>
      </div>

      {/* Main Document Details Card (Read-only) */}
      <div className="ds-card" style={{ padding: '32px' }}>
        {/* Header Title Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {doc.type === 'bill' ? 'Vendor Bill' : 'Customer Invoice'} (Read Only)
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 0 0', color: 'var(--color-charcoal-dark)' }}>
              {doc.number}
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-medium)', display: 'block' }}>Date: {doc.date}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-medium)', display: 'block' }}>Due Date: {doc.dueDate}</span>
          </div>
        </div>

        {/* Partner Info */}
        <div style={{ marginBottom: '28px', backgroundColor: 'var(--color-gray-bg)', padding: '16px 20px', borderRadius: 'var(--button-radius)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', textTransform: 'uppercase', fontWeight: 600 }}>Partner / Recipient (Self)</span>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-charcoal-dark)', marginTop: '2px' }}>
            {doc.partnerName}
          </div>
        </div>

        {/* Line Items Table (Read Only) */}
        <h3 className="section-header">Line Items</h3>
        <div className="ds-table-container" style={{ marginBottom: '28px' }}>
          <table className="ds-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product / Service</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((line: DocumentLineItem, idx: number) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--color-gray-medium)' }}>{idx + 1}</td>
                  <td><strong>{line.product}</strong></td>
                  <td style={{ textAlign: 'center' }}>{line.quantity}</td>
                  <td style={{ textAlign: 'right' }}>${line.unitPrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${line.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Balance Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-gray-medium)' }}>Total Amount:</span>
              <strong style={{ color: 'var(--color-charcoal-dark)' }}>${doc.total.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-gray-medium)' }}>Amount Paid:</span>
              <span style={{ color: 'var(--color-primary-teal-text)', fontWeight: 600 }}>${doc.amountPaid.toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-gray-border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>Amount Due:</span>
              <strong style={{ color: doc.amountDue > 0 ? 'var(--color-warning-text)' : 'var(--color-primary-teal-text)' }}>
                ${doc.amountDue.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal Component */}
      {showPaymentModal && (
        <DemoBankPaymentForm
          document={doc}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PortalDocumentDetailPage;
