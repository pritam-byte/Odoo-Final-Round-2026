import { apiGet, apiPost, ApiResponse } from '../../lib/apiClient';

export interface BackendProduct {
  id: string;
  name: string;
  category?: string | null;
  salesPrice: number | string;
  cost: number | string;
  type: 'GOODS' | 'SERVICE' | 'COMBO';
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  category?: string;
  salesPrice: number;
  cost: number;
  type: 'GOODS' | 'SERVICE' | 'COMBO';
  image?: string;
}

export async function fetchProductsApi(search?: string): Promise<ApiResponse<BackendProduct[]>> {
  return apiGet<BackendProduct[]>('/products', { search });
}

export async function createProductApi(payload: CreateProductPayload): Promise<ApiResponse<BackendProduct>> {
  return apiPost<BackendProduct>('/products', payload);
}
