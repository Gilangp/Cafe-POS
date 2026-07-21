import { apiClient } from '@/lib/api-client';
import { appConfig } from '@/lib/config';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Standard API Client Wrapper for NEMU Space / Velvra Frontend Integration
 * Implements Bearer Token Interceptor, X-Branch-Id Scoping, and Idempotency Guarantees
 * for both Axios and Native Fetch API (Phase 5.2).
 */

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'idemp-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  idempotent?: boolean;
}

/**
 * Native Fetch API wrapper that automatically sends Sanctum Bearer Token,
 * X-Branch-Id header, and Idempotency keys.
 */
export async function fetchApi<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, idempotent, headers: customHeaders, ...restOptions } = options;
  const baseUrl = appConfig.apiUrl.replace(/\/$/, '');
  let url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('velvra_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const branchId = window.localStorage.getItem('velvra_active_branch_id');
    if (branchId && branchId !== 'null' && branchId !== 'undefined') {
      headers['X-Branch-Id'] = branchId;
    }
  }

  const method = (restOptions.method || 'GET').toUpperCase();
  if (idempotent || ['POST', 'PUT', 'PATCH'].includes(method)) {
    if (!headers['Idempotency-Key'] && !headers['idempotency-key']) {
      headers['Idempotency-Key'] = generateIdempotencyKey();
    }
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('velvra_access_token');
      window.localStorage.removeItem('velvra_admin_session');
    }
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `API Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T = unknown, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> => {
    return apiClient.get<T, R>(url, config);
  },
  post: <T = unknown, R = AxiosResponse<T>>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<R> => {
    return apiClient.post<T, R>(url, data, config);
  },
  put: <T = unknown, R = AxiosResponse<T>>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<R> => {
    return apiClient.put<T, R>(url, data, config);
  },
  patch: <T = unknown, R = AxiosResponse<T>>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<R> => {
    return apiClient.patch<T, R>(url, data, config);
  },
  delete: <T = unknown, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> => {
    return apiClient.delete<T, R>(url, config);
  },
  fetch: fetchApi,
  client: apiClient,
};

export { apiClient };
export default api;
