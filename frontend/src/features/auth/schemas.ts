export type UserRole = 'Admin' | 'Accountant' | 'User';
export type UserStatus = 'Active' | 'Inactive';

export interface UserAccount {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: UserRole;
  partnerType?: 'Customer' | 'Vendor' | 'Both';
  status: UserStatus;
  partnerId?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserInput {
  name: string;
  loginId: string;
  email: string;
  role: UserRole;
  partnerType?: 'Customer' | 'Vendor' | 'Both';
  password: string;
  confirmPassword: string;
}

export interface UpdateUserInput {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
