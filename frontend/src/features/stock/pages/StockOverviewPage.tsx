import React from 'react';

export interface StockOverviewPageProps {
  children?: React.ReactNode;
}

export const StockOverviewPage: React.FC<StockOverviewPageProps> = () => {
  return (
    <div className="stockoverviewpage">
      <h3>StockOverviewPage</h3>
    </div>
  );
};

export default StockOverviewPage;
