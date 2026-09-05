import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Receipt, Clock, FileText } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getMyScopedDocumentById, getMyPayments, PortalDocument, DocumentLineItem, PortalPayment } from '../api';
import { DemoBankPaymentForm } from '../components/DemoBankPaymentForm';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';

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
  const [selectedVoucher, setSelectedVoucher] = useState<PortalPayment | null>(null);

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

  const handleOpenVoucher = () => {
    const allPayments = getMyPayments();
    const matched = allPayments.find(
      (p) => p.documentId === doc.id || p.documentNumber === doc.number
    );
    if (matched) {
      setSelectedVoucher(matched);
    } else {
      // Fallback synthetic voucher for paid document
      setSelectedVoucher({
        id: `pay_${doc.id}`,
        documentId: doc.id,
        documentNumber: doc.number,
        documentType: doc.type,
        amount: doc.amountPaid || doc.total,
        date: doc.date,
        paymentMethod: 'Bank',
        reference: `PAY/2026/${doc.id.replace(/[^0-9]/g, '') || '9012'}`,
        partnerName: doc.partnerName || 'Supplier',
        note: `Disbursement settlement voucher for ${doc.number}`,
        status: 'Confirm',
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Back Action & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to {isBill ? 'Supply Bills' : 'Invoices'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusBadge status={doc.status} />

          {/* Customer Action: Pay Invoice */}
          {!isBill && doc.status === 'Unpaid' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowPaymentModal(true)}
              style={{ gap: '6px' }}
            >
              <CreditCard size={15} />
              <span>Pay Outstanding (₹{doc.amountDue.toFixed(2)})</span>
            </button>
          )}

          {/* Vendor Tracking: If Unpaid -> Awaiting Disbursement Badge */}
          {isBill && doc.status === 'Unpaid' && (
            <div
              className="badge-pill badge-pending"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Clock size={13} />
              <span>Awaiting Company Disbursement</span>
            </div>
          )}

          {/* View Payment Voucher / Receipt if Paid */}
          {doc.status === 'Paid' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleOpenVoucher}
              style={{ gap: '6px' }}
            >
              <Receipt size={14} />
              <span>{isBill ? 'View Payment Voucher' : 'View Payment Receipt'}</span>
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isBill ? (
                <>
                  <Receipt size={13} /> Vendor Supply Bill (Read Only)
                </>
              ) : (
                <>
                  <FileText size={13} /> Customer Sales Invoice (Read Only)
                </>
              )}
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
            {isBill ? 'Supplier / Payee (Self)' : 'Customer / Billed To (Self)'}
          </span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
            {doc.partnerName}
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '12px' }}>
            {isBill ? 'Supplied Raw Materials & Procurement Items' : 'Purchased Furniture & Products'}
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>{isBill ? 'Raw Material Description' : 'Product / Furniture Item'}</th>
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
              width: '340px',
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
              <span style={{ color: 'var(--color-text-muted)' }}>
                {isBill ? 'Amount Disbursed:' : 'Amount Paid:'}
              </span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{doc.amountPaid.toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {isBill ? 'Pending Company Payout:' : 'Amount Due:'}
              </span>
              <strong style={{ color: doc.amountDue > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>
                ₹{doc.amountDue.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal Component (Customer checkout flow) */}
      {showPaymentModal && (
        <DemoBankPaymentForm
          document={doc}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payment Receipt / Voucher Modal */}
      {selectedVoucher && (
        <PaymentReceiptModal
          payment={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
};

export default PortalDocumentDetailPage;
