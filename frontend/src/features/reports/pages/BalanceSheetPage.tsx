import React from 'react';

export interface BalanceSheetPageProps {
  children?: React.ReactNode;
}

export const BalanceSheetPage: React.FC<BalanceSheetPageProps> = () => {
  return (
    <div className="balancesheetpage">
      <h3>BalanceSheetPage</h3>
    </div>
  );
};

export default BalanceSheetPage;
