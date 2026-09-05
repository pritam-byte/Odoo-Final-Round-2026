import { apiGet, apiPost, ApiResponse } from '../../lib/apiClient';

export interface BackendAnalytic {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnalyticPayload {
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export async function fetchAnalyticsApi(type?: string): Promise<ApiResponse<BackendAnalytic[]>> {
  return apiGet<BackendAnalytic[]>('/analytics', { type });
}

export async function createAnalyticApi(payload: CreateAnalyticPayload): Promise<ApiResponse<BackendAnalytic>> {
  return apiPost<BackendAnalytic>('/analytics', payload);
}
