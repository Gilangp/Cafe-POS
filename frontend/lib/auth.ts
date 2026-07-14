import { apiClient } from '@/lib/api-client';
import type { ApiResponse, LoginPayload, LoginResponse, User } from '@/types/api';

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
  return response.data.data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
}

export function persistToken(accessToken: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('velvra_access_token', accessToken);
  }
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('velvra_access_token');
  }
}