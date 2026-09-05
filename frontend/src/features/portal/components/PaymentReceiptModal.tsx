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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Banknote,
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
  const [showPaymentViaDropdown, setShowPaymentViaDropdown] = useState<boolean>(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState<boolean>(false);

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

  // Calendar View State
  const initialDateObj = payment.date ? new Date(payment.date) : new Date();
  const [calendarViewYear, setCalendarViewYear] = useState<number>(
    isNaN(initialDateObj.getFullYear()) ? new Date().getFullYear() : initialDateObj.getFullYear()
  );
  const [calendarViewMonth, setCalendarViewMonth] = useState<number>(
    isNaN(initialDateObj.getMonth()) ? new Date().getMonth() : initialDateObj.getMonth()
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const paymentViaRef = useRef<HTMLDivElement>(null);
  const calendarPickerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowSettingsDropdown(false);
      }
      if (paymentViaRef.current && !paymentViaRef.current.contains(target)) {
        setShowPaymentViaDropdown(false);
      }
      if (calendarPickerRef.current && !calendarPickerRef.current.contains(target)) {
        setShowCalendarPicker(false);
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
      showToast('Sharable receipt link copied to clipboard!');
    });
  };

  // Calendar Helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (calendarViewMonth === 0) {
      setCalendarViewMonth(11);
      setCalendarViewYear((prev) => prev - 1);
    } else {
      setCalendarViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarViewMonth === 11) {
      setCalendarViewMonth(0);
      setCalendarViewYear((prev) => prev + 1);
    } else {
      setCalendarViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const m = String(calendarViewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    setDate(`${calendarViewYear}-${m}-${d}`);
    setShowCalendarPicker(false);
  };

  const handleSetToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
    setCalendarViewYear(y);
    setCalendarViewMonth(now.getMonth());
    setShowCalendarPicker(false);
  };

  // Format date display (e.g. 05-09-2026)
  const formattedDisplayDate = () => {
    if (!date) return 'Select date';
    const parts = date.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return date;
  };

  return (
    <>
      {/* Global CSS for Print Slip View & Screen Scroll Elimination */}
      <style>{`
        /* Screen Styles */
        .modal-body-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .modal-body-container::-webkit-scrollbar {
          display: none;
        }

        /* Printable Payment Slip Layout */
        @media screen {
          #printable-slip {
            display: none !important;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
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
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            font-family: 'Inter', -apple-system, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="no-print-backdrop no-print"
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
        {/* Screen Modal Window */}
        <div
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
                top: '68px',
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
                zIndex: 200,
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Top Control Bar with Only Setting Cog & Actions */}
          <div
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

              {/* Cog Settings Button with Modern Dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  title="Receipt Settings & Actions"
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
                    border: '1px solid var(--color-border, #e5e7eb)',
                  }}
                >
                  <Settings size={16} color="var(--color-text-secondary, #4b5563)" />
                </button>

                {/* Modern Dropdown Menu */}
                {showSettingsDropdown && (
                  <div
                    className="dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '40px',
                      left: 0,
                      width: '220px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border, #e5e7eb)',
                      borderRadius: 'var(--radius-md, 8px)',
                      boxShadow: 'var(--shadow-dropdown)',
                      zIndex: 200,
                      padding: '6px',
                    }}
                  >
                    <div className="dropdown-header">
                      Receipt Actions
                    </div>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handlePrint}
                    >
                      <Printer size={15} color="var(--color-primary, #0f766e)" />
                      <div>
                        <strong>1. Print</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)' }}>Print payment slip</span>
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

            {/* Right Status Workflow Stage Chevrons */}
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
              padding: '22px 32px 14px 32px',
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

          {/* Main Form Fields Grid - No scroll view, clean layout */}
          <div
            className="modal-body-container"
            style={{
              padding: '24px 32px 32px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
              backgroundColor: 'var(--color-surface, #ffffff)',
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

              {/* Row 1 Right: Customized Modern Calendar Date Picker */}
              <div className="form-group" style={{ position: 'relative' }} ref={calendarPickerRef}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Date
                </label>
                <div
                  onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid var(--color-border)',
                    padding: '6px 0',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {formattedDisplayDate()}
                  </span>
                  <CalendarIcon size={16} color="var(--color-text-secondary)" />
                </div>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  (Default Today's Date)
                </span>

                {/* Customized Calendar Popover */}
                {showCalendarPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '64px',
                      right: 0,
                      width: '280px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border, #e5e7eb)',
                      borderRadius: 'var(--radius-md, 8px)',
                      boxShadow: 'var(--shadow-dropdown)',
                      zIndex: 300,
                      padding: '14px',
                    }}
                  >
                    {/* Month Navigator Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="btn-ghost"
                        style={{ padding: '4px', borderRadius: '4px' }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {monthNames[calendarViewMonth]} {calendarViewYear}
                      </strong>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="btn-ghost"
                        style={{ padding: '4px', borderRadius: '4px' }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Day of Week Labels */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        marginBottom: '6px',
                      }}
                    >
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Day Cells */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '2px',
                        textAlign: 'center',
                      }}
                    >
                      {/* Empty padding days */}
                      {Array.from({ length: firstDayOfMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ height: '28px' }} />
                      ))}

                      {/* Month Days */}
                      {Array.from({ length: daysInMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => {
                        const d = i + 1;
                        const isSelected =
                          date ===
                          `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        return (
                          <button
                            key={`day-${d}`}
                            type="button"
                            onClick={() => handleSelectDate(d)}
                            style={{
                              width: '28px',
                              height: '28px',
                              margin: 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'var(--color-primary, #0f766e)' : 'transparent',
                              color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover, #f9fafb)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>

                    {/* Calendar Footer Shortcuts */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--color-border-light, #f3f4f6)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDate('');
                          setShowCalendarPicker(false);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleSetToday}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary, #0f766e)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Today
                      </button>
                    </div>
                  </div>
                )}
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

              {/* Row 2 Right: Modern Customized Dropdown for Payment Via */}
              <div className="form-group" style={{ position: 'relative' }} ref={paymentViaRef}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Payment Via
                </label>
                <div
                  onClick={() => setShowPaymentViaDropdown(!showPaymentViaDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid var(--color-border)',
                    padding: '6px 0',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {paymentVia === 'Bank' ? (
                      <Building2 size={16} color="var(--color-primary, #0f766e)" />
                    ) : (
                      <Banknote size={16} color="var(--brand-purple, #7a4b70)" />
                    )}
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {paymentVia === 'Bank' ? 'Bank (Default)' : 'Cash'}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    color="var(--color-text-secondary)"
                    style={{
                      transform: showPaymentViaDropdown ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </div>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Default set to Bank can be selected to Cash
                </span>

                {/* Modern Dropdown Options Card */}
                {showPaymentViaDropdown && (
                  <div
                    className="dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '64px',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border, #e5e7eb)',
                      borderRadius: 'var(--radius-md, 8px)',
                      boxShadow: 'var(--shadow-dropdown)',
                      zIndex: 300,
                      padding: '4px',
                    }}
                  >
                    <button
                      type="button"
                      className={`dropdown-item ${paymentVia === 'Bank' ? 'active' : ''}`}
                      onClick={() => {
                        setPaymentVia('Bank');
                        setShowPaymentViaDropdown(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Building2 size={16} color="var(--color-primary, #0f766e)" />
                        <span style={{ fontSize: '13px', fontWeight: paymentVia === 'Bank' ? 600 : 500 }}>
                          Bank (Default)
                        </span>
                      </div>
                      {paymentVia === 'Bank' && <Check size={15} color="var(--color-primary, #0f766e)" />}
                    </button>

                    <button
                      type="button"
                      className={`dropdown-item ${paymentVia === 'Cash' ? 'active' : ''}`}
                      onClick={() => {
                        setPaymentVia('Cash');
                        setShowPaymentViaDropdown(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Banknote size={16} color="var(--brand-purple, #7a4b70)" />
                        <span style={{ fontSize: '13px', fontWeight: paymentVia === 'Cash' ? 600 : 500 }}>
                          Cash
                        </span>
                      </div>
                      {paymentVia === 'Cash' && <Check size={15} color="var(--color-primary, #0f766e)" />}
                    </button>
                  </div>
                )}
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
            <div className="form-group" style={{ marginTop: '2px' }}>
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
        </div>
      </div>

      {/* =========================================================================
          DEDICATED PRINTABLE PAYMENT SLIP VOUCHER (Clean A4 Paper Slip Layout)
          ========================================================================= */}
      <div id="printable-slip">
        {/* Company & Receipt Header */}
        <div
          style={{
            borderBottom: '2px solid #0f766e',
            paddingBottom: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f766e', margin: 0, letterSpacing: '-0.02em' }}>
              URBAN FURNITURE
            </h1>
            <p style={{ fontSize: '12px', color: '#4b5563', margin: '4px 0 0 0' }}>
              Premium Living & Office Infrastructure Solutions
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>
              GSTIN: 29AABCU1234F1Z8 | Contact: support@urbanfurniture.com | +91 98765 43210
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                color: '#0f766e',
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              Official Payment Voucher
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
              {payment.reference}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Issued on: {formattedDisplayDate()}
            </div>
          </div>
        </div>

        {/* Voucher Metadata Summary Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
              {paymentType === 'Send' ? 'Paid To (Vendor / Recipient)' : 'Received From (Customer)'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
              {partnerName}
            </div>
            <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
              Document Ref: <strong>{payment.documentNumber}</strong> ({payment.documentType.toUpperCase()})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
              Payment Method & Status
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
              {paymentVia === 'Bank' ? 'Bank Wire Transfer' : 'Cash at Counter'}
            </div>
            <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: 700, marginTop: '2px' }}>
              Status: {currentStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Itemized Table of Voucher Slip */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '24px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
                Description / Memo
              </th>
              <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', width: '140px' }}>
                Mode
              </th>
              <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', width: '130px' }}>
                Type
              </th>
              <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', width: '150px' }}>
                Amount Settled
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '14px', fontSize: '13px', color: '#111827' }}>
                <strong>{payment.documentNumber} Settlement</strong>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{note}</div>
              </td>
              <td style={{ padding: '14px', textAlign: 'center', fontSize: '13px', color: '#374151' }}>
                {paymentVia}
              </td>
              <td style={{ padding: '14px', textAlign: 'center', fontSize: '13px', color: '#374151' }}>
                {paymentType === 'Send' ? 'Payment Out' : 'Payment In'}
              </td>
              <td style={{ padding: '14px', textAlign: 'right', fontSize: '15px', fontWeight: 700, color: '#0f766e' }}>
                ₹{amount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Total Amount Box */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '36px' }}>
          <div
            style={{
              width: '280px',
              backgroundColor: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: '6px',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
              <span>Gross Total:</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#ccfbf1', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#0f766e' }}>
              <span>Total Paid:</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signatures & Slip Footer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            paddingTop: '28px',
            borderTop: '1px dashed #d1d5db',
            marginTop: '40px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }} />
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
              Partner / Customer Signature
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }} />
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
              Authorized Signatory (Urban Furniture)
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '11px', color: '#9ca3af' }}>
          This is an official computer-generated receipt voucher generated by Urban Furniture Accounting Portal.
        </div>
      </div>
    </>
  );
};

export default PaymentReceiptModal;


