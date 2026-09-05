import React from 'react';

export interface OrderStatusStepperProps {
  children?: React.ReactNode;
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = () => {
  return (
    <div className="orderstatusstepper">
      <h3>OrderStatusStepper</h3>
    </div>
  );
};

export default OrderStatusStepper;
