import React from 'react';

export interface SalesOrderListPageProps {
  children?: React.ReactNode;
}

export const SalesOrderListPage: React.FC<SalesOrderListPageProps> = () => {
  return (
    <div className="salesorderlistpage">
      <h3>SalesOrderListPage</h3>
    </div>
  );
};

export default SalesOrderListPage;
