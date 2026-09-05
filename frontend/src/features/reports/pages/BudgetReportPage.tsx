import React from 'react';

export interface BudgetReportPageProps {
  children?: React.ReactNode;
}

export const BudgetReportPage: React.FC<BudgetReportPageProps> = () => {
  return (
    <div className="budgetreportpage">
      <h3>BudgetReportPage</h3>
    </div>
  );
};

export default BudgetReportPage;
