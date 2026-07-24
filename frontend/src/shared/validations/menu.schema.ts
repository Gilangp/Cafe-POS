import { z } from 'zod';

export const menuSchema = z.object({
  name: z.string().min(1, 'Nama menu wajib diisi'),
  description: z.string().optional(),
  price: z.number().positive('Harga harus lebih dari 0'),
  category_id: z.number(),
  image_url: z.string().optional(),
});

export type MenuInput = z.infer<typeof menuSchema>;
