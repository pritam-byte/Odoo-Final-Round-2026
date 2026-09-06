import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  Zap,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { apiRequest } from '../../../lib/apiClient';

export interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  invoiceId?: string;
  billId?: string;
  partnerId?: string;
  invoiceNumber: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (result: { paymentId: string; orderId: string; message: string; payment?: any }) => void;
  onError?: (errMsg: string) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  orderId,
  invoiceId,
  billId,
  partnerId,
  invoiceNumber,
  amount,
  customerName = 'Valued Customer',
  customerEmail = 'customer@urbanfurniture.com',
  customerPhone = '+91 98765 43210',
  onSuccess,
  onError,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'upi_id' | 'card' | 'netbanking'>('qr');
  const [upiId, setUpiId] = useState<string>('customer@okhdfcbank');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(598); // ~10 minutes
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');

  // Card state
  const [cardNumber, setCardNumber] = useState<string>('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('123');

  // Countdown timer for QR code
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(`urbanfurniture@razorpay`);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const completePayment = async (methodLabel: string) => {
    setIsProcessing(true);
    try {
      const mockPaymentId = `pay_rzp_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
      const mockSignature = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;

      const verifyRes = await apiRequest<{
        success: boolean;
        message: string;
        paymentId: string;
        orderId: string;
        payment?: any;
      }>('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
          invoiceId,
          billId,
          partnerId,
          amount,
        }),
      });

      setIsProcessing(false);

      if (verifyRes.success) {
        window.dispatchEvent(new Event('portal:payment'));
        window.dispatchEvent(new Event('odoo:accounting_updated'));

        onSuccess({
          paymentId: mockPaymentId,
          orderId,
          message: `Payment of ₹${amount.toFixed(2)} verified successfully via ${methodLabel}!`,
          payment: verifyRes.data?.payment,
        });
        onClose();
      } else {
        onError?.(verifyRes.error || 'Payment verification failed on server');
      }
    } catch (err: any) {
      setIsProcessing(false);
      onError?.(err.message || 'Payment simulation error');
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
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Razorpay Top Header Bar */}
        <div
          style={{
            backgroundColor: '#0c2340',
            color: '#ffffff',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: '0 4px 10px rgba(15, 118, 110, 0.4)',
              }}
            >
              UF
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.2px' }}>
                  Urban Furniture ERP
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                  }}
                >
                  Razorpay Secure
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Invoice #{invoiceNumber} &bull; {customerName} &bull; {customerEmail || customerPhone}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Amount to Pay
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8' }}>
                ₹{amount.toFixed(2)}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#cbd5e1',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content: Left Nav + Right Payment Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1, overflowY: 'auto' }}>
          {/* Left Method Tabs */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px' }}>
              Payment Options
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'qr' ? '#ffffff' : 'transparent',
                color: activeTab === 'qr' ? '#0f766e' : '#475569',
                fontWeight: activeTab === 'qr' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: activeTab === 'qr' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <QrCode size={18} color={activeTab === 'qr' ? '#0f766e' : '#64748b'} />
              <span>UPI QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upi_id')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'upi_id' ? '#ffffff' : 'transparent',
                color: activeTab === 'upi_id' ? '#0f766e' : '#475569',
                fontWeight: activeTab === 'upi_id' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: activeTab === 'upi_id' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Smartphone size={18} color={activeTab === 'upi_id' ? '#0f766e' : '#64748b'} />
              <span>UPI Apps / ID</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'card' ? '#ffffff' : 'transparent',
                color: activeTab === 'card' ? '#0f766e' : '#475569',
                fontWeight: activeTab === 'card' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: activeTab === 'card' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <CreditCard size={18} color={activeTab === 'card' ? '#0f766e' : '#64748b'} />
              <span>Cards (Credit/Debit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'netbanking' ? '#ffffff' : 'transparent',
                color: activeTab === 'netbanking' ? '#0f766e' : '#475569',
                fontWeight: activeTab === 'netbanking' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: activeTab === 'netbanking' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Building2 size={18} color={activeTab === 'netbanking' ? '#0f766e' : '#64748b'} />
              <span>NetBanking</span>
            </button>

            {/* Test Mode Note */}
            <div
              style={{
                marginTop: 'auto',
                padding: '10px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                fontSize: '11px',
                color: '#92400e',
                lineHeight: 1.4,
              }}
            >
              <strong>⚡ Test Simulator</strong>
              <div style={{ marginTop: '2px' }}>Zero real money will be charged.</div>
            </div>
          </div>

          {/* Right Action Panel */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* 1. UPI QR Code Tab */}
            {activeTab === 'qr' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                  Scan UPI QR Code to Pay
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Open GPay, PhonePe, Paytm, BHIM or any UPI app to scan
                </div>

                {/* Simulated High-Res Dynamic QR Code */}
                <div
                  style={{
                    position: 'relative',
                    margin: '18px 0',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width="180"
                    height="180"
                    viewBox="0 0 180 180"
                    style={{ display: 'block' }}
                  >
                    {/* QR Code Matrix background and pattern */}
                    <rect width="180" height="180" fill="#ffffff" />
                    {/* Corner Position Detection Pattern (Top-Left) */}
                    <rect x="10" y="10" width="45" height="45" fill="#0c2340" rx="4" />
                    <rect x="18" y="18" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="24" y="24" width="17" height="17" fill="#0f766e" rx="2" />

                    {/* Corner Position Detection Pattern (Top-Right) */}
                    <rect x="125" y="10" width="45" height="45" fill="#0c2340" rx="4" />
                    <rect x="133" y="18" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="139" y="24" width="17" height="17" fill="#0f766e" rx="2" />

                    {/* Corner Position Detection Pattern (Bottom-Left) */}
                    <rect x="10" y="125" width="45" height="45" fill="#0c2340" rx="4" />
                    <rect x="18" y="133" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="24" y="139" width="17" height="17" fill="#0f766e" rx="2" />

                    {/* QR Data Dots Matrix */}
                    <g fill="#1e293b">
                      {/* Random structured QR matrix simulation */}
                      <rect x="65" y="15" width="8" height="8" />
                      <rect x="80" y="15" width="8" height="8" />
                      <rect x="95" y="15" width="8" height="8" />
                      <rect x="110" y="15" width="8" height="8" />
                      
                      <rect x="65" y="30" width="8" height="8" />
                      <rect x="85" y="30" width="8" height="8" />
                      <rect x="105" y="30" width="8" height="8" />

                      <rect x="65" y="45" width="8" height="8" />
                      <rect x="75" y="45" width="8" height="8" />
                      <rect x="95" y="45" width="8" height="8" />
                      <rect x="110" y="45" width="8" height="8" />

                      <rect x="15" y="65" width="8" height="8" />
                      <rect x="30" y="65" width="8" height="8" />
                      <rect x="45" y="65" width="8" height="8" />
                      <rect x="125" y="65" width="8" height="8" />
                      <rect x="140" y="65" width="8" height="8" />
                      <rect x="155" y="65" width="8" height="8" />

                      <rect x="15" y="80" width="8" height="8" />
                      <rect x="35" y="80" width="8" height="8" />
                      <rect x="55" y="80" width="8" height="8" />
                      <rect x="120" y="80" width="8" height="8" />
                      <rect x="145" y="80" width="8" height="8" />

                      <rect x="15" y="95" width="8" height="8" />
                      <rect x="40" y="95" width="8" height="8" />
                      <rect x="130" y="95" width="8" height="8" />
                      <rect x="155" y="95" width="8" height="8" />

                      <rect x="65" y="125" width="8" height="8" />
                      <rect x="80" y="125" width="8" height="8" />
                      <rect x="100" y="125" width="8" height="8" />
                      <rect x="115" y="125" width="8" height="8" />
                      <rect x="135" y="125" width="8" height="8" />
                      <rect x="150" y="125" width="8" height="8" />

                      <rect x="70" y="140" width="8" height="8" />
                      <rect x="90" y="140" width="8" height="8" />
                      <rect x="110" y="140" width="8" height="8" />
                      <rect x="130" y="140" width="8" height="8" />
                      <rect x="155" y="140" width="8" height="8" />

                      <rect x="65" y="155" width="8" height="8" />
                      <rect x="85" y="155" width="8" height="8" />
                      <rect x="105" y="155" width="8" height="8" />
                      <rect x="125" y="155" width="8" height="8" />
                      <rect x="145" y="155" width="8" height="8" />
                    </g>

                    {/* Center UPI Badge */}
                    <rect x="70" y="70" width="40" height="40" fill="#0c2340" rx="8" />
                    <text x="90" y="94" fill="#38bdf8" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                      UPI
                    </text>
                  </svg>

                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0f766e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RefreshCw size={11} className={isProcessing ? 'animate-spin' : ''} />
                    <span>QR expires in {formatTime(secondsLeft)}</span>
                  </div>
                </div>

                {/* Supported UPI Apps Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pay with:</span>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <span
                      key={app}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '4px',
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      {app}
                    </span>
                  ))}
                </div>

                {/* Instant QR Simulation Action */}
                <button
                  type="button"
                  onClick={() => completePayment('UPI QR Scan')}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
                  }}
                >
                  <Zap size={16} />
                  <span>{isProcessing ? 'Simulating Payment...' : `Simulate QR Scan & Pay ₹${amount.toFixed(2)}`}</span>
                </button>
              </div>
            )}

            {/* 2. UPI ID / VPA Tab */}
            {activeTab === 'upi_id' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                    Pay via UPI ID / Mobile Number
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    A collect request will be sent to your UPI app
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Enter your UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or username@okhdfcbank"
                    className="form-input"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: '#475569',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Merchant UPI ID</div>
                    <div style={{ color: '#0f766e', fontWeight: 700 }}>urbanfurniture@razorpay</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '4px' }}
                  >
                    {copiedUpi ? <Check size={13} color="#0f766e" /> : <Copy size={13} />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => completePayment(`UPI ID (${upiId})`)}
                  disabled={isProcessing || !upiId}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                  }}
                >
                  <span>{isProcessing ? 'Sending Collect Request...' : `Verify & Pay ₹${amount.toFixed(2)}`}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* 3. Cards Tab */}
            {activeTab === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                    Credit or Debit Card
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Visa, MasterCard, RuPay, Maestro
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="form-input"
                    style={{ letterSpacing: '2px', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    defaultValue={customerName}
                    className="form-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => completePayment('Credit/Debit Card')}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                  }}
                >
                  <Lock size={15} />
                  <span>{isProcessing ? 'Processing Card...' : `Pay ₹${amount.toFixed(2)} with Card`}</span>
                </button>
              </div>
            )}

            {/* 4. NetBanking Tab */}
            {activeTab === 'netbanking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                    Select Your Bank
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Direct NetBanking settlement via Razorpay
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: selectedBank === b ? '2px solid #0f766e' : '1px solid #e2e8f0',
                        backgroundColor: selectedBank === b ? '#f0fdfa' : '#ffffff',
                        fontWeight: 600,
                        fontSize: '12px',
                        color: selectedBank === b ? '#0f766e' : '#334155',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => completePayment(`NetBanking (${selectedBank})`)}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                  }}
                >
                  <span>{isProcessing ? 'Connecting to Bank...' : `Pay ₹${amount.toFixed(2)} via ${selectedBank}`}</span>
                </button>
              </div>
            )}

            {/* Footer Trust Guarantee */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '11px',
                color: '#94a3b8',
              }}
            >
              <ShieldCheck size={13} color="#0f766e" />
              <span>Secured by Razorpay Payments &bull; PCI-DSS Level 1 Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayCheckoutModal;
