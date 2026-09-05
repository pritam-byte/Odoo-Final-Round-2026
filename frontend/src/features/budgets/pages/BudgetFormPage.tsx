import React from 'react';

export interface BudgetFormPageProps {
  children?: React.ReactNode;
}

export const BudgetFormPage: React.FC<BudgetFormPageProps> = () => {
  return (
    <div className="budgetformpage">
      <h3>BudgetFormPage</h3>
    </div>
  );
};

export default BudgetFormPage;
