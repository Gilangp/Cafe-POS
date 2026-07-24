import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
