import React from 'react';

export interface DemoBankPaymentFormProps {
  children?: React.ReactNode;
}

export const DemoBankPaymentForm: React.FC<DemoBankPaymentFormProps> = () => {
  return (
    <div className="demobankpaymentform">
      <h3>DemoBankPaymentForm</h3>
    </div>
  );
};

export default DemoBankPaymentForm;
