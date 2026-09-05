import React from 'react';

export interface StaffLayoutProps {
  children?: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = () => {
  return (
    <div className="stafflayout">
      <h3>StaffLayout</h3>
    </div>
  );
};

export default StaffLayout;
