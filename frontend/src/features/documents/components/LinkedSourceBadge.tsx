import React from 'react';

export interface LinkedSourceBadgeProps {
  children?: React.ReactNode;
}

export const LinkedSourceBadge: React.FC<LinkedSourceBadgeProps> = () => {
  return (
    <div className="linkedsourcebadge">
      <h3>LinkedSourceBadge</h3>
    </div>
  );
};

export default LinkedSourceBadge;
