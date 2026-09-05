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
      if (response.status === 401) {
        setAuthToken(null);
        localStorage.removeItem('odoo_flow_active_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
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
