import React from 'react';

export interface SalesOrderFormPageProps {
  children?: React.ReactNode;
}

export const SalesOrderFormPage: React.FC<SalesOrderFormPageProps> = () => {
  return (
    <div className="salesorderformpage">
      <h3>SalesOrderFormPage</h3>
    </div>
  );
};

export default SalesOrderFormPage;
