import React from 'react';

export interface CustomerInvoiceDetailPageProps {
  children?: React.ReactNode;
}

export const CustomerInvoiceDetailPage: React.FC<CustomerInvoiceDetailPageProps> = () => {
  return (
    <div className="customerinvoicedetailpage">
      <h3>CustomerInvoiceDetailPage</h3>
    </div>
  );
};

export default CustomerInvoiceDetailPage;
