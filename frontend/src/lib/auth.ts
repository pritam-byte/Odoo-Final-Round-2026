import { UserProfile } from '../features/portal/schemas';

// Scoped logged-in user state (Defaults to 'User' role as per spec)
export const CURRENT_USER: UserProfile = {
  id: 'usr_789',
  name: 'John Doe',
  loginId: 'jdoe_client',
  email: 'john.doe@company.com',
  partnerId: 'partner_john_doe',
  role: 'user'
};

export const getScopedPartnerId = (): string => {
  return CURRENT_USER.partnerId;
};
