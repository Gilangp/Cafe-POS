import { z } from 'zod';

export const inventorySchema = z.object({
  product_id: z.number(),
  quantity: z.number().int().nonnegative(),
  type: z.enum(['stock_in', 'stock_out']),
  notes: z.string().optional(),
});

export type InventoryInput = z.infer<typeof inventorySchema>;
