import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getMyScopedDocumentById, PortalDocument, DocumentLineItem } from '../api';
import { DemoBankPaymentForm } from '../components/DemoBankPaymentForm';

export interface PortalDocumentDetailPageProps {
  documentId: string;
  onBack: () => void;
}

export const PortalDocumentDetailPage: React.FC<PortalDocumentDetailPageProps> = ({
  documentId,
  onBack,
}) => {
  const [doc, setDoc] = useState<PortalDocument | null>(() => getMyScopedDocumentById(documentId));
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  if (!doc) {
    return (
      <div className="card-panel" style={{ textAlign: 'center', padding: '48px' }}>
        <h3 className="card-title">Document Not Found or Access Denied</h3>
        <p className="card-subtitle">
          You do not have permission to view this document or it is not assigned to your account.
        </p>
        <button type="button" className="btn btn-outline btn-sm" onClick={onBack} style={{ marginTop: '16px' }}>
          &larr; Back to My List
        </button>
      </div>
    );
  }

  const isBill = doc.type === 'bill';

  const handlePaymentSuccess = (updatedDoc: PortalDocument) => {
    setDoc(updatedDoc);
    setShowPaymentModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Back Action & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusBadge status={doc.status} />
          {doc.status === 'Unpaid' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowPaymentModal(true)}
              style={{ gap: '6px' }}
            >
              <CreditCard size={15} />
              <span>
                {isBill ? 'Record Settlement' : 'Pay Outstanding'} (₹{doc.amountDue.toFixed(2)})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Details Card */}
      <div className="card-panel" style={{ padding: '32px' }}>
        {/* Header Title Block */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              {isBill ? 'Vendor Supply Bill' : 'Customer Sales Invoice'} (Read Only)
            </span>
            <h1 className="page-title" style={{ fontSize: '26px', marginTop: '4px' }}>
              {doc.number}
            </h1>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <strong>Date:</strong> {doc.date}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <strong>Due Date:</strong> {doc.dueDate}
            </span>
          </div>
        </div>

        {/* Partner Info Box */}
        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            margin: '20px 0',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {isBill ? 'Vendor / Supplier (Self)' : 'Customer / Recipient (Self)'}
          </span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
            {doc.partnerName}
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '12px' }}>
            {isBill ? 'Supplied Raw Materials & Services' : 'Purchased Furniture & Products'}
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>{isBill ? 'Raw Material / Item Description' : 'Product / Furniture Item'}</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>Qty</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.lines.map((line: DocumentLineItem, idx: number) => (
                  <tr key={line.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{line.product}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>{line.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{line.unitPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{line.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Balance Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <div
            style={{
              width: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backgroundColor: 'var(--color-bg)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Amount:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>₹{doc.total.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Amount Paid:</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{doc.amountPaid.toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {isBill ? 'Balance Due:' : 'Amount Due:'}
              </span>
              <strong style={{ color: doc.amountDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>
                ₹{doc.amountDue.toFixed(2)}
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
