import React from 'react';

export interface BudgetDetailPageProps {
  children?: React.ReactNode;
}

export const BudgetDetailPage: React.FC<BudgetDetailPageProps> = () => {
  return (
    <div className="budgetdetailpage">
      <h3>BudgetDetailPage</h3>
    </div>
  );
};

export default BudgetDetailPage;
