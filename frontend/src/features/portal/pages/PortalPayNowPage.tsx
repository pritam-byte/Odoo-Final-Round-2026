import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { getMyScopedDocuments, PortalDocument } from '../api';
import { getGatewayConfig, GatewayConfig } from '../../../lib/razorpay';
import { apiRequest } from '../../../lib/apiClient';
import { RazorpayCheckoutModal } from '../components/RazorpayCheckoutModal';

export interface PortalPayNowPageProps {
  documentId?: string;
  onNavigate?: (view: string, docId?: string) => void;
}

export const PortalPayNowPage: React.FC<PortalPayNowPageProps> = ({
  documentId,
  onNavigate,
}) => {
  const [docs, setDocs] = useState<PortalDocument[]>(() =>
    getMyScopedDocuments('invoice').filter((d) => d.status === 'Unpaid')
  );
  const [selectedDocId, setSelectedDocId] = useState<string>(documentId || docs[0]?.id || '');
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showRzpModal, setShowRzpModal] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');
  const [successResult, setSuccessResult] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    docNumber: string;
  } | null>(null);

  useEffect(() => {
    const unpaid = getMyScopedDocuments('invoice').filter((d) => d.status === 'Unpaid');
    setDocs(unpaid);
    if (!selectedDocId && unpaid.length > 0) {
      setSelectedDocId(unpaid[0].id);
    }
  }, [documentId]);

  useEffect(() => {
    getGatewayConfig().then((cfg) => setGatewayConfig(cfg));
  }, []);

  const currentDoc = docs.find((d) => d.id === selectedDocId);

  const handlePayNow = async () => {
    if (!currentDoc) return;
    setIsProcessing(true);
    setError('');

    try {
      const orderRes = await apiRequest<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>('/payments/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId: currentDoc.id,
          amount: currentDoc.amountDue,
        }),
      });

      setIsProcessing(false);

      if (orderRes.success && orderRes.data?.orderId) {
        setOrderId(orderRes.data.orderId);
        setShowRzpModal(true);
      } else {
        setError(orderRes.error || 'Failed to initialize Razorpay checkout order');
      }
    } catch (e: any) {
      setIsProcessing(false);
      setError(e.message || 'Payment initiation failed');
    }
  };

  if (successResult) {
    return (
      <div className="card-panel" style={{ maxWidth: '600px', margin: '40px auto', padding: '36px', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ccfbf1',
            color: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h2 className="page-title" style={{ fontSize: '22px', marginBottom: '8px' }}>
          Payment Successful!
        </h2>
        <p className="page-subtitle" style={{ fontSize: '14px', marginBottom: '24px' }}>
          Your payment of <strong>₹{successResult.amount.toFixed(2)}</strong> for invoice <strong>{successResult.docNumber}</strong> has been confirmed and posted to the double-entry accounting ledger.
        </p>

        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '13px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Payment ID:</span>
            <strong style={{ fontFamily: 'monospace' }}>{successResult.paymentId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
            <strong style={{ fontFamily: 'monospace' }}>{successResult.orderId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Method:</span>
            <strong>Razorpay Online (UPI QR / Cards / NetBanking)</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onNavigate?.('invoices')}
          >
            Back to Invoices
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate?.('payments')}
          >
            View Payment Receipts
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={24} style={{ color: 'var(--color-primary)' }} />
              Instant Online Payment Portal
            </h1>
            <p className="page-subtitle">
              Settle your outstanding Urban Furniture invoices securely via Razorpay (UPI QR, Cards, Netbanking).
            </p>
          </div>
          {gatewayConfig?.sandboxMode && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '20px',
                border: '1px solid #fde68a',
              }}
            >
              ⚡ Sandbox Mode Active
            </span>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {docs.length === 0 ? (
          <div className="card-panel" style={{ textAlign: 'center', padding: '48px' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 16px auto' }} />
            <h3 className="card-title">All Invoices Paid in Full!</h3>
            <p className="card-subtitle">You have no outstanding invoice dues at this moment.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate?.('invoices')}
              style={{ marginTop: '16px' }}
            >
              View Settled Invoices
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left Column: Invoice Selector */}
            <div className="card-panel">
              <h3 className="card-title" style={{ fontSize: '15px', marginBottom: '14px' }}>
                Select Unpaid Invoice ({docs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {docs.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '2px solid var(--color-primary)'
                          : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-light, #f0fdfa)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                          {doc.number}
                        </strong>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>
                          ₹{doc.amountDue.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Issued: {doc.date} &bull; Due: {doc.dueDate || doc.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Checkout Summary & Pay Action */}
            {currentDoc && (
              <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="card-title" style={{ fontSize: '15px', marginBottom: '14px' }}>
                    Settlement Summary
                  </h3>

                  <div
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Invoice:</span>
                      <strong>{currentDoc.number}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Customer:</span>
                      <strong>{currentDoc.partnerName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Total Billed:</span>
                      <span>₹{currentDoc.total.toFixed(2)}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>Payable Now:</span>
                      <strong style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
                        ₹{currentDoc.amountDue.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#f0fdfa',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      color: '#0f766e',
                      marginBottom: '16px',
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Secured by Razorpay. Instant Double-Entry General Ledger reconciliation.</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    gap: '8px',
                    justifyContent: 'center',
                  }}
                >
                  <QrCode size={18} />
                  <span>
                    {isProcessing
                      ? 'Opening Checkout...'
                      : `Pay ₹${currentDoc.amountDue.toFixed(2)} with Razorpay`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Razorpay Interactive QR & Payment Modal */}
      {showRzpModal && orderId && currentDoc && (
        <RazorpayCheckoutModal
          isOpen={showRzpModal}
          onClose={() => setShowRzpModal(false)}
          orderId={orderId}
          invoiceId={currentDoc.id}
          invoiceNumber={currentDoc.number}
          amount={currentDoc.amountDue}
          customerName={currentDoc.partnerName}
          onSuccess={(res) => {
            setShowRzpModal(false);
            setSuccessResult({
              paymentId: res.paymentId,
              orderId: res.orderId,
              amount: currentDoc.amountDue,
              docNumber: currentDoc.number,
            });
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

export default PortalPayNowPage;
