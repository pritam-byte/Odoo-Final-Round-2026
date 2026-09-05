import React from 'react';

export interface AppRouterProps {
  children?: React.ReactNode;
}

export const AppRouter: React.FC<AppRouterProps> = () => {
  return (
    <div className="approuter">
      <h3>AppRouter</h3>
    </div>
  );
};

export default AppRouter;
