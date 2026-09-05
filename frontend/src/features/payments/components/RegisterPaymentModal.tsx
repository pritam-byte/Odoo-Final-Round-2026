import React from 'react';

export interface RegisterPaymentModalProps {
  children?: React.ReactNode;
}

export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = () => {
  return (
    <div className="registerpaymentmodal">
      <h3>RegisterPaymentModal</h3>
    </div>
  );
};

export default RegisterPaymentModal;
