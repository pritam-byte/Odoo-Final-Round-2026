import React from 'react';

export interface BudgetListPageProps {
  children?: React.ReactNode;
}

export const BudgetListPage: React.FC<BudgetListPageProps> = () => {
  return (
    <div className="budgetlistpage">
      <h3>BudgetListPage</h3>
    </div>
  );
};

export default BudgetListPage;
