import React from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export interface LoginPageProps {
  onSuccess?: (user: { name: string; email: string; role: string }) => void;
  onNavigateToSignup?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToSignup,
}) => {
  return (
    <AuthLayout>
      <LoginForm
        onSuccess={onSuccess}
        onNavigateToSignup={onNavigateToSignup}
      />
    </AuthLayout>
  );
};

export default LoginPage;
