import apiClient from '@shared/api/axios';
import { ENDPOINTS } from '@shared/api/endpoint';

export const inventoryRepository = {
  getAll: () => apiClient.get(ENDPOINTS.INVENTORY.LIST),
};

