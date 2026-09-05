import React from 'react';

export interface LoginPageProps {
  children?: React.ReactNode;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  return (
    <div className="loginpage">
      <h3>LoginPage</h3>
    </div>
  );
};

export default LoginPage;
