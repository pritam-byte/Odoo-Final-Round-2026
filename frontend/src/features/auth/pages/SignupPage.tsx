import React from 'react';

export interface SignupPageProps {
  children?: React.ReactNode;
}

export const SignupPage: React.FC<SignupPageProps> = () => {
  return (
    <div className="signuppage">
      <h3>SignupPage</h3>
    </div>
  );
};

export default SignupPage;
