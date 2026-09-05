import React from 'react';

export interface BreadcrumbsProps {
  children?: React.ReactNode;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = () => {
  return (
    <div className="breadcrumbs">
      <h3>Breadcrumbs</h3>
    </div>
  );
};

export default Breadcrumbs;
