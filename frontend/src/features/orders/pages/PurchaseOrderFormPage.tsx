import React from 'react';

export interface PurchaseOrderFormPageProps {
  children?: React.ReactNode;
}

export const PurchaseOrderFormPage: React.FC<PurchaseOrderFormPageProps> = () => {
  return (
    <div className="purchaseorderformpage">
      <h3>PurchaseOrderFormPage</h3>
    </div>
  );
};

export default PurchaseOrderFormPage;
