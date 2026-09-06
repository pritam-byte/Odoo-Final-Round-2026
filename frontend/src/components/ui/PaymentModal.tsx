import React, { useState } from 'react';
import { IndianRupee, Wallet } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormField } from './FormField';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomSelect } from './CustomSelect';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Send' | 'Receive';
  partnerName: string;
  sourceDocNumber: string;
  maxAmount: number;
  onConfirmPayment: (amount: number, paymentVia: 'Bank' | 'Cash', date: string, note?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  type: initialType,
  partnerName,
  sourceDocNumber,
  maxAmount,
  onConfirmPayment,
}) => {
  const [paymentType, setPaymentType] = useState<'Send' | 'Receive'>(initialType);
  const [amount, setAmount] = useState<number>(maxAmount);
  const [paymentVia, setPaymentVia] = useState<'Bank' | 'Cash'>('Bank');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>(`Payment for ${sourceDocNumber}`);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Payment amount must be greater than ₹0.00');
      return;
    }
    if (amount > maxAmount + 0.01) {
      setError(`Payment cannot exceed the outstanding balance of ₹${maxAmount.toLocaleString()}`);
      return;
    }

    onConfirmPayment(amount, paymentVia, date, note);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '24px' }}>
          <span>Bill Payment ({sourceDocNumber})</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Draft → Confirmed
            </span>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} leftIcon={<Wallet size={16} strokeWidth={2} />}>
            Confirm
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* Payment Type Selection */}
        <div className="form-group">
          <label className="form-label">Payment Type</label>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              <input
                type="radio"
                name="paymentType"
                value="Send"
                checked={paymentType === 'Send'}
                onChange={() => setPaymentType('Send')}
              />
              <span>Send (Paid to Vendor)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              <input
                type="radio"
                name="paymentType"
                value="Receive"
                checked={paymentType === 'Receive'}
                onChange={() => setPaymentType('Receive')}
              />
              <span>Receive (From Customer)</span>
            </label>
          </div>
        </div>

        <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Partner (Autofilled)</label>
            <div
              className="form-input"
              style={{ backgroundColor: 'var(--color-bg)', fontWeight: 600, color: 'var(--color-text-primary)' }}
            >
              {partnerName}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-via">
              Payment Via
            </label>
            <CustomSelect<'Bank' | 'Cash'>
              value={paymentVia}
              onChange={(val) => setPaymentVia(val)}
              options={[
                { value: 'Bank', label: 'Bank (Default)' },
                { value: 'Cash', label: 'Cash' },
              ]}
              width="100%"
            />
          </div>
        </div>

        <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            leadingIcon={<IndianRupee size={15} strokeWidth={1.75} />}
            helperText={`Autofill Amount Due from Invoice/Bill: ₹${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            required
          />

          <div className="form-group">
            <label className="form-label">Payment Date *</label>
            <CustomDatePicker
              value={date}
              onChange={setDate}
              placeholder="Payment Date"
              width="100%"
            />
          </div>
        </div>

        <FormField
          label="Note (Alphanumeric)"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Payment for BILL/2026/0001"
        />
      </form>
    </Modal>
  );
};

export default PaymentModal;
