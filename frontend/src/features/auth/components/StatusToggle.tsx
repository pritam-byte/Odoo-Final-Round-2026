import React from 'react';
import { UserStatus } from '../schemas';

export interface StatusToggleProps {
  status: UserStatus;
  onToggle: () => void;
  disabled?: boolean;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({ status, onToggle, disabled = false }) => {
  const isActive = status === 'Active';

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="btn btn-sm"
      style={{
        backgroundColor: isActive ? 'var(--color-success-bg)' : 'var(--color-neutral-badge-bg)',
        color: isActive ? 'var(--color-success-text)' : 'var(--color-neutral-badge-text)',
        border: '1px solid ' + (isActive ? 'var(--color-primary-border)' : 'var(--color-border)'),
        borderRadius: 'var(--radius-full)',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      title={isActive ? 'Click to deactivate user' : 'Click to activate user'}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-text-light)'
        }}
      />
      <span>{status}</span>
    </button>
  );
};

export default StatusToggle;
