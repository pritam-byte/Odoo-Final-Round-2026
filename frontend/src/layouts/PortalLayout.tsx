import React from 'react';

export interface PortalLayoutProps {
  children?: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = () => {
  return (
    <div className="portallayout">
      <h3>PortalLayout</h3>
    </div>
  );
};

export default PortalLayout;
