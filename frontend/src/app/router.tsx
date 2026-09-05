import React, { useState } from 'react';
import StaffLayout from '../layouts/StaffLayout';
import CreateUserPage from '../features/auth/pages/CreateUserPage';

export const AppRouter: React.FC = () => {
  const [currentNav, setCurrentNav] = useState<string>('contacts');

  return (
    <StaffLayout activeNav={currentNav} onNavigate={(id) => setCurrentNav(id)}>
      <CreateUserPage />
    </StaffLayout>
  );
};

export default AppRouter;
