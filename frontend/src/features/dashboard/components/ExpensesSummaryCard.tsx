import React from 'react';

export interface ExpensesSummaryCardProps {
  children?: React.ReactNode;
}

export const ExpensesSummaryCard: React.FC<ExpensesSummaryCardProps> = () => {
  return (
    <div className="expensessummarycard">
      <h3>ExpensesSummaryCard</h3>
    </div>
  );
};

export default ExpensesSummaryCard;
