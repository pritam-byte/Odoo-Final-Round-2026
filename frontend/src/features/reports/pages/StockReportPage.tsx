import React from 'react';

export interface StockReportPageProps {
  children?: React.ReactNode;
}

export const StockReportPage: React.FC<StockReportPageProps> = () => {
  return (
    <div className="stockreportpage">
      <h3>StockReportPage</h3>
    </div>
  );
};

export default StockReportPage;
