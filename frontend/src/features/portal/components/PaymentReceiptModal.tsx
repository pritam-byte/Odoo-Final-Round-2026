import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Printer,
  Mail,
  X,
  CheckCircle2,
  Share2,
  Check,
  Receipt,
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
            border: 1px solid #e5e7eb !important;
            padding: 30px !important;
            background: #ffffff !important;
            color: #1f2937 !important;
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
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)',
          padding: '16px',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal Window in Main Theme */}
        <div
          id="printable-payment-modal"
          ref={printableReceiptRef}
          className="card-panel"
          style={{
            width: '100%',
            maxWidth: '780px',
            backgroundColor: 'var(--color-surface, #ffffff)',
            color: 'var(--color-text-primary, #1f2937)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--color-border, #e5e7eb)',
            boxShadow: 'var(--shadow-lg, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxHeight: '92vh',
          }}
        >
          {/* Toast Notification inside Modal */}
          {toastMessage && (
            <div
              style={{
                position: 'absolute',
                top: '72px',
                right: '24px',
                backgroundColor: 'var(--color-primary, #0f766e)',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm, 6px)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Top Control Bar Matching Wireframe in Main Light Theme */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 24px',
              backgroundColor: 'var(--color-surface, #ffffff)',
              borderBottom: '1px solid var(--color-border, #e5e7eb)',
            }}
          >
            {/* Left Action Buttons & Cog */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className={`btn btn-sm ${currentStatus === 'Confirm' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleStatusChange('Confirm')}
                style={{
                  fontWeight: 600,
                  boxShadow: currentStatus === 'Confirm' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Confirm
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleStatusChange('Cancelled')}
                style={{
                  color: currentStatus === 'Cancelled' ? 'var(--color-danger, #dc2626)' : 'var(--color-text-secondary, #4b5563)',
                  borderColor: currentStatus === 'Cancelled' ? 'var(--color-danger, #dc2626)' : 'var(--color-border, #e5e7eb)',
                  backgroundColor: currentStatus === 'Cancelled' ? 'var(--color-danger-bg, #fee2e2)' : '#ffffff',
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
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '34px',
                    height: '34px',
                    padding: 0,
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: showSettingsDropdown ? 'var(--color-surface-active, #f3f4f6)' : '#ffffff',
                  }}
                >
                  <Settings size={16} color="var(--color-text-secondary, #4b5563)" />
                </button>

                {/* Dropdown Menu in Main Theme */}
                {showSettingsDropdown && (
                  <div
                    className="dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '40px',
                      left: 0,
                      width: '210px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border, #e5e7eb)',
                      borderRadius: 'var(--radius-md, 8px)',
                      boxShadow: 'var(--shadow-dropdown)',
                      zIndex: 200,
                      padding: '6px',
                    }}
                  >
                    <div className="dropdown-header">
                      Receipt Options
                    </div>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handlePrint}
                    >
                      <Printer size={15} color="var(--color-primary, #0f766e)" />
                      <div>
                        <strong>1. Print</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)' }}>Print or PDF download</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handleSendEmail}
                    >
                      <Mail size={15} color="var(--brand-purple, #7a4b70)" />
                      <div>
                        <strong>2. Send</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)' }}>Send via Email</span>
                      </div>
                    </button>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        handleCopyShareLink();
                      }}
                    >
                      <Share2 size={15} color="var(--color-warning, #d97706)" />
                      <div>
                        <strong>Share Link</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)' }}>Copy receipt URL</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Status Workflow Stage Chevrons in Main Odoo Style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-bg, #f8f9fa)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  overflow: 'hidden',
                  padding: '2px',
                }}
              >
                {/* Draft Step */}
                <div
                  onClick={() => handleStatusChange('Draft')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    color: currentStatus === 'Draft' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    backgroundColor: currentStatus === 'Draft' ? 'var(--color-surface-active, #f3f4f6)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Draft
                </div>

                {/* Confirm Step */}
                <div
                  onClick={() => handleStatusChange('Confirm')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    color: currentStatus === 'Confirm' ? '#ffffff' : 'var(--color-text-muted)',
                    backgroundColor: currentStatus === 'Confirm' ? 'var(--color-primary, #0f766e)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Confirm
                </div>

                {/* Cancelled Step */}
                <div
                  onClick={() => handleStatusChange('Cancelled')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    color: currentStatus === 'Cancelled' ? '#ffffff' : 'var(--color-text-muted)',
                    backgroundColor: currentStatus === 'Cancelled' ? 'var(--color-danger, #dc2626)' : 'transparent',
                    transition: 'all 0.15s ease',
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
                className="btn-ghost"
                style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form Header Title */}
          <div
            style={{
              padding: '24px 32px 14px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border-light, #f3f4f6)',
              backgroundColor: 'var(--color-surface, #ffffff)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary, #0f766e)',
                  letterSpacing: '0.06em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Receipt size={13} />
                {paymentType === 'Send' ? 'Bill Payment' : 'Customer Payment Receipt'}
              </span>
              <h2
                className="page-title"
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: '4px 0 0 0',
                  color: 'var(--color-text-primary, #1f2937)',
                }}
              >
                {payment.reference}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Document Reference
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {payment.documentNumber}{' '}
                <span className="badge-pill badge-neutral" style={{ fontSize: '11px', marginLeft: '4px' }}>
                  {payment.documentType}
                </span>
              </div>
            </div>
          </div>

          {/* Main Form Fields Grid Matching Wireframe in Main Theme */}
          <div
            style={{
              padding: '24px 32px 28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              backgroundColor: 'var(--color-surface, #ffffff)',
              overflowY: 'auto',
            }}
          >
            {/* Grid 2 Columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr',
                gap: '24px 36px',
              }}
            >
              {/* Row 1 Left: Payment Type */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Payment Type
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '6px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: paymentType === 'Send' ? 600 : 500,
                      color: paymentType === 'Send' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === 'Send'}
                      onChange={() => setPaymentType('Send')}
                      style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Send (Paid to Vendor)</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: paymentType === 'Receive' ? 600 : 500,
                      color: paymentType === 'Receive' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === 'Receive'}
                      onChange={() => setPaymentType('Receive')}
                      style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Receive (From Customer)</span>
                  </label>
                </div>
              </div>

              {/* Row 1 Right: Date */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  style={{
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: '2px solid var(--color-border)',
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                    padding: '6px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  (Default Today's Date)
                </span>
              </div>

              {/* Row 2 Left: Partner */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Partner
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Mr Rahul"
                  className="form-input"
                  style={{
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: '2px solid var(--color-border)',
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                    padding: '6px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Autofill Partner Name from Invoice/Bill
                </span>
              </div>

              {/* Row 2 Right: Payment Via */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Payment Via
                </label>
                <select
                  value={paymentVia}
                  onChange={(e) => setPaymentVia(e.target.value as 'Bank' | 'Cash')}
                  className="form-input"
                  style={{
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: '2px solid var(--color-border)',
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                    padding: '6px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <option value="Bank">Bank (Default)</option>
                  <option value="Cash">Cash</option>
                </select>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Default set to Bank can be selected to Cash
                </span>
              </div>

              {/* Row 3 Left: Amount */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Amount
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '2px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginRight: '6px' }}>₹</span>
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
                      color: 'var(--color-text-primary)',
                      padding: '6px 0',
                      fontSize: '16px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Autofill Amount Due from Invoice/Bill
                </span>
              </div>
            </div>

            {/* Row 4: Note / Memo */}
            <div className="form-group" style={{ marginTop: '4px' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Alpha Numeric (Text)"
                className="form-input"
                style={{
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: '2px solid var(--color-border)',
                  borderRadius: 0,
                  backgroundColor: 'transparent',
                  padding: '8px 0',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Footer Bar with Printable & Shareable Quick Actions in Main Theme */}
          <div
            className="no-print"
            style={{
              padding: '16px 24px',
              backgroundColor: 'var(--color-surface-hover, #f9fafb)',
              borderTop: '1px solid var(--color-border, #e5e7eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handlePrint}
                style={{ gap: '6px' }}
              >
                <Printer size={14} color="var(--color-primary)" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleSendEmail}
                style={{ gap: '6px' }}
              >
                <Mail size={14} color="var(--brand-purple)" />
                <span>Send via Mail</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCopyShareLink}
                style={{ gap: '6px' }}
              >
                {copiedLink ? <Check size={14} color="var(--color-success)" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
              </button>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
              style={{ fontWeight: 600 }}
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

