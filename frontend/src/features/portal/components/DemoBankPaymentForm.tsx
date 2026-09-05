import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { PortalDocument, processPortalPayment } from '../api';

export interface DemoBankPaymentFormProps {
  document: PortalDocument;
  onClose: () => void;
  onSuccess: (updatedDoc: PortalDocument) => void;
}

export const DemoBankPaymentForm: React.FC<DemoBankPaymentFormProps> = ({
  document,
  onClose,
  onSuccess
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
      reference: reference.trim() || undefined
    });

    setIsProcessing(false);
    if (result.success && result.document) {
      onSuccess(result.document);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
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
      backdropFilter: 'blur(2px)'
    }}>
      <div className="ds-card" style={{
        width: '100%',
        maxWidth: '520px',
        margin: '20px',
        padding: '28px',
        boxShadow: 'var(--shadow-modal)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-gray-border)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>
              Pay Dues: {document.number}
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-medium)' }}>
              Direct settlement portal
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-gray-medium)', fontSize: '1.25rem', padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            borderRadius: 'var(--button-radius)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Summary Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '14px',
            backgroundColor: 'var(--color-gray-bg)',
            borderRadius: 'var(--button-radius)',
            marginBottom: '20px',
            border: '1px solid var(--color-gray-border)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', display: 'block' }}>Total Amount</span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-charcoal-dark)' }}>${document.total.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', display: 'block' }}>Amount Due</span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary-teal)' }}>${document.amountDue.toFixed(2)}</strong>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-charcoal-dark)', marginBottom: '6px' }}>
              Payment Via <span style={{ color: 'var(--color-danger-red)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--button-radius)',
                  border: paymentMethod === 'Bank' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-gray-border)',
                  backgroundColor: paymentMethod === 'Bank' ? 'var(--color-primary-teal-light)' : 'var(--color-white)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: paymentMethod === 'Bank' ? 'var(--color-primary-teal-text)' : 'var(--color-gray-dark)',
                  cursor: 'pointer'
                }}
              >
                🏦 Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--button-radius)',
                  border: paymentMethod === 'Cash' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-gray-border)',
                  backgroundColor: paymentMethod === 'Cash' ? 'var(--color-primary-teal-light)' : 'var(--color-white)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: paymentMethod === 'Cash' ? 'var(--color-primary-teal-text)' : 'var(--color-gray-dark)',
                  cursor: 'pointer'
                }}
              >
                💵 Cash / Counter
              </button>
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-charcoal-dark)', marginBottom: '6px' }}>
              Amount to Pay ($) <span style={{ color: 'var(--color-danger-red)' }}>*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={document.amountDue}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--button-radius)',
                border: '1px solid var(--color-gray-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-charcoal-dark)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', marginTop: '4px', display: 'block' }}>
              Autofilled from current Amount Due
            </span>
          </div>

          {/* Date */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-charcoal-dark)', marginBottom: '6px' }}>
              Payment Date <span style={{ color: 'var(--color-danger-red)' }}>*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--button-radius)',
                border: '1px solid var(--color-gray-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '0.875rem',
                color: 'var(--color-charcoal-dark)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Optional Reference */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-charcoal-dark)', marginBottom: '6px' }}>
              Reference / Transaction Memo (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Bank Ref # / Cheque #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--button-radius)',
                border: '1px solid var(--color-gray-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '0.875rem',
                color: 'var(--color-charcoal-dark)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-gray-border)' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Confirm Payment ($${amount.toFixed(2)})`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoBankPaymentForm;
