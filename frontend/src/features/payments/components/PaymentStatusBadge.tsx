import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  CreditCard,
  FileCheck,
} from 'lucide-react';

export type PaymentStatusType =
  | 'Paid'
  | 'PAID'
  | 'Partial'
  | 'PARTIAL'
  | 'Partially Paid'
  | 'Unpaid'
  | 'NOT_PAID'
  | 'Not Paid'
  | 'Overdue'
  | 'OVERDUE'
  | 'Draft'
  | 'Posted'
  | 'Reconciled';

export interface PaymentStatusBadgeProps {
  status: PaymentStatusType | string;
  size?: 'sm' | 'md';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const isSmall = size === 'sm';
  const iconSize = isSmall ? 12 : 14;
  const padding = isSmall ? '2px 8px' : '4px 10px';
  const fontSize = isSmall ? '11px' : '12px';

  if (normalized === 'PAID') {
    return (
      <span
        className="badge-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          padding,
          fontSize,
          fontWeight: 700,
          borderRadius: '9999px',
        }}
      >
        <CheckCircle2 size={iconSize} />
        Paid
      </span>
    );
  }

  if (normalized === 'PARTIAL' || normalized === 'PARTIALLY_PAID') {
    return (
      <span
        className="badge-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#fffbeb',
          color: '#92400e',
          border: '1px solid #fde68a',
          padding,
          fontSize,
          fontWeight: 700,
          borderRadius: '9999px',
        }}
      >
        <Clock size={iconSize} />
        Partially Paid
      </span>
    );
  }

  if (normalized === 'OVERDUE') {
    return (
      <span
        className="badge-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca',
          padding,
          fontSize,
          fontWeight: 700,
          borderRadius: '9999px',
        }}
      >
        <AlertCircle size={iconSize} />
        Overdue
      </span>
    );
  }

  if (normalized === 'UNPAID' || normalized === 'NOT_PAID') {
    return (
      <span
        className="badge-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#f1f5f9',
          color: '#475569',
          border: '1px solid #cbd5e1',
          padding,
          fontSize,
          fontWeight: 600,
          borderRadius: '9999px',
        }}
      >
        <Clock size={iconSize} />
        Unpaid
      </span>
    );
  }

  if (normalized === 'POSTED' || normalized === 'RECONCILED') {
    return (
      <span
        className="badge-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          border: '1px solid #bfdbfe',
          padding,
          fontSize,
          fontWeight: 700,
          borderRadius: '9999px',
        }}
      >
        <FileCheck size={iconSize} />
        Posted
      </span>
    );
  }

  return (
    <span
      className="badge-pill badge-neutral"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
      }}
    >
      {status}
    </span>
  );
};

export const PaymentDirectionBadge: React.FC<{ type: 'Receive' | 'Send' | string; size?: 'sm' | 'md' }> = ({
  type,
  size = 'md',
}) => {
  const isReceive = type === 'Receive' || type === 'RECEIVE';
  const isSmall = size === 'sm';
  const iconSize = isSmall ? 12 : 14;
  const padding = isSmall ? '2px 8px' : '4px 10px';
  const fontSize = isSmall ? '11px' : '12px';

  return (
    <span
      className="badge-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: isReceive ? '#ecfdf5' : '#fff7ed',
        color: isReceive ? '#047857' : '#c2410c',
        border: `1px solid ${isReceive ? '#a7f3d0' : '#fed7aa'}`,
        padding,
        fontSize,
        fontWeight: 700,
        borderRadius: '9999px',
      }}
    >
      {isReceive ? <ArrowDownLeft size={iconSize} /> : <ArrowUpRight size={iconSize} />}
      {isReceive ? 'Collection (In)' : 'Disbursement (Out)'}
    </span>
  );
};

export const PaymentMethodBadge: React.FC<{ method: 'Bank' | 'Cash' | string; size?: 'sm' | 'md' }> = ({
  method,
  size = 'md',
}) => {
  const isBank = method === 'Bank' || method === 'BANK';
  const isSmall = size === 'sm';
  const iconSize = isSmall ? 12 : 14;
  const padding = isSmall ? '2px 8px' : '4px 10px';
  const fontSize = isSmall ? '11px' : '12px';

  return (
    <span
      className="badge-pill badge-neutral"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
      }}
    >
      {isBank ? <Building size={iconSize} /> : <CreditCard size={iconSize} />}
      {isBank ? 'Bank Account' : 'Cash Account'}
    </span>
  );
};

export default PaymentStatusBadge;
