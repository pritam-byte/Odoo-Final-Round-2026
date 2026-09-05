import React from 'react';

export interface BudgetProgressChartProps {
  children?: React.ReactNode;
}

export const BudgetProgressChart: React.FC<BudgetProgressChartProps> = () => {
  return (
    <div className="budgetprogresschart">
      <h3>BudgetProgressChart</h3>
    </div>
  );
};

export default BudgetProgressChart;
