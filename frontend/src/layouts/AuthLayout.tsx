import React from 'react';

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = () => {
  return (
    <div className="authlayout">
      <h3>AuthLayout</h3>
    </div>
  );
};

export default AuthLayout;
