import React from 'react';

export interface SalesSummaryCardProps {
  children?: React.ReactNode;
}

export const SalesSummaryCard: React.FC<SalesSummaryCardProps> = () => {
  return (
    <div className="salessummarycard">
      <h3>SalesSummaryCard</h3>
    </div>
  );
};

export default SalesSummaryCard;
