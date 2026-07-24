'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { Search, AlertCircle, Sparkles, Calendar, Phone } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import Link from 'next/link';
import api from '@/shared/api/axios';

export default function StatusReservasiPage() {
  const [phone, setPhone] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [checking, setChecking] = React.useState(false);
  const [results, setResults] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    setResults(null);
    try {
      const res = await api.fetch<any>(`/reservations/check?phone=${encodeURIComponent(phone)}&date=${date}`);
      if (res.success && res.data && res.data.length > 0) {
        setResults(res.data);
      } else {
        setError('Tidak ditemukan reservasi dengan nomor WhatsApp dan tanggal tersebut.');
      }
    } catch (err: any) {
      setError(err.message || 'Tidak ditemukan reservasi. Pastikan nomor telepon dan tanggal sudah sesuai.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <PublicLayout>
      <section className="bg-[#1E3D31] text-white py-16 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 rounded-full bg-[#C89B5C]/15 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center space-y-3 px-4 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C89B5C]/15 border border-[#C89B5C]/30 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#C89B5C]">
            <Sparkles size={14} />
            <span>NEMU Space Tracker</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white">Cek Status Reservasi</h1>
          <p className="text-sm text-[#FAF3E7]/80">
            Pantau status persetujuan dan nomor meja Anda secara langsung tanpa perlu mendaftar akun.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#FAF3E7] dark:bg-[#14201A] min-h-[550px]">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <Card variant="elevated" className="p-8 sm:p-10 rounded-3xl space-y-6">
            <form onSubmit={handleCheck} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                  Nomor WhatsApp Terdaftar
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C5348]" />
                  <Input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="h-12 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                  Tanggal Reservasi
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C5348]" />
                  <Input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 rounded-xl pl-10 font-heading"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={checking || !phone}
                variant="primary"
                size="lg"
                className="w-full h-13 rounded-2xl font-bold shadow-md gap-2"
              >
                <Search size={18} />
                <span>{checking ? 'Memeriksa Status...' : 'Cek Sekarang'}</span>
              </Button>
            </form>

            {error && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 flex items-start gap-3 text-red-700 dark:text-red-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Informasi Reservasi</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {results && results.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#E4D9C4] dark:border-[#33413A]">
                <h3 className="font-heading font-bold text-base text-[#1E3D31] dark:text-[#F5EFE6] text-center">
                  Ditemukan {results.length} Data Reservasi
                </h3>

                {results.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-2xl bg-[#FAF3E7] dark:bg-[#1A2620] p-5 border border-[#E4D9C4] dark:border-[#33413A] space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-base text-[#1E3D31] dark:text-[#F5EFE6]">
                        {item.name}
                      </span>
                      <Badge
                        variant={
                          item.status === 'dikonfirmasi'
                            ? 'success'
                            : item.status === 'ditolak' || item.status === 'dibatalkan'
                            ? 'destructive'
                            : 'warning'
                        }
                        className="text-[11px] uppercase font-bold"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">
                      Jadwal: <strong className="text-[#1E3D31] dark:text-white">{item.reservation_date}</strong> · Pukul:{' '}
                      <strong className="text-[#1E3D31] dark:text-white">{item.reservation_time} WIB</strong> · {item.guest_count} Tamu
                    </p>
                    {item.table && (
                      <div className="rounded-xl bg-[#1E3D31] text-[#C89B5C] p-3 text-xs font-bold mt-2">
                        Meja Anda: Meja #{item.table.table_number} ({item.table.area || 'Main Hall'})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                href="/reservasi"
                className="text-xs font-bold text-[#1E3D31] dark:text-[#C89B5C] underline hover:opacity-80"
              >
                ← Kembali ke Halaman Buat Reservasi
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
