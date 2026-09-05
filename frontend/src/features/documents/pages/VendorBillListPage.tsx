import React from 'react';

export interface VendorBillListPageProps {
  children?: React.ReactNode;
}

export const VendorBillListPage: React.FC<VendorBillListPageProps> = () => {
  return (
    <div className="vendorbilllistpage">
      <h3>VendorBillListPage</h3>
    </div>
  );
};

export default VendorBillListPage;
