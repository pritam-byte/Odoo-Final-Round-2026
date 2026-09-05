import React from 'react';

export interface AccountantNavProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

/**
 * AccountantNav: Formerly rendered the redundant 4 horizontal dropdowns (Sales, Purchase, Account, Report).
 * All navigation is now elegantly integrated into the expandable left sidebar accordion.
 */
export const AccountantNav: React.FC<AccountantNavProps> = () => {
  return null;
};

export default AccountantNav;
