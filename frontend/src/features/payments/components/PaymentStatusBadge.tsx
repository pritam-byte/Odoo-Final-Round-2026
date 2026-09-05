import React from 'react';

export interface PaymentStatusBadgeProps {
  children?: React.ReactNode;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = () => {
  return (
    <div className="paymentstatusbadge">
      <h3>PaymentStatusBadge</h3>
    </div>
  );
};

export default PaymentStatusBadge;
