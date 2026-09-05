import { apiGet, ApiResponse } from '../../lib/apiClient';

export interface BackendAccount {
  id: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'CAPITAL';
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchAccountsApi(): Promise<ApiResponse<BackendAccount[]>> {
  return apiGet<BackendAccount[]>('/accounts');
}
