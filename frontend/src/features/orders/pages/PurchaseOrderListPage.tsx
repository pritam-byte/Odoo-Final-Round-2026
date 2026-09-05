import React from 'react';

export interface PurchaseOrderListPageProps {
  children?: React.ReactNode;
}

export const PurchaseOrderListPage: React.FC<PurchaseOrderListPageProps> = () => {
  return (
    <div className="purchaseorderlistpage">
      <h3>PurchaseOrderListPage</h3>
    </div>
  );
};

export default PurchaseOrderListPage;
