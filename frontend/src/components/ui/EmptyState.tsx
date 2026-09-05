import React from 'react';

export interface EmptyStateProps {
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <div className="emptystate">
      <h3>EmptyState</h3>
    </div>
  );
};

export default EmptyState;
