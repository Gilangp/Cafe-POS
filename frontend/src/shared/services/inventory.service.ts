import { inventoryRepository } from '@shared/repositories/inventory.repository';

export const inventoryService = {
  getAll: async () => {
    const res = await inventoryRepository.getAll();
    return res.data;
  },
};

