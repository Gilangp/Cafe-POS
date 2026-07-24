import apiClient from '@shared/api/axios';

export const reportRepository = {
  getSales: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/sales', { params }),
};

