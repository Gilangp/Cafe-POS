import axios from 'axios';
import { appConfig } from '@/lib/config';

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
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);