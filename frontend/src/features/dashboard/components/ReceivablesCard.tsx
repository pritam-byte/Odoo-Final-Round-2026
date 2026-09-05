import React from 'react';

export interface ReceivablesCardProps {
  children?: React.ReactNode;
}

export const ReceivablesCard: React.FC<ReceivablesCardProps> = () => {
  return (
    <div className="receivablescard">
      <h3>ReceivablesCard</h3>
    </div>
  );
};

export default ReceivablesCard;
