import React, { useState } from 'react';
import { X, Building2, Banknote, DollarSign } from 'lucide-react';
import { PortalDocument, processPortalPayment } from '../api';

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
  const [amount, setAmount] = useState<number>(document.amountDue);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Amount must be greater than $0.00');
      return;
    }
    if (amount > document.amountDue) {
      setError(`Amount cannot exceed the current balance due ($${document.amountDue.toFixed(2)})`);
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
      }}
    >
      <div
        className="card-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '20px',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Modal Header */}
        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '18px' }}>
              Pay Dues: {document.number}
            </h3>
            <p className="card-subtitle">Direct self-service settlement</p>
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
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary Box */}
          <div
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
                Total Amount
              </span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                ${document.total.toFixed(2)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Amount Due
              </span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>
                ${document.amountDue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label">Payment Via</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount to Pay ($)</label>
            <div className="input-with-icon-wrapper">
              <div className="input-leading-icon">
                <DollarSign size={15} />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={document.amountDue}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="form-input has-leading-icon"
                required
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Autofilled from current balance due.
            </span>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Optional Reference */}
          <div className="form-group">
            <label className="form-label">Reference / Memo (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Bank Ref # / Transaction ID"
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
              gap: '10px',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Confirm Payment ($${amount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoBankPaymentForm;
