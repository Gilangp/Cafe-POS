import { apiClient } from '@/lib/api-client';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Standard API Client Wrapper for Velvra Frontend Integration
 * Implements Bearer Token Interceptor, X-Branch-Id Scoping, and Idempotency Guarantees.
 */

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'idemp-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
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
  client: apiClient,
};

export { apiClient };
export default api;
