import apiClient from '@shared/api/axios';
import { ENDPOINTS } from '@shared/api/endpoint';

export const authRepository = {
  login: (data: { email: string; password: string }) =>
    apiClient.post(ENDPOINTS.AUTH.LOGIN, data),
  logout: () => apiClient.post(ENDPOINTS.AUTH.LOGOUT),
  me: () => apiClient.get(ENDPOINTS.AUTH.ME),
};

