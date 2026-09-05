import React from 'react';

export interface StatusBadgeProps {
  children?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = () => {
  return (
    <div className="statusbadge">
      <h3>StatusBadge</h3>
    </div>
  );
};

export default StatusBadge;
