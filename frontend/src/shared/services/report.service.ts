import { reportRepository } from '@shared/repositories/report.repository';

export const reportService = {
  getSales: async (params?: Record<string, unknown>) => {
    const res = await reportRepository.getSales(params);
    return res.data;
  },
};

