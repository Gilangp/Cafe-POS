import apiClient from '@shared/api/axios';
import { ENDPOINTS } from '@shared/api/endpoint';

export const menuRepository = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get(ENDPOINTS.MENU.LIST, { params }),
  getOne: (id: string) => apiClient.get(ENDPOINTS.MENU.DETAIL(id)),
};

