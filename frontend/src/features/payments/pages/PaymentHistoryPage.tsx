import React from 'react';

export interface PaymentHistoryPageProps {
  children?: React.ReactNode;
}

export const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = () => {
  return (
    <div className="paymenthistorypage">
      <h3>PaymentHistoryPage</h3>
    </div>
  );
};

export default PaymentHistoryPage;
