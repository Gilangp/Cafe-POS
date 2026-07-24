import { menuRepository } from '@shared/repositories/menu.repository';

export const menuService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await menuRepository.getAll(params);
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await menuRepository.getOne(id);
    return res.data;
  },
};

