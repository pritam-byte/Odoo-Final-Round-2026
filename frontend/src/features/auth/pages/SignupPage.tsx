import React from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { SignupForm } from '../components/SignupForm';

export interface SignupPageProps {
  onSuccess?: (user: { name: string; email: string; role: string }) => void;
  onNavigateToLogin?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  return (
    <AuthLayout>
      <SignupForm
        onSuccess={onSuccess}
        onNavigateToLogin={onNavigateToLogin}
      />
    </AuthLayout>
  );
};

export default SignupPage;
