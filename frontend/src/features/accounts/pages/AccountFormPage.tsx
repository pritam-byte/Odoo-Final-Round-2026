import React from 'react';

export interface AccountFormPageProps {
  children?: React.ReactNode;
}

export const AccountFormPage: React.FC<AccountFormPageProps> = () => {
  return (
    <div className="accountformpage">
      <h3>AccountFormPage</h3>
    </div>
  );
};

export default AccountFormPage;
