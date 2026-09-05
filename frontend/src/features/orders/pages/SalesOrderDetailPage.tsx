import React from 'react';

export interface SalesOrderDetailPageProps {
  children?: React.ReactNode;
}

export const SalesOrderDetailPage: React.FC<SalesOrderDetailPageProps> = () => {
  return (
    <div className="salesorderdetailpage">
      <h3>SalesOrderDetailPage</h3>
    </div>
  );
};

export default SalesOrderDetailPage;
