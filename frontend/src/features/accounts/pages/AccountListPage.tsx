import React from 'react';

export interface AccountListPageProps {
  children?: React.ReactNode;
}

export const AccountListPage: React.FC<AccountListPageProps> = () => {
  return (
    <div className="accountlistpage">
      <h3>AccountListPage</h3>
    </div>
  );
};

export default AccountListPage;
