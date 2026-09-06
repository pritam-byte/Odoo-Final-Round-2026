import React, { useState, useEffect } from 'react';
import { X, Building2, Banknote, IndianRupee, Lock, CheckCircle2, Zap, ShieldCheck, Sparkles, QrCode } from 'lucide-react';
import { PortalDocument, processPortalPayment } from '../api';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import { getGatewayConfig, GatewayConfig } from '../../../lib/razorpay';
import { apiRequest } from '../../../lib/apiClient';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal';

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
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'Bank' | 'Cash'>('Razorpay');
  const amount = document.amountDue;
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig | null>(null);

  // Razorpay Checkout Popup State
  const [showRzpModal, setShowRzpModal] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    getGatewayConfig().then((cfg) => setGatewayConfig(cfg));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('No outstanding balance due for this invoice.');
      return;
    }

    if (paymentMethod === 'Razorpay') {
      setIsProcessing(true);
      try {
        const orderRes = await apiRequest<{
          orderId: string;
          amount: number;
          currency: string;
          keyId: string;
        }>('/payments/razorpay/create-order', {
          method: 'POST',
          body: JSON.stringify({
            invoiceId: document.id,
            amount: Number(amount),
          }),
        });

        setIsProcessing(false);

        if (orderRes.success && orderRes.data?.orderId) {
          setOrderId(orderRes.data.orderId);
          setShowRzpModal(true);
        } else {
          setError(orderRes.error || 'Failed to initialize Razorpay checkout order');
        }
      } catch (err: any) {
        setIsProcessing(false);
        setError(err.message || 'Failed to initialize payment gateway.');
      }
    } else {
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
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)',
        }}
      >
        <div
          className="card-panel"
          style={{
            width: '100%',
            maxWidth: '520px',
            margin: '20px',
            padding: '28px',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: 'var(--radius-lg, 12px)',
          }}
        >
          {/* Modal Header */}
          <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-primary)',
                    letterSpacing: '0.05em',
                  }}
                >
                  Customer Checkout
                </span>
                {gatewayConfig?.sandboxMode && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '4px',
                      border: '1px solid #fde68a',
                    }}
                  >
                    ⚡ Sandbox Mode
                  </span>
                )}
              </div>
              <h3 className="card-title" style={{ fontSize: '18px', marginTop: '4px' }}>
                Pay Invoice: {document.number}
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
                  Payable Amount (Exact)
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
                  <Lock size={11} /> Fixed Balance Due
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
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IndianRupee size={15} />
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    ₹{amount.toFixed(2)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                  }}
                >
                  Full Settle
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Select Payment Gateway / Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Option 1: Razorpay Online with QR Badge */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`btn ${paymentMethod === 'Razorpay' ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    borderWidth: paymentMethod === 'Razorpay' ? '2px' : '1px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: paymentMethod === 'Razorpay' ? '#0d9488' : 'var(--color-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: paymentMethod === 'Razorpay' ? '#ffffff' : 'var(--color-primary)',
                      }}
                    >
                      <QrCode size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Razorpay Online Payment</span>
                        <span style={{ fontSize: '10px', backgroundColor: '#38bdf8', color: '#0c2340', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          UPI QR / Cards
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: paymentMethod === 'Razorpay' ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)',
                        }}
                      >
                        UPI (GPay / PhonePe / Paytm), QR Code, Cards, NetBanking
                      </div>
                    </div>
                  </div>
                  <Sparkles size={16} />
                </button>

                {/* Option 2: Bank Transfer & Option 3: Cash */}
                <div className="responsive-modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bank')}
                    className={`btn btn-sm ${paymentMethod === 'Bank' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ justifyContent: 'center', padding: '10px' }}
                  >
                    <Building2 size={15} />
                    <span>Manual Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`btn btn-sm ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ justifyContent: 'center', padding: '10px' }}
                  >
                    <Banknote size={15} />
                    <span>Cash / Counter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* If Offline Bank/Cash is selected, show date & reference inputs */}
            {paymentMethod !== 'Razorpay' && (
              <>
                <div className="form-group">
                  <label className="form-label">Payment Date</label>
                  <CustomDatePicker
                    value={date}
                    onChange={(d) => setDate(d)}
                    placeholder="Select payment date"
                    width="100%"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reference / UTR / Cheque # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Ref # / UTR / Transaction ID"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="form-input"
                  />
                </div>
              </>
            )}

            {/* Security Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
              <span>256-Bit SSL Encrypted &bull; Automated General Ledger Double-Entry Posting</span>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '4px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isProcessing}
                style={{
                  gap: '8px',
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {isProcessing ? (
                  'Opening Checkout...'
                ) : paymentMethod === 'Razorpay' ? (
                  <>
                    <Zap size={16} />
                    <span>Pay ₹{amount.toFixed(2)} with Razorpay</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm Payment (₹{amount.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Razorpay Interactive QR & Payment Modal */}
      {showRzpModal && orderId && (
        <RazorpayCheckoutModal
          isOpen={showRzpModal}
          onClose={() => setShowRzpModal(false)}
          orderId={orderId}
          invoiceId={document.id}
          invoiceNumber={document.number}
          amount={amount}
          customerName={document.partnerName}
          onSuccess={(res) => {
            setShowRzpModal(false);
            const updated = {
              ...document,
              amountPaid: (document.amountPaid || 0) + Number(amount),
              amountDue: 0,
              status: 'Paid' as const,
            };
            processPortalPayment({
              documentId: document.id,
              amount: Number(amount),
              date: new Date().toISOString().split('T')[0],
              paymentMethod: 'Bank',
              reference: `Razorpay Online (${res.paymentId})`,
            });
            onSuccess(updated);
          }}
          onError={(err) => {
            setError(err);
            setShowRzpModal(false);
          }}
        />
      )}
    </>
  );
};

export default DemoBankPaymentForm;
