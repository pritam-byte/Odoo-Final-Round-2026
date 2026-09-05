const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api';
const TOKEN_KEY = 'odoo_flow_active_token';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setAuthToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to set auth token', e);
  }
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  isFallback?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Request failed with status ${response.status}`,
        data,
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (err: any) {
    // Graceful offline fallback
    return {
      success: false,
      isFallback: true,
      error: err.name === 'AbortError' ? 'Backend connection timed out. Using local storage.' : 'Backend server unreachable. Using local storage.',
    };
  }
}
export async function apiGet<T = any>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<ApiResponse<T>> {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }
  return apiRequest<T>(url, { method: 'GET' });
}

export async function apiPost<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function checkBackendHealth(): Promise<{ isOnline: boolean; message: string }> {
  try {
    const res = await apiRequest('/health');
    return {
      isOnline: res.success,
      message: res.success ? 'Backend API Connected (Port 5000)' : 'Backend API Offline (Using Offline Storage)',
    };
  } catch (e) {
    return { isOnline: false, message: 'Backend API Offline' };
  }
}
