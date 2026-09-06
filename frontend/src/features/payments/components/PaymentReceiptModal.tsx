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
  ExternalLink,
} from 'lucide-react';
import { PaymentRecord } from '../../accounting/store';

export interface PaymentReceiptModalProps {
  payment: PaymentRecord;
  onClose: () => void;
  onNavigateToJournal?: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  onClose,
  onNavigateToJournal,
}) => {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isReceive = payment.type === 'Receive';
  const partnerName = payment.partnerName;
  const amount = payment.amount;
  const paymentVia = payment.paymentVia || 'Bank';
  const date = payment.date || new Date().toISOString().split('T')[0];
  const reference = payment.reference || `Direct ${payment.type} Payment`;

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
      `${isReceive ? 'Payment Receipt' : 'Payment Disbursement Voucher'} - ${reference}`
    );
    const body = encodeURIComponent(
      `Hello ${partnerName},\n\n` +
      `Here is the official confirmation for your transaction:\n\n` +
      `----------------------------------------\n` +
      `Voucher / Receipt #: ${reference}\n` +
      `Transaction Type: ${isReceive ? 'Customer Collection (Inflow)' : 'Vendor Disbursement (Outflow)'}\n` +
      `Partner / Entity: ${partnerName}\n` +
      `Amount: ₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `Date: ${date}\n` +
      `Payment Method: ${paymentVia} Account\n` +
      `Status: Confirmed, Posted & Reconciled\n` +
      `----------------------------------------\n\n` +
      `Urban Furniture Accounting & Treasury Department\n`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    showToast('Email client opened with receipt details.');
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/#payments?ref=${payment.reference}`;
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
            margin: 15mm;
          }
          body * {
            visibility: hidden !important;
          }
          #accountant-printable-slip, #accountant-printable-slip * {
            visibility: visible !important;
          }
          #accountant-printable-slip {
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            maxWidth: '660px',
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
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: isReceive ? 'var(--color-primary)' : 'var(--color-warning)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isReceive ? 'Customer Collection Receipt' : 'Vendor Disbursement Voucher'}
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
                      width: '210px',
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
                      Audit & Print Options
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
                      <span>Print Voucher PDF</span>
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
                      <span>Send to Partner Email</span>
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
                      <span>Copy Direct Voucher Link</span>
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

          {/* Official Voucher Body */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Slip Header Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: '1px dashed var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="brand-logo-icon" style={{ width: '32px', height: '32px' }}>
                  <Layers size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Urban Furniture Accounting
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Enterprise Treasury & Ledger Record
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={14} />
                <span>POSTED & RECONCILED</span>
              </div>
            </div>

            {/* Structured Details Grid */}
            <div
              className="responsive-modal-grid-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                backgroundColor: 'var(--color-bg)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {isReceive ? 'Customer / Remitter' : 'Vendor / Beneficiary'}
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {partnerName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Source Document / Memo
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} />
                  <span>{reference}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Transaction Date
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span>{date}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Payment Method
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {paymentVia === 'Bank' ? (
                    <Building2 size={14} style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <Banknote size={14} style={{ color: 'var(--color-primary)' }} />
                  )}
                  <span>{paymentVia === 'Bank' ? 'Bank Account / Electronic' : 'Cash Account / Register'}</span>
                </div>
              </div>
            </div>

            {/* Settled Amount Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                backgroundColor: isReceive ? '#ecfdf5' : '#fff7ed',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isReceive ? '#a7f3d0' : '#fed7aa'}`,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isReceive ? '#047857' : '#c2410c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Total Transaction Amount
                </span>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {isReceive ? 'Collections received into liquid account' : 'Disbursements settled from liquid account'}
                </div>
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: isReceive ? '#047857' : '#c2410c',
                }}
              >
                {isReceive ? '+' : '-'}₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Double-Entry Ledger Preview */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Automated Double-Entry Ledger Posting
                </span>
                {onNavigateToJournal && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: '11px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={onNavigateToJournal}
                  >
                    <span>View in Journals</span>
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>

              <table className="custom-table" style={{ backgroundColor: '#ffffff', borderRadius: '4px', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Partner</th>
                    <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {isReceive ? (
                    <>
                      <tr>
                        <td style={{ fontWeight: 600 }}>{paymentVia} Account (Asset Dr)</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{partnerName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>—</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Debtors / Receivables (Asset Cr)</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{partnerName}</td>
                        <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>—</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Creditors / Payables (Liability Dr)</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{partnerName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-danger)' }}>
                          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>—</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>{paymentVia} Account (Asset Cr)</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{partnerName}</td>
                        <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>—</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-danger)' }}>
                          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '16px',
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
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Slip Version */}
      <div id="accountant-printable-slip" style={{ display: 'none' }}>
        <div style={{ borderBottom: '2px solid #111827', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#111827' }}>URBAN FURNITURE</h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Official Financial Transaction & Treasury Voucher</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#0f766e', border: '1px solid #0f766e', padding: '3px 8px', borderRadius: '4px' }}>
              SETTLED & RECONCILED
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px' }}>{payment.reference}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>
              {isReceive ? 'Customer / Remitter:' : 'Vendor / Beneficiary:'}
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{partnerName}</div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Transaction Type:</span>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
              {isReceive ? 'Customer Collection (Inflow)' : 'Vendor Disbursement (Outflow)'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Payment Date:</span>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{date}</div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Payment Mode:</span>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{paymentVia} Account</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '2px solid #0f766e', borderRadius: '6px', marginBottom: '24px', backgroundColor: '#f0fdfa' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f766e' }}>TOTAL SETTLED AMOUNT:</span>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e' }}>₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>

        <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '40px' }}>
          <strong>Reference Note:</strong> {reference}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
          <div>Chief Accountant / Authorizer<br /><br />_________________________</div>
          <div>Recipient Acknowledgment<br /><br />_________________________</div>
        </div>
      </div>
    </>
  );
};

export default PaymentReceiptModal;
