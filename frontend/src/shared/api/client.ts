import axios from 'axios';
import { appConfig } from '@/shared/config/app.config';

export const apiClient = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const token = window.localStorage.getItem('velvra_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const branchId = window.localStorage.getItem('velvra_active_branch_id');
  if (branchId && branchId !== 'null' && branchId !== 'undefined') {
    config.headers['X-Branch-Id'] = branchId;
  }

  // Idempotency guarantee for critical mutation endpoints (Phase F0 / Section 26.4.2)
  if (
    config.method &&
    ['post', 'put', 'patch'].includes(config.method.toLowerCase()) &&
    config.url &&
    (config.url.includes('/orders') || config.url.includes('/pos/orders') || config.url.includes('/reservations'))
  ) {
    if (!config.headers['Idempotency-Key'] && !config.headers['idempotency-key']) {
      const idempotencyKey =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'idemp-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
      config.headers['Idempotency-Key'] = idempotencyKey;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined' &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const token = window.localStorage.getItem('velvra_access_token');
        if (!token) {
          throw new Error('No token available');
        }

        const res = await axios.post(
          `${appConfig.apiUrl}/v1/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.token) {
          window.localStorage.setItem('velvra_access_token', res.data.token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          originalRequest.headers['Authorization'] = `Bearer ${res.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        window.localStorage.removeItem('velvra_access_token');
        window.localStorage.removeItem('velvra_admin_session');
        window.localStorage.removeItem('velvra-auth-storage');
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        } else if (!window.location.pathname.startsWith('/admin') && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);