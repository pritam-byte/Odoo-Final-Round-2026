import React from 'react';

export interface LoadingSkeletonProps {
  children?: React.ReactNode;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = () => {
  return (
    <div className="loadingskeleton">
      <h3>LoadingSkeleton</h3>
    </div>
  );
};

export default LoadingSkeleton;
