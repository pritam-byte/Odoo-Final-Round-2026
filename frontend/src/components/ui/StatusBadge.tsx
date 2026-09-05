import React from 'react';

export type StatusType =
  | 'completed'
  | 'paid'
  | 'active'
  | 'pending'
  | 'partial'
  | 'due'
  | 'overdue'
  | 'not-paid'
  | 'danger'
  | 'draft'
  | 'neutral'
  | 'archived';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  dot = false,
}) => {
  const normalized = status.toLowerCase().replace(/\s+/g, '-');
  
  let variantClass = 'badge-neutral';
  if (['completed', 'paid', 'active', 'success'].includes(normalized)) {
    variantClass = 'badge-completed';
  } else if (['pending', 'partial', 'due', 'warning'].includes(normalized)) {
    variantClass = 'badge-pending';
  } else if (['overdue', 'not-paid', 'danger', 'failed', 'cancelled'].includes(normalized)) {
    variantClass = 'badge-overdue';
  } else if (['draft', 'neutral', 'archived', 'inactive'].includes(normalized)) {
    variantClass = 'badge-neutral';
  }

  const displayText = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`badge-pill ${variantClass} ${className}`.trim()}>
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      {displayText}
    </span>
  );
};

export default StatusBadge;
