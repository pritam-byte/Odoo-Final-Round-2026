import React from 'react';

export interface LoginFormProps {
  children?: React.ReactNode;
}

export const LoginForm: React.FC<LoginFormProps> = () => {
  return (
    <div className="loginform">
      <h3>LoginForm</h3>
    </div>
  );
};

export default LoginForm;
