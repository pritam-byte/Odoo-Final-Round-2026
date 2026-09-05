import { apiGet, apiPost, ApiResponse } from '../../lib/apiClient';

export interface BackendContact {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'VENDOR' | 'BOTH';
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactPayload {
  name: string;
  type: 'CUSTOMER' | 'VENDOR' | 'BOTH';
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  image?: string;
}

export async function fetchContactsApi(search?: string, type?: string): Promise<ApiResponse<BackendContact[]>> {
  return apiGet<BackendContact[]>('/contacts', { search, type });
}

export async function createContactApi(payload: CreateContactPayload): Promise<ApiResponse<BackendContact>> {
  return apiPost<BackendContact>('/contacts', payload);
}
