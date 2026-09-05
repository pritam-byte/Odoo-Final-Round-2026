import React from 'react';

export interface CustomerInvoiceFormPageProps {
  children?: React.ReactNode;
}

export const CustomerInvoiceFormPage: React.FC<CustomerInvoiceFormPageProps> = () => {
  return (
    <div className="customerinvoiceformpage">
      <h3>CustomerInvoiceFormPage</h3>
    </div>
  );
};

export default CustomerInvoiceFormPage;
