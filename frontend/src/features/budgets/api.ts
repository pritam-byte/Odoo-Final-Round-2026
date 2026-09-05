import { apiGet, apiPost, ApiResponse } from '../../lib/apiClient';

export interface BackendBudgetProgress {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  analyticId: string;
  type: 'INCOME' | 'EXPENSE';
  responsibleId: string;
  committedAmount: number | string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'REVISED';
  revisedFromId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  analytic?: {
    id: string;
    name: string;
    type: string;
  };
  responsible?: {
    id: string;
    name: string;
    email: string;
  };
  achievedAmount: number;
  achievedPercentage: number;
  amountToAchieve: number;
}

export interface CreateBudgetPayload {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  analyticId: string;
  responsibleId: string;
  committedAmount: number;
}

export async function fetchBudgetsApi(): Promise<ApiResponse<BackendBudgetProgress[]>> {
  return apiGet<BackendBudgetProgress[]>('/budgets');
}

export async function createBudgetApi(payload: CreateBudgetPayload): Promise<ApiResponse<any>> {
  return apiPost('/budgets', payload);
}

export async function confirmBudgetApi(id: string): Promise<ApiResponse<any>> {
  return apiPost(`/budgets/${id}/confirm`);
}

export async function cancelBudgetApi(id: string): Promise<ApiResponse<any>> {
  return apiPost(`/budgets/${id}/cancel`);
}

export async function reviseBudgetApi(id: string, newCommittedAmount: number): Promise<ApiResponse<any>> {
  return apiPost(`/budgets/${id}/revise`, { newCommittedAmount });
}
