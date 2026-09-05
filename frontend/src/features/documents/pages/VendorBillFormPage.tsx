import React from 'react';

export interface VendorBillFormPageProps {
  children?: React.ReactNode;
}

export const VendorBillFormPage: React.FC<VendorBillFormPageProps> = () => {
  return (
    <div className="vendorbillformpage">
      <h3>VendorBillFormPage</h3>
    </div>
  );
};

export default VendorBillFormPage;
