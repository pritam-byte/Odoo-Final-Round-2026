import React from 'react';

export interface PurchaseOrderDetailPageProps {
  children?: React.ReactNode;
}

export const PurchaseOrderDetailPage: React.FC<PurchaseOrderDetailPageProps> = () => {
  return (
    <div className="purchaseorderdetailpage">
      <h3>PurchaseOrderDetailPage</h3>
    </div>
  );
};

export default PurchaseOrderDetailPage;
