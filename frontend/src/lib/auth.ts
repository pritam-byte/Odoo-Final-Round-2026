import { UserAccount, CreateUserInput } from '../features/auth/schemas';
import { getAllUsers, createNewUser } from '../features/auth/api';

const AUTH_STORAGE_KEY = 'odoo_flow_active_user';

export const CURRENT_USER: UserAccount = {
  id: 'usr_client',
  name: 'John Doe',
  loginId: 'jdoe_client',
  email: 'john.doe@company.com',
  role: 'User',
  status: 'Active',
  partnerId: 'partner_john_doe',
  createdAt: '2026-01-01',
};

export const getStoredUser = (): UserAccount | null => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load session user', e);
  }
  return null;
};

export const setStoredUser = (user: UserAccount | null) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save session user', e);
  }
};

export const loginUser = (loginIdOrEmail: string, _password?: string): { success: boolean; message: string; user?: UserAccount } => {
  const users = getAllUsers();
  const trimmed = loginIdOrEmail.trim().toLowerCase();

  // 1. Direct match by loginId or email
  let user = users.find(
    u => u.loginId.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
  );

  // 2. Convenience aliases for testing
  if (!user) {
    if (trimmed === 'admin') {
      user = users.find(u => u.role === 'Admin');
    } else if (trimmed === 'accountant') {
      user = users.find(u => u.role === 'Accountant');
    } else if (trimmed === 'user' || trimmed === 'john') {
      user = users.find(u => u.role === 'User' && u.status === 'Active');
    }
  }

  if (!user) {
    return { success: false, message: 'Invalid Login ID or Email address. Please check your credentials.' };
  }

  if (user.status === 'Inactive') {
    return {
      success: false,
      message: 'This account has been deactivated. Please contact your system administrator.'
    };
  }

  // Update last login
  user.lastLogin = new Date().toLocaleString();
  setStoredUser(user);
  return { success: true, message: `Welcome back, ${user.name}!`, user };
};

export const registerAndLogin = (input: CreateUserInput): { success: boolean; message: string; user?: UserAccount } => {
  const res = createNewUser(input);
  if (!res.success || !res.user) {
    return res;
  }

  setStoredUser(res.user);
  return { success: true, message: `Account created successfully. Welcome, ${res.user.name}!`, user: res.user };
};

export const logoutUser = () => {
  setStoredUser(null);
};

export const getScopedPartnerId = (): string => {
  const current = getStoredUser();
  if (current && current.partnerId) {
    return current.partnerId;
  }
  return 'partner_john_doe';
};
