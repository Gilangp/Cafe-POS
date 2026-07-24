import { z } from 'zod';

export const reservationSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  date: z.string().min(1, 'Tanggal wajib dipilih'),
  time: z.string().min(1, 'Jam wajib dipilih'),
  guest_count: z.number().min(1).max(20),
  notes: z.string().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
