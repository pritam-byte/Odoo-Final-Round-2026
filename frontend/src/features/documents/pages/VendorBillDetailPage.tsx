import React from 'react';

export interface VendorBillDetailPageProps {
  children?: React.ReactNode;
}

export const VendorBillDetailPage: React.FC<VendorBillDetailPageProps> = () => {
  return (
    <div className="vendorbilldetailpage">
      <h3>VendorBillDetailPage</h3>
    </div>
  );
};

export default VendorBillDetailPage;
