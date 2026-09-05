import React from 'react';

export interface PortalDashboardPageProps {
  children?: React.ReactNode;
}

export const PortalDashboardPage: React.FC<PortalDashboardPageProps> = () => {
  return (
    <div className="portaldashboardpage">
      <h3>PortalDashboardPage</h3>
    </div>
  );
};

export default PortalDashboardPage;
