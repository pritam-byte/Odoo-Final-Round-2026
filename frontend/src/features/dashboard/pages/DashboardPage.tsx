import React from 'react';

export interface DashboardPageProps {
  children?: React.ReactNode;
}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  return (
    <div className="dashboardpage">
      <h3>DashboardPage</h3>
    </div>
  );
};

export default DashboardPage;
