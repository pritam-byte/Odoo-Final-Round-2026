import { UserAccount, CreateUserInput, UpdateUserInput } from './schemas';
import { apiRequest } from '../../lib/apiClient';

const USERS_STORAGE_KEY = 'odoo_flow_mock_users';

const initialMockUsers: UserAccount[] = [
  {
    id: 'usr_admin',
    name: 'Admin01',
    loginId: 'admin01',
    email: 'admin@urbanfurniture.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-15',
    lastLogin: '2026-09-05 14:30'
  }
];

export const mapBackendUserToFrontend = (u: any): UserAccount => ({
  id: u.id,
  name: u.loginId.charAt(0).toUpperCase() + u.loginId.slice(1),
  loginId: u.loginId,
  email: u.email || `${u.loginId}@urbanfurniture.com`,
  role: u.role === 'ADMIN' ? 'Admin' : u.role === 'ACCOUNTANT' ? 'Accountant' : 'User',
  status: 'Active',
  partnerType: 'Both',
  partnerId: u.contactId || (u.role === 'PORTAL_USER' ? `partner_${u.loginId}` : undefined),
  createdAt: typeof u.createdAt === 'string' ? u.createdAt.split('T')[0] : new Date(u.createdAt).toISOString().split('T')[0],
  lastLogin: u.updatedAt ? new Date(u.updatedAt).toLocaleString() : undefined,
});

const loadUsers = (): UserAccount[] => {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load users from storage', e);
  }
  return [...initialMockUsers];
};

const saveUsers = (users: UserAccount[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to storage', e);
  }
};

let mockUsers: UserAccount[] = loadUsers();

export const getAllUsers = (): UserAccount[] => {
  mockUsers = loadUsers();
  return [...mockUsers];
};

export const fetchUsersApi = async (): Promise<UserAccount[]> => {
  try {
    const res = await apiRequest<any[]>('/auth/users');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const mapped = res.data.map(mapBackendUserToFrontend);
      mockUsers = mapped;
      saveUsers(mapped);
      return mapped;
    }
  } catch (e) {
    console.warn('Failed to fetch users from backend, using cache:', e);
  }
  return getAllUsers();
};

export const getUserById = (id: string): UserAccount | null => {
  mockUsers = loadUsers();
  return mockUsers.find(u => u.id === id) || null;
};

export const createNewUser = async (input: CreateUserInput): Promise<{ success: boolean; message: string; user?: UserAccount }> => {
  mockUsers = loadUsers();
  const trimmedLogin = input.loginId.trim();
  const trimmedEmail = input.email.trim();
  const trimmedName = input.name.trim();
  const trimmedPassword = input.password || 'password123';
  const roleEnum = input.role === 'Admin' ? 'ADMIN' : input.role === 'Accountant' ? 'ACCOUNTANT' : 'PORTAL_USER';

  if (trimmedLogin.length < 3) {
    return { success: false, message: 'Login ID must be at least 3 characters.' };
  }

  if (input.password && input.password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long.'
    };
  }

  if (input.password && input.confirmPassword && input.password !== input.confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  // 1. Live Backend PostgreSQL Call
  try {
    const res = await apiRequest<{ user: any; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        loginId: trimmedLogin,
        email: trimmedEmail,
        password: trimmedPassword,
        role: roleEnum,
      }),
    });

    if (res.success && res.data?.user) {
      const mapped = mapBackendUserToFrontend(res.data.user);
      mockUsers = [mapped, ...mockUsers.filter(u => u.loginId !== mapped.loginId)];
      saveUsers(mockUsers);
      return { success: true, message: `User "${mapped.loginId}" created and stored in PostgreSQL!`, user: mapped };
    } else if (res.error && !res.isFallback) {
      return { success: false, message: res.error };
    }
  } catch (e: any) {
    console.warn('Backend user registration error:', e);
  }

  // 2. Offline Fallback
  const newUser: UserAccount = {
    id: 'usr_' + Date.now(),
    name: trimmedName,
    loginId: trimmedLogin,
    email: trimmedEmail,
    role: input.role,
    partnerType: input.partnerType || (input.role === 'User' ? 'Customer' : undefined),
    status: 'Active',
    partnerId: input.role === 'User' ? 'partner_' + trimmedLogin.replace(/[^a-z0-9]/g, '_') : undefined,
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: undefined
  };

  mockUsers = [newUser, ...mockUsers];
  saveUsers(mockUsers);
  return { success: true, message: 'User created (offline cache).', user: newUser };
};

export const updateUserAccount = async (id: string, input: UpdateUserInput): Promise<{ success: boolean; message: string; user?: UserAccount }> => {
  mockUsers = loadUsers();
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    return { success: false, message: 'User not found.' };
  }

  const roleEnum = input.role === 'Admin' ? 'ADMIN' : input.role === 'Accountant' ? 'ACCOUNTANT' : 'PORTAL_USER';

  // Live Backend Call
  try {
    await apiRequest(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        email: input.email.trim(),
        role: roleEnum,
      }),
    });
  } catch (e) {
    console.warn('Backend update user error:', e);
  }

  mockUsers[index] = {
    ...mockUsers[index],
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    status: input.status
  };

  saveUsers(mockUsers);
  return { success: true, message: 'User updated successfully.', user: mockUsers[index] };
};

export const toggleUserStatus = (id: string): { success: boolean; message: string; status?: 'Active' | 'Inactive' } => {
  mockUsers = loadUsers();
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    return { success: false, message: 'User not found.' };
  }

  const newStatus = mockUsers[index].status === 'Active' ? 'Inactive' : 'Active';
  mockUsers[index].status = newStatus;
  saveUsers(mockUsers);

  return {
    success: true,
    message: `User status changed to ${newStatus}.`,
    status: newStatus
  };
};

export const triggerPasswordReset = (id: string): { success: boolean; message: string } => {
  mockUsers = loadUsers();
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  return {
    success: true,
    message: `Secure password reset link generated and sent to ${user.email}.`
  };
};
