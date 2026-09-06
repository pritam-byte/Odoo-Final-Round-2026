import React, { useState } from 'react';
import { X, Building2, Banknote, IndianRupee, Lock, CheckCircle2 } from 'lucide-react';
import { PortalDocument, processPortalPayment } from '../api';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';

export interface DemoBankPaymentFormProps {
  document: PortalDocument;
  onClose: () => void;
  onSuccess: (updatedDoc: PortalDocument) => void;
}

export const DemoBankPaymentForm: React.FC<DemoBankPaymentFormProps> = ({
  document,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'Bank' | 'Cash'>('Bank');
  // Fixed exact due amount (read-only, non-modifiable)
  const amount = document.amountDue;
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('No outstanding balance due for this invoice.');
      return;
    }
    if (!date) {
      setError('Please select a payment date.');
      return;
    }

    setIsProcessing(true);
    const result = processPortalPayment({
      documentId: document.id,
      amount: Number(amount),
      date,
      paymentMethod,
      reference: reference.trim() || undefined,
    });

    setIsProcessing(false);
    if (result.success && result.document) {
      onSuccess(result.document);
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(3px)',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        className="card-panel custom-modal-box"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          margin: 'auto',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Modal Header */}
        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                letterSpacing: '0.05em',
              }}
            >
              Customer Invoice Checkout
            </span>
            <h3 className="card-title" style={{ fontSize: '18px', marginTop: '2px', margin: 0 }}>
              Pay Dues: {document.number}
            </h3>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              marginTop: '12px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {/* Summary Box */}
          <div
            className="responsive-modal-grid-2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '14px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Invoice
              </span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                ₹{document.total.toFixed(2)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Amount Due
              </span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                ₹{document.amountDue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Amount to Pay (LOCKED / READ-ONLY) */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Payable Amount (Fixed)
              </label>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-text-muted)',
                }}
              >
                <Lock size={11} /> Exact Balance Due
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IndianRupee size={14} />
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  ₹{amount.toFixed(2)}
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  backgroundColor: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  fontWeight: 500,
                }}
              >
                Full Settlement
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div className="responsive-modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank')}
                className={`btn btn-sm ${paymentMethod === 'Bank' ? 'btn-primary' : 'btn-outline'}`}
                style={{ justifyContent: 'center' }}
              >
                <Building2 size={16} />
                <span>Bank Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`btn btn-sm ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-outline'}`}
                style={{ justifyContent: 'center' }}
              >
                <Banknote size={16} />
                <span>Cash / Counter</span>
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <CustomDatePicker
              value={date}
              onChange={(d) => setDate(d)}
              placeholder="Select payment date"
              width="100%"
            />
          </div>

          {/* Optional Reference */}
          <div className="form-group">
            <label className="form-label">Reference / Memo (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Bank Ref # / UTR / Transaction ID"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isProcessing} style={{ gap: '6px' }}>
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Confirm & Pay ₹{amount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoBankPaymentForm;
