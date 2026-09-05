import React from 'react';
import { UserRole } from '../schemas';

export interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, disabled = false }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as UserRole)}
      disabled={disabled}
      className="select-filter"
      style={{
        width: '100%',
        padding: '9px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--color-text-primary)'
      }}
    >
      <option value="User">User (Client Portal - Invoices & Dues only)</option>
      <option value="Accountant">Accountant (Sales, Purchases, COA, Journals, Reports)</option>
      <option value="Admin">Admin (Full System Access + User Management)</option>
    </select>
  );
};

export default RoleSelector;
