import React, { useState, useEffect } from 'react';
import { Check, ArrowLeft, IndianRupee } from 'lucide-react';
import { useAccountingStore } from '../../accounting/store';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';

export interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'Send' | 'Receive';
  defaultPartnerId?: string;
  defaultDocType?: 'Invoice' | 'Bill';
  defaultDocId?: string;
  defaultAmount?: number;
  onSuccess?: () => void;
}

export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'Receive',
  defaultPartnerId,
  defaultDocId,
  defaultAmount,
  onSuccess,
}) => {
  const { contacts, invoices, bills, payInvoice, payBill, addJournalEntry, accounts, journals } =
    useAccountingStore();

  const [paymentType, setPaymentType] = useState<'Send' | 'Receive'>(defaultType);
  const [partnerId, setPartnerId] = useState<string>(defaultPartnerId || contacts[0]?.id || '');
  const [linkedDocId, setLinkedDocId] = useState<string>(defaultDocId || '');
  const [amount, setAmount] = useState<number>(defaultAmount || 10000);
  const [paymentVia, setPaymentVia] = useState<'Bank' | 'Cash' | 'Razorpay'>('Bank');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (defaultType) setPaymentType(defaultType);
    if (defaultPartnerId) setPartnerId(defaultPartnerId);
    if (defaultDocId) setLinkedDocId(defaultDocId);
    if (defaultAmount) setAmount(defaultAmount);
  }, [defaultType, defaultPartnerId, defaultDocId, defaultAmount, isOpen]);

  // Available open documents based on type and partner
  const openInvoices = invoices.filter(
    (inv) => inv.amountDue > 0 && (partnerId ? inv.partnerId === partnerId : true)
  );
  const openBills = bills.filter(
    (b) => b.amountDue > 0 && (partnerId ? b.partnerId === partnerId : true)
  );

  const handlePartnerChange = (id: string) => {
    setPartnerId(id);
    setLinkedDocId('');
  };

  const handleDocChange = (docId: string) => {
    setLinkedDocId(docId);
    if (paymentType === 'Receive') {
      const inv = invoices.find((i) => i.id === docId);
      if (inv) {
        setAmount(inv.amountDue);
        setReference(`Payment for ${inv.invoiceNumber}`);
      }
    } else {
      const bill = bills.find((b) => b.id === docId);
      if (bill) {
        setAmount(bill.amountDue);
        setReference(`Payment for ${bill.billNumber}`);
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
      setError('Partner / User account is required.');
      return;
    }
    if (amount <= 0) {
      setError('Payment amount must be greater than ₹0.00');
      return;
    }

    const partner = contacts.find((c) => c.id === partnerId) || contacts[0];

    if (linkedDocId) {
      if (paymentType === 'Receive') {
        payInvoice(linkedDocId, amount, paymentVia, date);
      } else {
        payBill(linkedDocId, amount, paymentVia, date);
      }
    } else {
      // Direct general payment posting to double-entry ledger
      const bankCashAcc =
        accounts.find((a) => a.type === paymentVia) ||
        accounts.find((a) => a.type === 'Bank') ||
        accounts[0];
      const offsetAcc =
        paymentType === 'Receive'
          ? accounts.find((a) => a.code === '1050') || accounts.find((a) => a.type === 'Asset') || accounts[0]
          : accounts.find((a) => a.code === '2010') || accounts.find((a) => a.type === 'Liability') || accounts[0];

      if (paymentType === 'Receive') {
        addJournalEntry({
          date,
          journalId: journals.find((j) => j.type === paymentVia)?.id || 'j3',
          journalName: `${paymentVia} Register Journal`,
          status: 'Posted',
          reference: reference || `Direct Collection from ${partner.name}`,
          lines: [
            {
              id: `jel_rec1_${Date.now()}`,
              accountId: bankCashAcc.id,
              accountName: bankCashAcc.name,
              partnerId: partner.id,
              partnerName: partner.name,
              debit: amount,
              credit: 0,
            },
            {
              id: `jel_rec2_${Date.now()}`,
              accountId: offsetAcc.id,
              accountName: offsetAcc.name,
              partnerId: partner.id,
              partnerName: partner.name,
              debit: 0,
              credit: amount,
            },
          ],
        });
      } else {
        addJournalEntry({
          date,
          journalId: journals.find((j) => j.type === paymentVia)?.id || 'j3',
          journalName: `${paymentVia} Register Journal`,
          status: 'Posted',
          reference: reference || `Direct Disbursement to ${partner.name}`,
          lines: [
            {
              id: `jel_send1_${Date.now()}`,
              accountId: offsetAcc.id,
              accountName: offsetAcc.name,
              partnerId: partner.id,
              partnerName: partner.name,
              debit: amount,
              credit: 0,
            },
            {
              id: `jel_send2_${Date.now()}`,
              accountId: bankCashAcc.id,
              accountName: bankCashAcc.name,
              partnerId: partner.id,
              partnerName: partner.name,
              debit: 0,
              credit: amount,
            },
          ],
        });
      }
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IndianRupee size={18} color="var(--color-primary)" />
          <span>Register Payment & Update Ledger</span>
        </div>
      }
      maxWidth="620px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} leftIcon={<ArrowLeft size={15} />}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRegister} leftIcon={<Check size={15} strokeWidth={2.2} />}>
            Confirm & Post Payment
          </Button>
        </>
      }
    >
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        {/* Payment Direction Toggle */}
        <div className="form-group">
          <label className="form-label">Payment Direction / Type</label>
          <div className="auth-tabs" style={{ width: '100%' }}>
            <button
              type="button"
              className={`auth-tab-btn ${paymentType === 'Receive' ? 'active' : ''}`}
              onClick={() => {
                setPaymentType('Receive');
                setLinkedDocId('');
              }}
            >
              Receive (Customer Collection)
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${paymentType === 'Send' ? 'active' : ''}`}
              onClick={() => {
                setPaymentType('Send');
                setLinkedDocId('');
              }}
            >
              Send (Vendor Disbursement)
            </button>
          </div>
        </div>

        {/* Partner Select */}
        <div className="form-group">
          <label className="form-label">{paymentType === 'Receive' ? 'Customer Account' : 'Vendor / Supplier'}</label>
          <CustomSelect<string>
            value={partnerId}
            onChange={(val) => handlePartnerChange(val)}
            options={contacts.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.type})`,
            }))}
            width="100%"
          />
        </div>

        {/* Optional Linked Open Document */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Link to Open Document (Optional)</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {paymentType === 'Receive' ? `${openInvoices.length} unpaid invoices` : `${openBills.length} unpaid bills`}
            </span>
          </label>
          <CustomSelect<string>
            value={linkedDocId}
            onChange={(val) => handleDocChange(val)}
            options={[
              { value: '', label: '-- Direct Payment (General Balance) --' },
              ...(paymentType === 'Receive'
                ? openInvoices.map((inv) => ({
                    value: inv.id,
                    label: `${inv.invoiceNumber} — ${inv.partnerName} (Due: ₹${inv.amountDue.toLocaleString()})`,
                  }))
                : openBills.map((b) => ({
                    value: b.id,
                    label: `${b.billNumber} — ${b.partnerName} (Due: ₹${b.amountDue.toLocaleString()})`,
                  }))),
            ]}
            width="100%"
          />
        </div>

        {/* Amount & Method */}
        <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FormField
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />

          <div className="form-group">
            <label className="form-label">Payment Account Method</label>
            <CustomSelect<'Bank' | 'Cash' | 'Razorpay'>
              value={paymentVia}
              onChange={(val) => setPaymentVia(val)}
              options={[
                { value: 'Bank', label: 'Bank Account (Electronic / Wire)' },
                { value: 'Razorpay', label: 'Razorpay Gateway (Online / UPI)' },
                { value: 'Cash', label: 'Cash Account (Register)' },
              ]}
              width="100%"
            />
          </div>
        </div>

        {/* Date & Reference */}
        <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Payment Date *</label>
            <CustomDatePicker
              value={date}
              onChange={(newDate) => setDate(newDate)}
              placeholder="Payment Date"
              width="100%"
            />
          </div>

          <FormField
            label="Reference / Memo Note"
            placeholder="e.g. Wire ref #99812"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

export default RegisterPaymentModal;
