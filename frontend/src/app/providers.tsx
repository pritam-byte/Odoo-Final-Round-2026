import React from 'react';

export interface AppProvidersProps {
  children?: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = () => {
  return (
    <div className="appproviders">
      <h3>AppProviders</h3>
    </div>
  );
};

export default AppProviders;
