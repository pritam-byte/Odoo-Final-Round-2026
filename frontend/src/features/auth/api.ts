import { UserAccount, CreateUserInput, UpdateUserInput } from './schemas';

const USERS_STORAGE_KEY = 'odoo_flow_mock_users';

const initialMockUsers: UserAccount[] = [
  {
    id: 'usr_admin',
    name: 'Pritam Admin',
    loginId: 'admin_pritam',
    email: 'admin@odoo-flow.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-15',
    lastLogin: '2026-09-05 14:30'
  },
  {
    id: 'usr_acct',
    name: 'Sarah Accountant',
    loginId: 'sarah_finance',
    email: 'sarah.finance@odoo-flow.com',
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

  mockUsers.push(newUser);
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
