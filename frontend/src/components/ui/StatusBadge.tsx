import React from 'react';

export type StatusVariant = 'completed' | 'paid' | 'pending' | 'partial' | 'due' | 'overdue' | 'not_paid' | 'draft' | 'default';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant }) => {
  const getBadgeClass = (): string => {
    const v = variant || status.toLowerCase().replace(/\s+/g, '_');
    switch (v) {
      case 'completed':
      case 'paid':
        return 'badge-pill badge-success';
      case 'pending':
      case 'partial':
      case 'due':
        return 'badge-pill badge-warning';
      case 'overdue':
      case 'not_paid':
        return 'badge-pill badge-danger';
      case 'draft':
      case 'default':
      default:
        return 'badge-pill badge-neutral';
    }
  };

  return (
    <span className={getBadgeClass()}>
      {status}
    </span>
  );
};

export default StatusBadge;
