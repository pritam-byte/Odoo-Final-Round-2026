import React from 'react';
import { UserRole } from '../schemas';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'User', label: 'User (Client Portal - Invoices & Dues only)' },
  { value: 'Accountant', label: 'Accountant (Sales, Purchases, COA, Journals, Reports)' },
  { value: 'Admin', label: 'Admin (Full System Access + User Management)' },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, disabled = false }) => {
  return (
    <CustomSelect<UserRole>
      value={value}
      onChange={onChange}
      options={roleOptions}
      disabled={disabled}
      width="100%"
    />
  );
};

export default RoleSelector;
