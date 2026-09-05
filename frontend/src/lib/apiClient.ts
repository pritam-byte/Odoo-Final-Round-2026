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

let isAuthenticating = false;

export async function ensureAuthToken(): Promise<string | null> {
  let token = getAuthToken();
  if (token) return token;

  if (isAuthenticating) return null;
  isAuthenticating = true;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: 'admin01',
        password: 'Admin@1234',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.token) {
      setAuthToken(data.token);
      return data.token;
    }
  } catch (e) {
    console.warn('Auto-auth attempt failed:', e);
  } finally {
    isAuthenticating = false;
  }
  return null;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let token = getAuthToken();
  if (!token && !endpoint.includes('/auth/login')) {
    token = await ensureAuthToken();
  }

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
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If token expired / 401, try auto-login once and retry
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      const newToken = await ensureAuthToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

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
