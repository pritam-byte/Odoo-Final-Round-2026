import { UserAccount, CreateUserInput } from '../features/auth/schemas';
import { getAllUsers, createNewUser } from '../features/auth/api';

const AUTH_STORAGE_KEY = 'odoo_flow_active_user';

export const CURRENT_USER: UserAccount = {
  id: 'usr_user',
  name: 'John Doe',
  loginId: 'john',
  email: 'john@example.com',
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

  const user = users.find(
    u => u.loginId.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
  );

  if (!user) {
    return { success: false, message: 'Invalid Login ID or Email address.' };
  }

  if (user.status === 'Inactive') {
    return {
      success: false,
      message: 'Account is deactivated. Please contact your system administrator.'
    };
  }

  // Record login
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
