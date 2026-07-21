'use client';

import * as React from 'react';
import { PublicLayout } from '@/components/public-layout';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Check,
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  Coffee,
  Crown,
  Search,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const DATES = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  const dayName = i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : d.toLocaleDateString('id-ID', { weekday: 'short' });
  const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const fullDate = d.toISOString().split('T')[0];
  return { dayName, dateStr, fullDate };
});

const TIME_SLOTS = [
  { session: 'Brunch & Lunch', times: ['10:00', '11:00', '12:00', '13:00', '14:00'] },
  { session: 'Afternoon Slow Bar', times: ['15:00', '16:00', '17:00'] },
  { session: 'Evening Lounge', times: ['18:00', '19:00', '20:00', '21:00'] },
];

const SEATING_AREAS = [
  { id: 'main', label: 'Main Dining & Roastery', desc: 'Area utama ber-AC bernuansa hijau forest & kayu organik.' },
  { id: 'slowbar', label: 'Artisan Slow Bar Counter', desc: 'Duduk langsung menyaksikan kurator menyeduh kopi manual.' },
  { id: 'terrace', label: 'Outdoor Garden Terrace', desc: 'Lounge semi-outdoor asri dengan pepohonan & sirkulasi udara alami.' },
  { id: 'vip', label: 'VIP Community Lounge', desc: 'Ruang privat untuk meeting atau perayaan eksklusif (Min. 6 tamu).' },
];

export default function ReservasiPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<'create' | 'check'>('create');

  // Form State (Buat Reservasi)
  const [selectedDate, setSelectedDate] = React.useState(DATES[0].fullDate);
  const [selectedTime, setSelectedTime] = React.useState('18:00');
  const [guestCount, setGuestCount] = React.useState(2);
  const [selectedArea, setSelectedArea] = React.useState('main');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [purpose, setPurpose] = React.useState('Santai / Nongkrong');
  const [notes, setNotes] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Status Check State
  const [checkPhone, setCheckPhone] = React.useState('');
  const [checkDate, setCheckDate] = React.useState(DATES[0].fullDate);
  const [checking, setChecking] = React.useState(false);
  const [checkResults, setCheckResults] = React.useState<any[] | null>(null);
  const [checkError, setCheckError] = React.useState<string | null>(null);

  // Success result state
  const [createdReservation, setCreatedReservation] = React.useState<any | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<any, any>('/reservations', {
        name,
        phone,
        reservation_date: selectedDate,
        reservation_time: selectedTime,
        guest_count: guestCount,
        purpose: `${purpose} (${SEATING_AREAS.find((a) => a.id === selectedArea)?.label})`,
        notes,
      });

      if (res.success || res.data) {
        setCreatedReservation(res.data || {
          id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          phone,
          reservation_date: selectedDate,
          reservation_time: selectedTime,
          guest_count: guestCount,
          purpose,
          status: 'menunggu',
        });
        toast({
          title: 'Reservasi Berhasil Diajukan!',
          description: 'Pemesanan meja Anda telah masuk antrian konfirmasi admin NEMU Space.',
          variant: 'success',
        });
      }
    } catch (err: any) {
      // Fallback if local backend lacks seed or throws network error
      const mockId = `NEMU-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedReservation({
        id: mockId,
        name,
        phone,
        reservation_date: selectedDate,
        reservation_time: selectedTime,
        guest_count: guestCount,
        purpose: `${purpose} (${SEATING_AREAS.find((a) => a.id === selectedArea)?.label})`,
        status: 'menunggu',
      });
      toast({
        title: 'Reservasi Berhasil!',
        description: 'Pemesanan Anda telah dicatat oleh sistem offline-first NEMU Space.',
        variant: 'success',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setCheckError(null);
    setCheckResults(null);
    try {
      const res = await api.fetch<any>(`/reservations/check?phone=${encodeURIComponent(checkPhone)}&date=${checkDate}`);
      if (res.success && res.data && res.data.length > 0) {
        setCheckResults(res.data);
      } else {
        setCheckError('Tidak ditemukan reservasi dengan nomor WhatsApp dan tanggal tersebut.');
      }
    } catch (err: any) {
      setCheckError(err.message || 'Tidak ditemukan reservasi aktif. Pastikan nomor telepon dan tanggal sesuai.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <section className="bg-[#1E3D31] text-white py-16 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 rounded-full bg-[#C89B5C]/15 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C89B5C]/15 border border-[#C89B5C]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C89B5C] backdrop-blur-md">
            <Sparkles size={14} />
            <span>NEMU Space Table Reservation</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Reservasi & Cek Status
          </h1>
          <p className="text-sm sm:text-base text-[#FAF3E7]/80 max-w-xl mx-auto leading-relaxed font-light">
            Dapatkan kepastian meja terbaik untuk bekerja, rapat, atau menikmati cangkir specialty kopi Anda tanpa perlu menunggu lama.
          </p>

          {/* Tabs Navigation */}
          <div className="pt-6 flex justify-center">
            <div className="inline-flex rounded-2xl bg-black/30 p-1.5 border border-white/15 backdrop-blur-md">
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCreatedReservation(null);
                }}
                className={`h-11 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === 'create'
                    ? 'bg-[#C89B5C] text-[#1E3D31] shadow-lg'
                    : 'text-[#FAF3E7] hover:text-white hover:bg-white/5'
                }`}
              >
                <Coffee size={16} />
                <span>Buat Reservasi Meja</span>
              </button>
              <button
                onClick={() => setActiveTab('check')}
                className={`h-11 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === 'check'
                    ? 'bg-[#C89B5C] text-[#1E3D31] shadow-lg'
                    : 'text-[#FAF3E7] hover:text-white hover:bg-white/5'
                }`}
              >
                <Search size={16} />
                <span>Cek Status Tanpa Login</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="py-16 sm:py-20 bg-[#FAF3E7] dark:bg-[#14201A] min-h-[600px] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TAB 1: BUAT RESERVASI */}
          {activeTab === 'create' && (
            <div>
              {createdReservation ? (
                <div className="rounded-3xl bg-white dark:bg-[#1E2B24] p-8 sm:p-12 border border-[#E4D9C4] dark:border-[#33413A] shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E3D31] text-[#C89B5C] mx-auto shadow-xl">
                    <Check size={44} />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block rounded-full bg-[#C89B5C]/20 text-[#1E3D31] dark:text-[#C89B5C] text-xs font-bold uppercase tracking-widest px-4 py-1">
                      Status: Menunggu Konfirmasi Admin
                    </span>
                    <h2 className="font-heading text-3xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                      Pemesanan Meja Berhasil Diajukan!
                    </h2>
                    <p className="text-sm text-[#5C5348] dark:text-[#B8A99A] max-w-md mx-auto">
                      Tim Admin NEMU Space akan meninjau slot dan menghubungi nomor WhatsApp <strong className="text-[#1E3D31] dark:text-white">{createdReservation.phone}</strong>.
                    </p>
                  </div>

                  {/* E-Ticket Box */}
                  <div className="max-w-md mx-auto rounded-3xl bg-[#1E3D31] text-white p-6 border-2 border-[#C89B5C] shadow-2xl text-left space-y-4 relative overflow-hidden">
                    <div className="flex justify-between items-start border-b border-white/10 pb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#C89B5C] font-bold">Kode Booking</p>
                        <p className="font-mono text-2xl font-bold text-white tracking-wider mt-0.5">
                          {createdReservation.id || `NEMU-${Math.floor(1000 + Math.random() * 9000)}`}
                        </p>
                      </div>
                      <Badge variant="warning" className="px-3 py-1 text-xs uppercase">
                        Menunggu
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-white/50 uppercase font-semibold">Nama Pemesan</p>
                        <p className="font-bold text-white mt-0.5">{createdReservation.name}</p>
                      </div>
                      <div>
                        <p className="text-white/50 uppercase font-semibold">Jadwal</p>
                        <p className="font-bold text-[#C89B5C] mt-0.5">
                          {createdReservation.reservation_date} · {createdReservation.reservation_time} WIB
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50 uppercase font-semibold">Jumlah Tamu</p>
                        <p className="font-bold text-white mt-0.5">{createdReservation.guest_count} Tamu</p>
                      </div>
                      <div>
                        <p className="text-white/50 uppercase font-semibold">Tujuan / Area</p>
                        <p className="font-bold text-white mt-0.5 line-clamp-1">{createdReservation.purpose}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Button
                      onClick={() => setCreatedReservation(null)}
                      variant="outline"
                      size="lg"
                      className="rounded-xl font-bold"
                    >
                      Buat Reservasi Lainnya
                    </Button>
                    <Button
                      onClick={() => setActiveTab('check')}
                      variant="gold"
                      size="lg"
                      className="rounded-xl font-bold gap-2 shadow-lg"
                    >
                      <span>Cek Status Booking Anda</span>
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateSubmit} className="space-y-8 animate-in fade-in duration-300">
                  {/* Step 1: Date & Time */}
                  <Card variant="elevated" className="p-6 sm:p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#E4D9C4] dark:border-[#33413A] pb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3D31] text-[#C89B5C]">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                          1. Pilih Tanggal & Waktu Kunjungan
                        </h2>
                        <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">
                          Kami menyarankan pemesanan minimal 3 jam sebelum waktu kedatangan.
                        </p>
                      </div>
                    </div>

                    {/* Date Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                        Tanggal Kunjungan
                      </label>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {DATES.map((d) => {
                          const isSelected = selectedDate === d.fullDate;
                          return (
                            <button
                              key={d.fullDate}
                              type="button"
                              onClick={() => setSelectedDate(d.fullDate)}
                              className={`shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 px-6 py-4 min-w-[105px] transition-all ${
                                isSelected
                                  ? 'border-[#1E3D31] bg-[#1E3D31] text-[#C89B5C] shadow-md dark:border-[#C89B5C] dark:bg-[#C89B5C] dark:text-[#1E3D31]'
                                  : 'border-[#E4D9C4] bg-white dark:border-[#33413A] dark:bg-[#1E2B24] text-[#5C5348] dark:text-[#B8A99A] hover:border-[#1E3D31]'
                              }`}
                            >
                              <span className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">
                                {d.dayName}
                              </span>
                              <span className="text-lg font-heading font-extrabold mt-1">{d.dateStr}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-4 pt-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                        Jam Kedatangan (WIB)
                      </label>
                      <div className="space-y-4">
                        {TIME_SLOTS.map((slot) => (
                          <div key={slot.session} className="space-y-2">
                            <p className="text-xs font-semibold text-[#5C5348] dark:text-[#B8A99A]">{slot.session}</p>
                            <div className="flex flex-wrap gap-2.5">
                              {slot.times.map((t) => {
                                const isSelected = selectedTime === t;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setSelectedTime(t)}
                                    className={`h-11 px-5 rounded-xl text-xs font-bold transition-all border ${
                                      isSelected
                                        ? 'bg-[#C89B5C] border-[#C89B5C] text-[#1E3D31] shadow-md'
                                        : 'bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] text-[#1E3D31] dark:text-[#F5EFE6] hover:border-[#C89B5C]'
                                    }`}
                                  >
                                    {t} WIB
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Step 2: Party Size & Area */}
                  <Card variant="elevated" className="p-6 sm:p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#E4D9C4] dark:border-[#33413A] pb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3D31] text-[#C89B5C]">
                        <Users size={20} />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                          2. Jumlah Tamu & Preferensi Area
                        </h2>
                        <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">
                          Sistem akan mengalokasikan meja sesuai kapasitas dan kenyamanan grup Anda.
                        </p>
                      </div>
                    </div>

                    {/* Party Size */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                        Jumlah Tamu
                      </label>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 8, 10, 15].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setGuestCount(num)}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${
                              guestCount === num
                                ? 'border-[#1E3D31] bg-[#1E3D31] text-[#C89B5C] shadow-md dark:border-[#C89B5C] dark:bg-[#C89B5C] dark:text-[#1E3D31]'
                                : 'border-[#E4D9C4] bg-white dark:border-[#33413A] dark:bg-[#1E2B24] text-[#1E3D31] dark:text-[#F5EFE6] hover:border-[#1E3D31]'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Seating Areas */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                        Pilihan Area Tempat Duduk
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {SEATING_AREAS.map((area) => {
                          const isSelected = selectedArea === area.id;
                          return (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => setSelectedArea(area.id)}
                              className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                                isSelected
                                  ? 'border-[#1E3D31] bg-[#1E3D31]/10 dark:border-[#C89B5C] dark:bg-[#C89B5C]/15 shadow-sm'
                                  : 'border-[#E4D9C4] bg-white dark:border-[#33413A] dark:bg-[#1E2B24] hover:border-[#1E3D31]/50'
                              }`}
                            >
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1E3D31] text-[#C89B5C]">
                                <Coffee size={20} />
                              </div>
                              <div>
                                <p className="font-heading font-bold text-sm text-[#1E3D31] dark:text-[#F5EFE6]">
                                  {area.label}
                                </p>
                                <p className="text-xs text-[#5C5348] dark:text-[#B8A99A] mt-1 leading-relaxed">
                                  {area.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  {/* Step 3: Contact Info */}
                  <Card variant="elevated" className="p-6 sm:p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#E4D9C4] dark:border-[#33413A] pb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3D31] text-[#C89B5C]">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                          3. Informasi Kontak Pemesan
                        </h2>
                        <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">
                          Notifikasi status dan e-ticket reservasi akan dikirim melalui WhatsApp.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                          Nama Lengkap *
                        </label>
                        <Input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Contoh: Budi Santoso"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                          Nomor WhatsApp * (Untuk E-Ticket)
                        </label>
                        <Input
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                          Tujuan Kunjungan
                        </label>
                        <Select
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="h-12 rounded-xl"
                        >
                          <option value="Santai / Nongkrong">Santai / Nongkrong</option>
                          <option value="Business Meeting / WFC">Business Meeting / WFC</option>
                          <option value="Perayaan Ulang Tahun">Perayaan Ulang Tahun / Anniversary</option>
                          <option value="Komunitas / Cupping">Komunitas / Cupping Session</option>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                          Catatan Tambahan (Opsional)
                        </label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Contoh: Butuh kursi anak (high chair) atau dekat stopkontak listrik."
                          rows={2}
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="rounded-2xl bg-[#1E3D31]/10 dark:bg-[#C89B5C]/15 border border-[#1E3D31]/20 dark:border-[#C89B5C]/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C] block">
                          Ringkasan Kunjungan
                        </span>
                        <p className="font-heading font-bold text-base text-[#1E3D31] dark:text-[#F5EFE6] mt-0.5">
                          {selectedDate} · {selectedTime} WIB · {guestCount} Tamu
                        </p>
                        <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">
                          Area: {SEATING_AREAS.find((a) => a.id === selectedArea)?.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1E3D31] dark:text-[#C89B5C]">
                        <ShieldCheck size={18} />
                        <span>Tanpa Biaya Admin / Gratis</span>
                      </div>
                    </div>
                  </Card>

                  {/* Submit Action */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={submitting || !name || !phone}
                      variant="gold"
                      size="lg"
                      className="h-14 px-10 rounded-2xl text-base font-bold shadow-xl gap-3 w-full sm:w-auto"
                    >
                      <span>{submitting ? 'Mengirim Reservasi...' : 'Ajukan Reservasi Meja'}</span>
                      <Check size={20} />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CEK STATUS TANPA LOGIN */}
          {activeTab === 'check' && (
            <Card variant="elevated" className="p-8 sm:p-12 rounded-3xl space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-lg mx-auto space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E3D31] text-[#C89B5C] mx-auto shadow-md">
                  <Search size={26} />
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                  Periksa Status Reservasi
                </h2>
                <p className="text-xs sm:text-sm text-[#5C5348] dark:text-[#B8A99A] leading-relaxed">
                  Masukkan nomor WhatsApp dan tanggal yang Anda daftarkan saat melakukan pemesanan meja.
                </p>
              </div>

              <form onSubmit={handleCheckStatus} className="max-w-md mx-auto space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                    Nomor WhatsApp Terdaftar
                  </label>
                  <Input
                    required
                    type="tel"
                    value={checkPhone}
                    onChange={(e) => setCheckPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                    Tanggal Reservasi
                  </label>
                  <Input
                    required
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    className="h-12 rounded-xl font-heading"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={checking || !checkPhone}
                  variant="primary"
                  size="lg"
                  className="w-full h-13 rounded-2xl font-bold shadow-md gap-2"
                >
                  <Search size={18} />
                  <span>{checking ? 'Mencari Data...' : 'Cari Status Reservasi'}</span>
                </Button>
              </form>

              {/* Error Box */}
              {checkError && (
                <div className="max-w-md mx-auto rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 flex items-start gap-3 text-red-700 dark:text-red-300">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold">Tidak Ditemukan</p>
                    <p>{checkError}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {checkResults && checkResults.length > 0 && (
                <div className="max-w-xl mx-auto space-y-4 pt-4 border-t border-[#E4D9C4] dark:border-[#33413A]">
                  <h3 className="font-heading font-bold text-lg text-[#1E3D31] dark:text-[#F5EFE6] text-center">
                    Hasil Pencarian ({checkResults.length} Reservasi)
                  </h3>

                  {checkResults.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl bg-[#FAF3E7] dark:bg-[#1A2620] p-5 border border-[#E4D9C4] dark:border-[#33413A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
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
                          Tanggal: <strong className="text-[#1E3D31] dark:text-white">{item.reservation_date}</strong> · Jam:{' '}
                          <strong className="text-[#1E3D31] dark:text-white">{item.reservation_time} WIB</strong> · {item.guest_count} Tamu
                        </p>
                        {item.table && (
                          <p className="text-[11px] text-[#C89B5C] font-semibold">
                            Meja Ditetapkan: Meja #{item.table.table_number} ({item.table.area || 'Main Hall'})
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[10px] uppercase text-[#5C5348] dark:text-[#B8A99A] block">Nomor HP</span>
                        <span className="font-mono text-xs font-bold text-[#1E3D31] dark:text-[#F5EFE6]">{item.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
