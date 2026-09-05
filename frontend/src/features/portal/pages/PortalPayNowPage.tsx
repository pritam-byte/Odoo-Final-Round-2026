import React from 'react';

export interface PortalPayNowPageProps {
  children?: React.ReactNode;
}

export const PortalPayNowPage: React.FC<PortalPayNowPageProps> = () => {
  return (
    <div className="portalpaynowpage">
      <h3>PortalPayNowPage</h3>
    </div>
  );
};

export default PortalPayNowPage;
