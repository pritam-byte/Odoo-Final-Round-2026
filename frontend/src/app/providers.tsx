import React, { createContext, useContext, useState } from 'react';
import { AccountingStoreProvider } from '../features/accounting/store';

export interface User {
  name: string;
  email: string;
  role: string;
  company?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export interface AppProvidersProps {
  children?: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('odoo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return {
      name: 'Pritam Admin',
      email: 'admin@urban-furniture.com',
      role: 'Administrator',
      company: 'Urban Furniture Inc.',
    };
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('odoo_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('odoo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      <AccountingStoreProvider>
        {children}
      </AccountingStoreProvider>
    </AuthContext.Provider>
  );
};

export default AppProviders;
