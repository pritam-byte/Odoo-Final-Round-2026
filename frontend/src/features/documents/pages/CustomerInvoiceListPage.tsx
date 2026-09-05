import React from 'react';

export interface CustomerInvoiceListPageProps {
  children?: React.ReactNode;
}

export const CustomerInvoiceListPage: React.FC<CustomerInvoiceListPageProps> = () => {
  return (
    <div className="customerinvoicelistpage">
      <h3>CustomerInvoiceListPage</h3>
    </div>
  );
};

export default CustomerInvoiceListPage;
