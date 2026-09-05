import React, { useState } from 'react';
import { IndianRupee, Calendar, Wallet } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormField } from './FormField';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Send' | 'Receive';
  partnerName: string;
  sourceDocNumber: string;
  maxAmount: number;
  onConfirmPayment: (amount: number, paymentVia: 'Bank' | 'Cash', date: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  type,
  partnerName,
  sourceDocNumber,
  maxAmount,
  onConfirmPayment,
}) => {
  const [amount, setAmount] = useState<number>(maxAmount);
  const [paymentVia, setPaymentVia] = useState<'Bank' | 'Cash'>('Bank');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
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

    onConfirmPayment(amount, paymentVia, date);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register ${type === 'Receive' ? 'Customer Payment' : 'Vendor Payment'} (${sourceDocNumber})`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} leftIcon={<Wallet size={16} strokeWidth={2} />}>
            Confirm Payment
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Payment Type</label>
            <div
              className="form-input"
              style={{ backgroundColor: 'var(--color-bg)', fontWeight: 600, color: 'var(--color-text-secondary)' }}
            >
              {type === 'Receive' ? 'Receive Money (Inbound)' : 'Send Money (Outbound)'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Partner (Autofilled)</label>
            <div
              className="form-input"
              style={{ backgroundColor: 'var(--color-bg)', fontWeight: 600, color: 'var(--color-text-primary)' }}
            >
              {partnerName}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="pay-via">
              Payment Method / Journal
            </label>
            <select
              id="pay-via"
              className="form-input select-filter"
              value={paymentVia}
              onChange={(e) => setPaymentVia(e.target.value as 'Bank' | 'Cash')}
            >
              <option value="Bank">Bank Account (Electronic Wire / Cheque)</option>
              <option value="Cash">Petty Cash Register</option>
            </select>
          </div>

          <FormField
            label="Payment Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            leadingIcon={<Calendar size={15} strokeWidth={1.75} />}
            required
          />
        </div>

        <FormField
          label="Payment Amount ($)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          leadingIcon={<IndianRupee size={15} strokeWidth={1.75} />}
          helperText={`Outstanding Balance: ₹${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          required
        />
      </form>
    </Modal>
  );
};

export default PaymentModal;
