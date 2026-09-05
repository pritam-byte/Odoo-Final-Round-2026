import React from 'react';

export interface DrillDownModalProps {
  children?: React.ReactNode;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = () => {
  return (
    <div className="drilldownmodal">
      <h3>DrillDownModal</h3>
    </div>
  );
};

export default DrillDownModal;
