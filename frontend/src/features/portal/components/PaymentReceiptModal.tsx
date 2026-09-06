import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Printer,
  Mail,
  X,
  CheckCircle2,
  Share2,
  Receipt,
  Building2,
  Banknote,
  FileText,
  Layers,
  Calendar,
  ShieldCheck,
  Package,
  Zap,
} from 'lucide-react';
import { PortalPayment, DocumentLineItem } from '../schemas';
import { getMyScopedDocuments } from '../api';

export interface PaymentReceiptModalProps {
  payment: PortalPayment;
  onClose: () => void;
  onUpdate?: (updatedPayment: PortalPayment) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  onClose,
}) => {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isBill = payment.documentType === 'bill';
  const partnerName = payment.partnerName || (isBill ? 'Urban Timbers & Supplies Ltd' : 'John Doe (Customer)');
  const amount = payment.amount;
  const paymentVia = payment.paymentMethod || 'Bank';
  const date = payment.date || new Date().toISOString().split('T')[0];
  const note = payment.note || `Self-Service Portal settlement for ${payment.documentNumber}`;

  // Retrieve linked document line items (furniture products or raw materials)
  const allDocs = getMyScopedDocuments();
  const linkedDoc = allDocs.find(
    (d) => d.id === payment.documentId || d.number === payment.documentNumber
  );

  const lineItems: DocumentLineItem[] = linkedDoc?.lines && linkedDoc.lines.length > 0
    ? linkedDoc.lines
    : [
        {
          id: 'l_default',
          product: isBill ? 'Raw Timber Plank & Hardware Supplies' : 'Solid Wood Furniture Order Items',
          quantity: 1,
          unitPrice: amount,
          total: amount,
        },
      ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
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

  const handlePrint = () => {
    setShowSettingsDropdown(false);
    window.print();
  };

  const handleSendEmail = () => {
    setShowSettingsDropdown(false);
    const subject = encodeURIComponent(
      `${isBill ? 'Payment Voucher' : 'Payment Receipt'} - ${payment.reference} (${payment.documentNumber})`
    );
    const body = encodeURIComponent(
      `Hello ${partnerName},\n\n` +
      `Here is the official confirmation for your transaction:\n\n` +
      `----------------------------------------\n` +
      `${isBill ? 'Voucher #' : 'Receipt #'}: ${payment.reference}\n` +
      `Document Reference: ${payment.documentNumber} (${isBill ? 'Supply Bill' : 'Customer Invoice'})\n` +
      `${isBill ? 'Paid To (Supplier)' : 'Billed To (Customer)'}: ${partnerName}\n` +
      `Amount: ₹${amount.toFixed(2)}\n` +
      `Date: ${date}\n` +
      `Payment Method: ${paymentVia}\n` +
      `Note: ${note}\n` +
      `Status: Confirmed & Settled\n` +
      `----------------------------------------\n\n` +
      `Thank you for doing business with Urban Furniture.\n`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    showToast('Email client opened with receipt details.');
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/portal/payments?ref=${payment.reference}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Sharable receipt link copied to clipboard!');
    });
  };

  return (
    <>
      {/* Global CSS for Print Slip View */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-slip, #printable-slip * {
            visibility: visible !important;
          }
          #printable-slip {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            color: #111827 !important;
            padding: 24px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            font-family: 'Inter', -apple-system, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Backdrop */}
      <div
        className="no-print"
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
          padding: '16px',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Screen Modal Window */}
        <div
          className="card-panel custom-modal-box"
          style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxHeight: '90vh',
          }}
        >
          {/* Toast Notification inside Modal */}
          {toastMessage && (
            <div
              style={{
                position: 'absolute',
                top: '64px',
                right: '20px',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 300,
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              }}
            >
              <CheckCircle2 size={15} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Modal Top Control Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              backgroundColor: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Receipt size={16} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                  {isBill ? 'Vendor Payment Voucher' : 'Customer Payment Receipt'}
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {payment.reference}
                </div>
              </div>
            </div>

            {/* Actions: Settings Cog & Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  title="Receipt Settings & Export"
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: showSettingsDropdown ? 'var(--color-surface-active)' : '#ffffff',
                  }}
                >
                  <Settings size={15} color="var(--color-text-secondary)" />
                </button>

                {showSettingsDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '38px',
                      right: 0,
                      width: '200px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-dropdown)',
                      zIndex: 200,
                      padding: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        padding: '4px 8px 6px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Receipt Options
                    </div>
                    <button
                      type="button"
                      onClick={handlePrint}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Printer size={14} color="var(--color-primary)" />
                      <span>Print Voucher Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Mail size={14} color="var(--brand-purple)" />
                      <span>Send via Email</span>
                    </button>
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
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Share2 size={14} color="var(--color-warning)" />
                      <span>Copy Share Link</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: 'var(--radius-full)' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Official Voucher Body (Scrollable Screen Presentation) */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
            {/* Slip Header Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px dashed var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="brand-logo-icon" style={{ width: '32px', height: '32px' }}>
                  <Layers size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Urban Furniture
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Official Settlement Receipt Voucher
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={14} />
                <span>CONFIRMED & SETTLED</span>
              </div>
            </div>

            {/* Structured Details Grid */}
            <div
              className="responsive-modal-grid-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                backgroundColor: 'var(--color-bg)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Partner / Customer / Supplier */}
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {isBill ? 'Supplier / Payee' : 'Customer / Billed To'}
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {partnerName}
                </div>
              </div>

              {/* Document Reference */}
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Document Reference
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} />
                  <span>{payment.documentNumber}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    ({isBill ? 'Supply Bill' : 'Invoice'})
                  </span>
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Payment Date
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span>{date}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Payment Method
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {paymentVia === 'Razorpay' ? (
                    <Zap size={14} style={{ color: '#0d9488' }} />
                  ) : paymentVia === 'Bank' ? (
                    <Building2 size={14} style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <Banknote size={14} style={{ color: 'var(--color-primary)' }} />
                  )}
                  <span>
                    {paymentVia === 'Razorpay'
                      ? 'Razorpay Online (UPI / Cards)'
                      : paymentVia === 'Bank'
                      ? 'Bank Transfer / Online'
                      : 'Cash / Counter'}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Products & Services Table */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Package size={14} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-primary)', letterSpacing: '0.04em' }}>
                  {isBill ? 'Supplied Raw Materials & Services' : 'Purchased Products & Furniture'}
                </span>
              </div>

              <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <table className="custom-table">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                      <th style={{ width: '40px', fontSize: '11px' }}>#</th>
                      <th style={{ fontSize: '11px' }}>Item Description</th>
                      <th style={{ textAlign: 'center', width: '60px', fontSize: '11px' }}>Qty</th>
                      <th style={{ textAlign: 'right', width: '100px', fontSize: '11px' }}>Unit Price</th>
                      <th style={{ textAlign: 'right', width: '100px', fontSize: '11px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((line, idx) => (
                      <tr key={line.id}>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text-primary)' }}>
                          {line.product}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '12px' }}>{line.quantity}</td>
                        <td style={{ textAlign: 'right', fontSize: '12px' }}>₹{line.unitPrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '12px', color: 'var(--color-text-primary)' }}>
                          ₹{line.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Settled Amount Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-primary-border)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Settled Amount
                </span>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Payment settled in full
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)' }}>
                ₹{amount.toFixed(2)}
              </div>
            </div>

            {/* Note / Memo */}
            {note && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', padding: '0 4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Memo:</span>{' '}
                {note}
              </div>
            )}

            {/* Bottom Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '14px',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handlePrint}
                style={{ gap: '6px' }}
              >
                <Printer size={14} />
                <span>Print Official Slip</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onClose}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Slip Version (Optimized for Paper & PDF) */}
      <div id="printable-slip" style={{ display: 'none' }}>
        {/* Print Slip Header */}
        <div style={{ borderBottom: '2px solid #111827', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.02em' }}>URBAN FURNITURE</h1>
            <p style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0 0 0' }}>Official Financial Payment Receipt Voucher</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#0f766e', border: '1.5px solid #0f766e', padding: '3px 8px', borderRadius: '4px' }}>
              SETTLED & CONFIRMED
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', color: '#111827' }}>{payment.reference}</div>
          </div>
        </div>

        {/* Transaction Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px', padding: '14px 16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>
              {isBill ? 'Payee / Supplier:' : 'Customer / Recipient:'}
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>{partnerName}</div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Document Reference:</span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>{payment.documentNumber} ({isBill ? 'Supply Bill' : 'Customer Invoice'})</div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Payment Date:</span>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', marginTop: '2px' }}>{date}</div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Payment Mode:</span>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', marginTop: '2px' }}>{paymentVia} Transfer</div>
          </div>
        </div>

        {/* Itemized Line Items Table for Print */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '6px', letterSpacing: '0.04em' }}>
            {isBill ? 'Supplied Items Breakdown:' : 'Purchased Products Breakdown:'}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', width: '30px' }}>#</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Item Description</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', width: '50px' }}>Qty</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', width: '90px' }}>Unit Price</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', width: '90px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line, idx) => (
                <tr key={line.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px 8px', color: '#6b7280' }}>{idx + 1}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: '#111827' }}>{line.product}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{line.quantity}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{line.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>₹{line.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Settled Amount Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1.5px solid #0f766e', borderRadius: '6px', marginBottom: '16px', backgroundColor: '#f0fdfa' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f766e' }}>TOTAL SETTLED AMOUNT:</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f766e' }}>₹{amount.toFixed(2)}</span>
        </div>

        {/* Memo */}
        <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '40px' }}>
          <strong>Transaction Memo:</strong> {note}
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', fontSize: '11px', color: '#4b5563' }}>
          <div>
            <strong>Authorized Signatory</strong><br />
            Urban Furniture Accounts Desk<br /><br />
            _________________________
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Recipient Acknowledgment</strong><br />
            {partnerName}<br /><br />
            _________________________
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReceiptModal;
