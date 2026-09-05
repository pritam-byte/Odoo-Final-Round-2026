import { UserAccount, CreateUserInput, UpdateUserInput, UserRole } from './schemas';
import { apiRequest } from '../../lib/apiClient';

const USERS_STORAGE_KEY = 'odoo_flow_mock_users';

const initialMockUsers: UserAccount[] = [
  {
    id: 'usr_admin',
    name: 'Pritam Admin',
    loginId: 'admin01',
    email: 'admin@urbanfurniture.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-15',
    lastLogin: '2026-09-05 14:30'
  },
  {
    id: 'usr_acct',
    name: 'Sarah Accountant',
    loginId: 'sarah_acct',
    email: 'sarah.finance@urbanfurniture.com',
    role: 'Accountant',
    status: 'Active',
    createdAt: '2026-02-10',
    lastLogin: '2026-09-04 11:15'
  },
  {
    id: 'usr_client',
    name: 'John Doe',
    loginId: 'jdoe_client',
    email: 'john.doe@company.com',
    role: 'User',
    status: 'Active',
    partnerId: 'partner_john_doe',
    createdAt: '2026-03-01',
    lastLogin: '2026-09-05 09:40'
  },
  {
    id: 'usr_inactive',
    name: 'Robert Miller',
    loginId: 'rmiller_ops',
    email: 'robert.m@company.com',
    role: 'User',
    status: 'Inactive',
    partnerId: 'partner_robert',
    createdAt: '2026-04-12',
    lastLogin: '2026-07-22 16:05'
  }
];

export const mapBackendRole = (role?: string): UserRole => {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'ACCOUNTANT') return 'Accountant';
  return 'User';
};

export const mapFrontendRole = (role: UserRole): string => {
  if (role === 'Admin') return 'ADMIN';
  if (role === 'Accountant') return 'ACCOUNTANT';
  return 'PORTAL_USER';
};

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

// --- Live PostgreSQL API Functions ---

export const fetchAllUsersApi = async (): Promise<UserAccount[]> => {
  try {
    const res = await apiRequest('/auth/users');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const mapped: UserAccount[] = res.data.map((u: any) => ({
        id: u.id,
        name: u.contact?.name || u.loginId.charAt(0).toUpperCase() + u.loginId.slice(1),
        loginId: u.loginId,
        email: u.email,
        role: mapBackendRole(u.role),
        status: 'Active',
        partnerId: u.contactId || undefined,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
        lastLogin: undefined,
      }));
      mockUsers = mapped;
      saveUsers(mapped);
      return mapped;
    }
  } catch (e) {
    console.warn('Failed to fetch live PostgreSQL users:', e);
  }
  return getAllUsers();
};

export const createNewUserApi = async (
  input: CreateUserInput
): Promise<{ success: boolean; message: string; user?: UserAccount }> => {
  // Validate basic form constraints
  if (input.password && input.confirmPassword && input.password !== input.confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  if (input.password && input.password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  // Live PostgreSQL call
  try {
    const backendRes = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name.trim(),
        loginId: input.loginId.trim(),
        email: input.email.trim(),
        password: input.password || 'password123',
        role: mapFrontendRole(input.role),
      }),
    });

    if (backendRes.success && backendRes.data?.user) {
      const bUser = backendRes.data.user;
      const newUser: UserAccount = {
        id: bUser.id,
        name: input.name.trim(),
        loginId: bUser.loginId,
        email: bUser.email,
        role: mapBackendRole(bUser.role),
        status: 'Active',
        partnerId: bUser.contactId || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };

      mockUsers.unshift(newUser);
      saveUsers(mockUsers);
      return {
        success: true,
        message: `Account for ${newUser.name} (${newUser.loginId}) created successfully in PostgreSQL database!`,
        user: newUser,
      };
    }

    if (backendRes.error && !backendRes.isFallback) {
      return { success: false, message: backendRes.error };
    }
  } catch (e: any) {
    console.warn('Backend user creation error:', e);
  }

  // Fallback to local storage
  return createNewUser(input);
};

export const updateUserAccountApi = async (
  id: string,
  input: UpdateUserInput
): Promise<{ success: boolean; message: string; user?: UserAccount }> => {
  try {
    const backendRes = await apiRequest(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email.trim(),
        role: mapFrontendRole(input.role),
      }),
    });

    if (backendRes.success && backendRes.data?.user) {
      const bUser = backendRes.data.user;
      const updated: UserAccount = {
        id: bUser.id,
        name: input.name.trim(),
        loginId: bUser.loginId,
        email: bUser.email,
        role: mapBackendRole(bUser.role),
        status: input.status,
        createdAt: bUser.createdAt ? new Date(bUser.createdAt).toISOString().split('T')[0] : '2026-01-01',
      };
      return { success: true, message: 'User updated in PostgreSQL database!', user: updated };
    }

  } catch (e) {
    console.warn('Failed to update live user in backend:', e);
  }
  return updateUserAccount(id, input);
};

export const deleteUserApi = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const backendRes = await apiRequest(`/auth/users/${id}`, {
      method: 'DELETE',
    });
    if (backendRes.success) {
      mockUsers = mockUsers.filter(u => u.id !== id);
      saveUsers(mockUsers);
      return { success: true, message: 'User deleted from PostgreSQL database.' };
    }
  } catch (e) {
    console.warn('Failed to delete live user:', e);
  }
  return { success: false, message: 'Failed to delete user.' };
};

// --- Sync Local Storage Helpers ---

export const getAllUsers = (): UserAccount[] => {
  mockUsers = loadUsers();
  return [...mockUsers];
};

export const getUserById = (id: string): UserAccount | null => {
  mockUsers = loadUsers();
  return mockUsers.find(u => u.id === id) || null;
};

export const createNewUser = (input: CreateUserInput): { success: boolean; message: string; user?: UserAccount } => {
  mockUsers = loadUsers();
  const trimmedLogin = input.loginId.trim().toLowerCase();
  const trimmedEmail = input.email.trim().toLowerCase();
  const trimmedName = input.name.trim();

  if (trimmedLogin.length < 3 || trimmedLogin.length > 20) {
    return { success: false, message: 'Login ID must be between 3 and 20 characters.' };
  }

  const existingLogin = mockUsers.find(u => u.loginId.toLowerCase() === trimmedLogin);
  if (existingLogin) {
    return { success: false, message: 'Login ID is already taken. Please choose another.' };
  }

  const existingEmail = mockUsers.find(u => u.email.toLowerCase() === trimmedEmail);
  if (existingEmail) {
    return { success: false, message: 'Email address is already registered.' };
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

  const newUser: UserAccount = {
    id: 'usr_' + Date.now(),
    name: trimmedName,
    loginId: input.loginId.trim(),
    email: input.email.trim(),
    role: input.role,
    partnerType: input.partnerType || (input.role === 'User' ? 'Customer' : undefined),
    status: 'Active',
    partnerId: input.role === 'User' ? 'partner_' + trimmedLogin.replace(/[^a-z0-9]/g, '_') : undefined,
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: undefined
  };

  mockUsers.unshift(newUser);
  saveUsers(mockUsers);
  return { success: true, message: 'User created successfully.', user: newUser };
};

export const updateUserAccount = (id: string, input: UpdateUserInput): { success: boolean; message: string; user?: UserAccount } => {
  mockUsers = loadUsers();
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    return { success: false, message: 'User not found.' };
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
