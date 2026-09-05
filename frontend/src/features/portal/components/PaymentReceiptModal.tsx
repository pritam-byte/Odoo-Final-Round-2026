import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Printer,
  Mail,
  X,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';
import { PortalPayment } from '../schemas';
import { updatePortalPaymentStatus } from '../api';

export interface PaymentReceiptModalProps {
  payment: PortalPayment;
  onClose: () => void;
  onUpdate?: (updatedPayment: PortalPayment) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  onClose,
  onUpdate,
}) => {
  const [currentStatus, setCurrentStatus] = useState<'Draft' | 'Confirm' | 'Cancelled'>(
    payment.status || 'Confirm'
  );
  const [showSettingsDropdown, setShowSettingsDropdown] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'Send' | 'Receive'>(
    payment.documentType === 'bill' ? 'Send' : 'Receive'
  );
  const [partnerName, setPartnerName] = useState<string>(
    payment.partnerName || (payment.documentType === 'bill' ? 'Urban Timbers Ltd' : 'Mr Rahul')
  );
  const [amount, setAmount] = useState<number>(payment.amount);
  const [paymentVia, setPaymentVia] = useState<'Bank' | 'Cash'>(payment.paymentMethod || 'Bank');
  const [date, setDate] = useState<string>(payment.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>(
    payment.note || `${payment.reference} - Payment for ${payment.documentNumber}`
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const printableReceiptRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStatusChange = (newStatus: 'Draft' | 'Confirm' | 'Cancelled') => {
    setCurrentStatus(newStatus);
    updatePortalPaymentStatus(payment.id, newStatus);
    if (onUpdate) {
      onUpdate({
        ...payment,
        status: newStatus,
        paymentMethod: paymentVia,
        amount,
        date,
        partnerName,
        note,
      });
    }
    showToast(`Payment status updated to ${newStatus}`);
  };

  const handlePrint = () => {
    setShowSettingsDropdown(false);
    window.print();
  };

  const handleSendEmail = () => {
    setShowSettingsDropdown(false);
    const subject = encodeURIComponent(`Payment Receipt - ${payment.reference} (${payment.documentNumber})`);
    const body = encodeURIComponent(
      `Hello ${partnerName},\n\n` +
      `Here is the payment confirmation receipt for your transaction:\n\n` +
      `----------------------------------------\n` +
      `Receipt #: ${payment.reference}\n` +
      `Document Reference: ${payment.documentNumber} (${payment.documentType.toUpperCase()})\n` +
      `Payment Type: ${paymentType === 'Send' ? 'Payment Sent' : 'Payment Received'}\n` +
      `Partner: ${partnerName}\n` +
      `Amount: ₹${amount.toFixed(2)}\n` +
      `Date: ${date}\n` +
      `Payment Via: ${paymentVia}\n` +
      `Note: ${note}\n` +
      `Status: ${currentStatus}\n` +
      `----------------------------------------\n\n` +
      `Thank you for doing business with Urban Furniture.\n`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    showToast('Email client opened with receipt details.');
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/portal/payments?ref=${payment.reference}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      showToast('Sharable receipt link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <>
      {/* Global CSS for Print View */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-payment-modal, #printable-payment-modal * {
            visibility: visible !important;
          }
          #printable-payment-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            padding: 30px !important;
            background: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="no-print-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          padding: '16px',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal Window */}
        <div
          id="printable-payment-modal"
          ref={printableReceiptRef}
          style={{
            width: '100%',
            maxWidth: '780px',
            backgroundColor: '#181b22',
            color: '#f3f4f6',
            borderRadius: '16px',
            border: '1px solid #2e3440',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Toast Notification inside Modal */}
          {toastMessage && (
            <div
              style={{
                position: 'absolute',
                top: '70px',
                right: '24px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Top Control Bar Matching Wireframe */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              backgroundColor: '#12141a',
              borderBottom: '1px solid #282d39',
            }}
          >
            {/* Left Action Buttons & Cog */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleStatusChange('Confirm')}
                style={{
                  padding: '7px 22px',
                  backgroundColor: currentStatus === 'Confirm' ? '#6366f1' : '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Confirm
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('Cancelled')}
                style={{
                  padding: '7px 20px',
                  backgroundColor: currentStatus === 'Cancelled' ? '#ef4444' : '#232733',
                  color: currentStatus === 'Cancelled' ? '#ffffff' : '#9ca3af',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              {/* Cog Settings Button with Dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  title="Receipt Options"
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    backgroundColor: showSettingsDropdown ? '#374151' : '#232733',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Settings size={18} />
                </button>

                {/* Dropdown Menu */}
                {showSettingsDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '44px',
                      left: 0,
                      width: '210px',
                      backgroundColor: '#1f2430',
                      border: '1px solid #374151',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      zIndex: 200,
                      overflow: 'hidden',
                      padding: '6px 0',
                    }}
                  >
                    <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Receipt Actions
                    </div>
                    <button
                      type="button"
                      onClick={handlePrint}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f3f4f6',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d3342')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Printer size={16} color="#60a5fa" />
                      <div>
                        <strong>1. Print</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af' }}>Print or PDF download</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f3f4f6',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d3342')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Mail size={16} color="#34d399" />
                      <div>
                        <strong>2. Send</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af' }}>Send via Email</span>
                      </div>
                    </button>
                    <div style={{ height: '1px', backgroundColor: '#2e3440', margin: '4px 0' }} />
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        handleCopyShareLink();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f3f4f6',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d3342')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Share2 size={16} color="#f59e0b" />
                      <div>
                        <strong>Share Link</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af' }}>Copy receipt URL</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Status Workflow Stage Chevrons Matching Wireframe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#0d0f14',
                  borderRadius: '6px',
                  border: '1px solid #2d3342',
                  overflow: 'hidden',
                }}
              >
                {/* Draft Step */}
                <div
                  onClick={() => handleStatusChange('Draft')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: currentStatus === 'Draft' ? '#ffffff' : '#6b7280',
                    backgroundColor: currentStatus === 'Draft' ? '#374151' : 'transparent',
                    borderRight: '1px solid #2d3342',
                    transition: 'all 0.15s',
                  }}
                >
                  Draft
                </div>

                {/* Confirm Step */}
                <div
                  onClick={() => handleStatusChange('Confirm')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: currentStatus === 'Confirm' ? '#ffffff' : '#6b7280',
                    backgroundColor: currentStatus === 'Confirm' ? '#6366f1' : 'transparent',
                    borderRight: '1px solid #2d3342',
                    transition: 'all 0.15s',
                  }}
                >
                  Confirm
                </div>

                {/* Cancelled Step */}
                <div
                  onClick={() => handleStatusChange('Cancelled')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: currentStatus === 'Cancelled' ? '#ffffff' : '#6b7280',
                    backgroundColor: currentStatus === 'Cancelled' ? '#ef4444' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  Cancelled
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                title="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form Header Title */}
          <div
            style={{
              padding: '24px 32px 12px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#818cf8',
                  letterSpacing: '0.05em',
                }}
              >
                {paymentType === 'Send' ? 'Bill Payment' : 'Customer Payment Receipt'}
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0 0', color: '#ffffff' }}>
                {payment.reference}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Document Reference</span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb' }}>
                {payment.documentNumber} <span style={{ fontSize: '12px', color: '#9ca3af' }}>({payment.documentType})</span>
              </div>
            </div>
          </div>

          {/* Main Form Fields Grid Matching Wireframe */}
          <div
            style={{
              padding: '16px 32px 28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Grid 2 Columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr',
                gap: '28px 40px',
              }}
            >
              {/* Row 1 Left: Payment Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                  Payment Type
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', height: '38px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: paymentType === 'Send' ? 600 : 400,
                      color: paymentType === 'Send' ? '#38bdf8' : '#6b7280',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === 'Send'}
                      onChange={() => setPaymentType('Send')}
                      style={{ accentColor: '#38bdf8', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Send</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: paymentType === 'Receive' ? 600 : 400,
                      color: paymentType === 'Receive' ? '#34d399' : '#6b7280',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === 'Receive'}
                      onChange={() => setPaymentType('Receive')}
                      style={{ accentColor: '#34d399', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Receive</span>
                  </label>
                </div>
              </div>

              {/* Row 1 Right: Date */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #4b5563',
                    borderRadius: 0,
                    color: '#ffffff',
                    padding: '6px 0',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  (Default Today's Date)
                </span>
              </div>

              {/* Row 2 Left: Partner */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>
                  Partner
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Mr Rahul"
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #4b5563',
                    borderRadius: 0,
                    color: '#ffffff',
                    padding: '6px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  Autofill Partner Name from Invoice/Bill
                </span>
              </div>

              {/* Row 2 Right: Payment Via */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>
                  Payment Via
                </label>
                <select
                  value={paymentVia}
                  onChange={(e) => setPaymentVia(e.target.value as 'Bank' | 'Cash')}
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: 'none',
                    borderBottom: '1px solid #4b5563',
                    borderRadius: 0,
                    color: '#ffffff',
                    padding: '6px 0',
                    fontSize: '15px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Bank" style={{ backgroundColor: '#1f2430' }}>Bank</option>
                  <option value="Cash" style={{ backgroundColor: '#1f2430' }}>Cash</option>
                </select>
                <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  Default set to Bank can be selected to Cash
                </span>
              </div>

              {/* Row 3 Left: Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>
                  Amount
                </label>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #4b5563' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#818cf8', marginRight: '6px' }}>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 0,
                      color: '#ffffff',
                      padding: '6px 0',
                      fontSize: '16px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
                <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  Autofill Amount Due from Invoice/Bill
                </span>
              </div>
            </div>

            {/* Row 4: Note / Memo */}
            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Alpha Numeric (Text)"
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #4b5563',
                  borderRadius: 0,
                  color: '#ffffff',
                  padding: '8px 0',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Footer Bar with Printable & Shareable Quick Actions */}
          <div
            className="no-print"
            style={{
              padding: '16px 32px',
              backgroundColor: '#12141a',
              borderTop: '1px solid #282d39',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  backgroundColor: '#232733',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  backgroundColor: '#232733',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Mail size={14} />
                <span>Send via Mail</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  backgroundColor: '#232733',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 18px',
                backgroundColor: '#374151',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReceiptModal;
