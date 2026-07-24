import apiClient from '@shared/api/axios';
import { ENDPOINTS } from '@shared/api/endpoint';

export const reservationRepository = {
  getAll: () => apiClient.get(ENDPOINTS.RESERVATIONS.LIST),
  store: (data: unknown) => apiClient.post(ENDPOINTS.RESERVATIONS.STORE, data),
};

