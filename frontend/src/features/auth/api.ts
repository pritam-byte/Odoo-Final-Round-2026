import { UserAccount, CreateUserInput, UpdateUserInput } from './schemas';

let mockUsers: UserAccount[] = [
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

export const getAllUsers = (): UserAccount[] => {
  return [...mockUsers];
};

export const getUserById = (id: string): UserAccount | null => {
  return mockUsers.find(u => u.id === id) || null;
};

export const createNewUser = (input: CreateUserInput): { success: boolean; message: string; user?: UserAccount } => {
  if (input.loginId.length < 6 || input.loginId.length > 12) {
    return { success: false, message: 'Login ID must be between 6 and 12 characters.' };
  }

  const existingLogin = mockUsers.find(u => u.loginId.toLowerCase() === input.loginId.toLowerCase());
  if (existingLogin) {
    return { success: false, message: 'Login ID already exists. Please choose a unique ID.' };
  }

  const existingEmail = mockUsers.find(u => u.email.toLowerCase() === input.email.toLowerCase());
  if (existingEmail) {
    return { success: false, message: 'Email address is already registered.' };
  }

  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!pwdRegex.test(input.password)) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and a special character.'
    };
  }

  if (input.password !== input.confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  const newUser: UserAccount = {
    id: 'usr_' + Date.now(),
    name: input.name.trim(),
    loginId: input.loginId.trim(),
    email: input.email.trim(),
    role: input.role,
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: undefined
  };

  mockUsers.push(newUser);
  return { success: true, message: 'User created successfully.', user: newUser };
};

export const updateUserAccount = (id: string, input: UpdateUserInput): { success: boolean; message: string; user?: UserAccount } => {
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

  return { success: true, message: 'User updated successfully.', user: mockUsers[index] };
};

export const toggleUserStatus = (id: string): { success: boolean; message: string; status?: 'Active' | 'Inactive' } => {
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  user.status = user.status === 'Active' ? 'Inactive' : 'Active';
  return {
    success: true,
    message: 'User status updated to ' + user.status,
    status: user.status
  };
};

export const triggerPasswordReset = (id: string): { success: boolean; message: string } => {
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  return {
    success: true,
    message: 'Password reset link dispatched to ' + user.email
  };
};
