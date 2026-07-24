import apiClient from '@shared/api/axios';

export const dashboardService = {
  getSummary: async () => {
    const res = await apiClient.get('/dashboard/summary');
    return res.data;
  },
};

