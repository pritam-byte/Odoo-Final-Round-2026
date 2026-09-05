import { apiGet, ApiResponse } from '../../lib/apiClient';

export interface BackendJournal {
  id: string;
  name: string;
  type: 'SALES' | 'PURCHASE' | 'BANK' | 'CASH' | 'GENERAL';
  defaultAccountId?: string | null;
  defaultAccount?: {
    id: string;
    name: string;
    type: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchJournalsApi(): Promise<ApiResponse<BackendJournal[]>> {
  return apiGet<BackendJournal[]>('/journals');
}
