import apiClient from '@shared/api/axios';
import { ENDPOINTS } from '@shared/api/endpoint';

export const galleryRepository = {
  getAll: () => apiClient.get(ENDPOINTS.GALLERY.LIST),
};

