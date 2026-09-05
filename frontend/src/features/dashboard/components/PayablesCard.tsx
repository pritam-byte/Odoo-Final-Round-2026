import React from 'react';

export interface PayablesCardProps {
  children?: React.ReactNode;
}

export const PayablesCard: React.FC<PayablesCardProps> = () => {
  return (
    <div className="payablescard">
      <h3>PayablesCard</h3>
    </div>
  );
};

export default PayablesCard;
