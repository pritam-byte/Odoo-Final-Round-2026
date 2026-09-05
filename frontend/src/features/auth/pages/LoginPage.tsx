import React from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { UserAccount } from '../schemas';

export interface LoginPageProps {
  onSuccess?: (user: UserAccount) => void;
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
