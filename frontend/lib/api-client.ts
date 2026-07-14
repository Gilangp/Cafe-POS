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

  return config;
});