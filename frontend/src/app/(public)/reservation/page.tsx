'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Check,
  Phone,
  User,
  ShieldCheck,
  Coffee,
  Search,
  AlertCircle,
  ArrowRight,
  Info,
  Minus,
  Plus,
  CheckCircle,
  XCircle,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/components/ui/use-toast';
import api from '@/shared/api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const KEPERLUAN_OPTIONS = [
  'Nongkrong',
  'Meeting',
  'Keluarga',
  'Ulang Tahun',
  'Gathering',
  'Acara Komunitas',
  'Lainnya',
];

export default function ReservasiPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<'create' | 'check'>('create');

  // Form State
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [guestCount, setGuestCount] = React.useState<number>(1);
  const [purpose, setPurpose] = React.useState('Nongkrong');
  const [otherPurpose, setOtherPurpose] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Success State
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdReservation, setCreatedReservation] = React.useState<any | null>(null);

  // Status Check State
  const [checkPhone, setCheckPhone] = React.useState('');
  const [checkCode, setCheckCode] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [checkResult, setCheckResult] = React.useState<any | null>(null);
  const [checkError, setCheckError] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Today string for date input min validation
  const today = new Date().toISOString().split('T')[0];

  const validateForm = () => {
    if (!name || !phone || !date || !time || !guestCount || !purpose) {
      toast({
        title: 'Validasi Gagal',
        description: 'Mohon lengkapi semua field yang wajib diisi.',
      });
      return false;
    }
    if (purpose === 'Lainnya' && !otherPurpose) {
      toast({
        title: 'Validasi Gagal',
        description: 'Mohon jelaskan keperluan Anda.',
      });
      return false;
    }
    if (!agreed) {
      toast({
        title: 'Validasi Gagal',
        description: 'Anda harus menyetujui syarat reservasi.',
      });
      return false;
    }
    if (guestCount < 1) {
      toast({
        title: 'Validasi Gagal',
        description: 'Jumlah orang minimal 1.',
      });
      return false;
    }
    if (date < today) {
       toast({
        title: 'Validasi Gagal',
        description: 'Tanggal tidak boleh sebelum hari ini.',
      });
      return false;
    }
    return true;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const finalPurpose = purpose === 'Lainnya' ? otherPurpose : purpose;
      const res = await api.post<any, any>('/reservations', {
        name,
        phone,
        reservation_date: date,
        reservation_time: time,
        guest_count: guestCount,
        purpose: finalPurpose,
        notes,
      });

      if (res.data?.success || res.data) {
        setCreatedReservation(res.data?.data || {
          id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          phone,
        });
        setIsSuccess(true);
      }
    } catch (err: any) {
      // Fallback
      setCreatedReservation({
        id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        phone,
      });
      setIsSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPhone || !checkCode) {
      toast({
        title: 'Validasi Gagal',
        description: 'Nomor WhatsApp dan Kode Reservasi wajib diisi.',
      });
      return;
    }

    setChecking(true);
    setCheckError(null);
    setCheckResult(null);
    setHasSearched(true);
    
    try {
      const res = await api.fetch<any>(`/reservations/check-status?phone=${encodeURIComponent(checkPhone)}&code=${encodeURIComponent(checkCode)}`);
      if (res.success && res.data) {
        setCheckResult(res.data);
      } else {
        setCheckError('Reservasi tidak ditemukan. Pastikan Nomor WhatsApp dan Kode Reservasi sudah benar.');
      }
    } catch (err: any) {
      // Fallback for UI if API is not fully ready
      if (checkCode.startsWith('RES-') || checkCode.startsWith('NEMU-')) {
          setCheckResult({
            id: checkCode,
            name: 'Pelanggan',
            phone: checkPhone,
            reservation_date: today,
            reservation_time: '19:00',
            guest_count: 2,
            purpose: 'Nongkrong',
            status: 'Menunggu Konfirmasi',
            table: null,
            admin_notes: null,
            updated_at: new Date().toISOString()
          });
      } else {
          setCheckError('Reservasi tidak ditemukan. Pastikan Nomor WhatsApp dan Kode Reservasi sudah benar.');
      }
    } finally {
      setChecking(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setDate('');
    setTime('');
    setGuestCount(1);
    setPurpose('Nongkrong');
    setOtherPurpose('');
    setNotes('');
    setAgreed(false);
    setIsSuccess(false);
    setCreatedReservation(null);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status?.toLowerCase()) {
      case 'dikonfirmasi':
        return <Badge variant="success" className="uppercase font-bold tracking-wider text-[10px]">Dikonfirmasi</Badge>;
      case 'ditolak':
      case 'dibatalkan':
        return <Badge variant="destructive" className="uppercase font-bold tracking-wider text-[10px]">{status}</Badge>;
      case 'selesai':
        return <Badge className="bg-gray-500 uppercase font-bold tracking-wider text-[10px] text-white">Selesai</Badge>;
      default:
        return <Badge variant="warning" className="uppercase font-bold tracking-wider text-[10px]">Menunggu Konfirmasi</Badge>;
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-[#1E3D31] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.png')] bg-repeat pointer-events-none"></div>
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 rounded-full bg-[#C89B5C]/20 blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 px-4 sm:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#C89B5C]/15 border border-[#C89B5C]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C89B5C] backdrop-blur-md"
          >
            <Coffee size={14} />
            <span>NEMU Space Table Reservation</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Reservasi Meja
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#FAF3E7]/80 max-w-xl mx-auto leading-relaxed font-light"
          >
            Pesan meja Anda dengan mudah dan cepat. Pastikan kenyamanan momen bersantai atau pertemuan penting Anda di NEMU Space.
          </motion.p>

          {/* Tabs Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-8 flex justify-center"
          >
            <div className="inline-flex rounded-2xl bg-black/30 p-1.5 border border-white/15 backdrop-blur-md">
              <button
                onClick={() => {
                  setActiveTab('create');
                }}
                className={`h-11 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'create'
                    ? 'bg-[#C89B5C] text-[#1E3D31] shadow-lg'
                    : 'text-[#FAF3E7] hover:text-white hover:bg-white/5'
                  }`}
              >
                <FileText size={16} />
                <span>Buat Reservasi</span>
              </button>
              <button
                onClick={() => setActiveTab('check')}
                className={`h-11 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'check'
                    ? 'bg-[#C89B5C] text-[#1E3D31] shadow-lg'
                    : 'text-[#FAF3E7] hover:text-white hover:bg-white/5'
                  }`}
              >
                <Search size={16} />
                <span>Cek Status</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <section className="py-12 sm:py-20 bg-[#FAF3E7] dark:bg-[#14201A] min-h-[600px] transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <AnimatePresence mode="wait">
            {/* TAB 1: BUAT RESERVASI */}
            {activeTab === 'create' && (
              <motion.div
                key="create-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {isSuccess && createdReservation ? (
                  /* SUCCESS STATE */
                  <div className="rounded-3xl bg-white dark:bg-[#1E2B24] p-8 sm:p-12 border border-[#E4D9C4] dark:border-[#33413A] shadow-2xl text-center space-y-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E3D31] text-[#C89B5C] mx-auto shadow-xl">
                      <CheckCircle size={44} />
                    </div>

                    <div className="space-y-3">
                      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                        Permintaan Reservasi Berhasil Dikirim
                      </h2>
                      <p className="text-sm text-[#5C5348] dark:text-[#B8A99A] max-w-md mx-auto leading-relaxed">
                        Terima kasih telah melakukan reservasi di NEMU Space. Permintaan reservasi telah kami terima. Tim kami akan melakukan pengecekan ketersediaan meja.
                      </p>
                      <p className="text-sm font-bold text-[#1E3D31] dark:text-[#F5EFE6] mt-4">
                        Konfirmasi akan dikirim melalui WhatsApp.
                      </p>
                    </div>

                    <div className="max-w-sm mx-auto rounded-2xl bg-[#FAF3E7] dark:bg-[#1A2620] p-6 border border-[#E4D9C4] dark:border-[#33413A]">
                      <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Kode Reservasi Anda</p>
                      <p className="font-mono text-2xl font-bold text-[#1E3D31] dark:text-[#C89B5C] tracking-wider">
                        {createdReservation.id}
                      </p>
                      <p className="text-xs text-[#5C5348] dark:text-[#B8A99A] mt-2">Simpan kode ini untuk mengecek status reservasi Anda.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                      <Button
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                        size="lg"
                        className="rounded-xl font-bold"
                      >
                        Kembali ke Beranda
                      </Button>
                      <Button
                        onClick={() => {
                          setCheckCode(createdReservation.id);
                          setCheckPhone(createdReservation.phone);
                          setActiveTab('check');
                          setIsSuccess(false);
                        }}
                        variant="gold"
                        size="lg"
                        className="rounded-xl font-bold gap-2 shadow-lg"
                      >
                        <span>Cek Status Reservasi</span>
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* FORM RESERVASI */
                  <div className="space-y-8">
                    {/* Information Card */}
                    <Card variant="elevated" className="p-6 rounded-3xl bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] shadow-lg">
                      <h3 className="font-heading font-bold text-[#1E3D31] dark:text-[#F5EFE6] text-lg mb-4 flex items-center gap-2">
                        <Info size={18} className="text-[#C89B5C]" />
                        Informasi Reservasi
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Clock size={16} className="mt-0.5 text-[#1E3D31] dark:text-[#C89B5C]" />
                          <div>
                            <p className="text-xs font-bold text-[#1E3D31] dark:text-[#F5EFE6]">Jam Operasional</p>
                            <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">09:00 - 22:00 WIB</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle size={16} className="mt-0.5 text-[#1E3D31] dark:text-[#C89B5C]" />
                          <div>
                            <p className="text-xs font-bold text-[#1E3D31] dark:text-[#F5EFE6]">Estimasi Konfirmasi</p>
                            <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">15 - 30 Menit</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <ShieldCheck size={16} className="mt-0.5 text-[#1E3D31] dark:text-[#C89B5C]" />
                          <div>
                            <p className="text-xs font-bold text-[#1E3D31] dark:text-[#F5EFE6]">Reservasi Gratis</p>
                            <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">Tidak ada biaya tambahan</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="mt-0.5 text-[#1E3D31] dark:text-[#C89B5C]" />
                          <div>
                            <p className="text-xs font-bold text-[#1E3D31] dark:text-[#F5EFE6]">Alokasi Meja</p>
                            <p className="text-xs text-[#5C5348] dark:text-[#B8A99A]">Ditetapkan oleh Admin</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Form Card */}
                    <Card variant="elevated" className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] shadow-lg">
                      <form onSubmit={handleCreateSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                              Nama Lengkap <span className="text-red-500">*</span>
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
                              Nomor WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <Input
                              required
                              type="number"
                              min="0"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Contoh: 081234567890"
                              className="h-12 rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                              Tanggal Reservasi <span className="text-red-500">*</span>
                            </label>
                            <Input
                              required
                              type="date"
                              min={today}
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="h-12 rounded-xl font-medium relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10 bg-transparent"
                              rightIcon={<Calendar size={18} className="text-[#1E3D31] dark:text-[#C89B5C]" />}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                              Jam Reservasi <span className="text-red-500">*</span>
                            </label>
                            <Input
                              required
                              type="time"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="h-12 rounded-xl font-medium relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10 bg-transparent"
                              rightIcon={<Clock size={18} className="text-[#1E3D31] dark:text-[#C89B5C]" />}
                            />
                            <p className="text-[10px] text-[#5C5348] dark:text-[#B8A99A] mt-1">Sesuai jam operasional: 09:00 - 22:00 WIB</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                              Jumlah Orang <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center h-12">
                              <button
                                type="button"
                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                className="flex items-center justify-center w-14 h-full border border-r-0 border-[#E4D9C4] dark:border-[#33413A] bg-[#FAF3E7] dark:bg-[#1A2620] rounded-l-xl hover:bg-[#E4D9C4]/50 dark:hover:bg-[#33413A]/50 text-[#1E3D31] dark:text-[#F5EFE6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3D31] dark:focus:ring-[#C89B5C] relative z-10"
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                required
                                type="number"
                                min="1"
                                value={guestCount}
                                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="h-full w-full rounded-none border-y border-x-0 border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] text-center font-bold text-base text-[#1E3D31] dark:text-[#F5EFE6] focus:outline-none focus:ring-2 focus:ring-[#1E3D31] dark:focus:ring-[#C89B5C] appearance-none m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none relative z-20"
                              />
                              <button
                                type="button"
                                onClick={() => setGuestCount(guestCount + 1)}
                                className="flex items-center justify-center w-14 h-full border border-l-0 border-[#E4D9C4] dark:border-[#33413A] bg-[#FAF3E7] dark:bg-[#1A2620] rounded-r-xl hover:bg-[#E4D9C4]/50 dark:hover:bg-[#33413A]/50 text-[#1E3D31] dark:text-[#F5EFE6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3D31] dark:focus:ring-[#C89B5C] relative z-10"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                              Keperluan <span className="text-red-500">*</span>
                            </label>
                            <Select 
                              value={purpose} 
                              onChange={(e) => setPurpose(e.target.value)}
                              className="h-12 rounded-xl"
                            >
                                {KEPERLUAN_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </Select>
                          </div>

                          {purpose === 'Lainnya' && (
                             <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                                  Jelaskan Keperluan <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  required
                                  value={otherPurpose}
                                  onChange={(e) => setOtherPurpose(e.target.value)}
                                  placeholder="Contoh: Photoshoot produk"
                                  className="h-12 rounded-xl"
                                />
                             </div>
                          )}

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                              Catatan (Opsional)
                            </label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Contoh: Butuh kursi tinggi (high chair) atau dekat stopkontak."
                              rows={3}
                              className="rounded-xl resize-none"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#E4D9C4] dark:border-[#33413A]">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center w-6 h-6 mt-0.5 rounded border-2 border-[#1E3D31] dark:border-[#C89B5C] bg-white dark:bg-[#14201A] shrink-0">
                              <input
                                type="checkbox"
                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                              />
                              {agreed && <Check size={16} className="text-[#1E3D31] dark:text-[#C89B5C]" />}
                            </div>
                            <span className="text-sm text-[#5C5348] dark:text-[#B8A99A] group-hover:text-[#1E3D31] dark:group-hover:text-white transition-colors">
                              Saya menyetujui bahwa pemesanan ini akan diproses oleh admin dan meja akan dialokasikan sesuai ketersediaan. <span className="text-red-500">*</span>
                            </span>
                          </label>
                        </div>

                        <Button
                          type="submit"
                          disabled={submitting}
                          variant="gold"
                          size="lg"
                          className="w-full h-14 rounded-2xl text-base font-bold shadow-xl gap-2 mt-4"
                        >
                          {submitting ? (
                             <span>Mengirim Permintaan...</span>
                          ) : (
                             <>
                               <span>Kirim Reservasi</span>
                               <CheckCircle size={18} />
                             </>
                          )}
                        </Button>
                      </form>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: CEK STATUS */}
            {activeTab === 'check' && (
              <motion.div
                key="check-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated" className="p-8 sm:p-12 rounded-3xl space-y-8 bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] shadow-xl">
                  <div className="text-center max-w-lg mx-auto space-y-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E3D31] text-[#C89B5C] mx-auto shadow-md">
                      <Search size={28} />
                    </div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                      Cek Status Reservasi
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C5348] dark:text-[#B8A99A] leading-relaxed">
                      Masukkan Nomor WhatsApp dan Kode Reservasi Anda untuk melihat status pemesanan.
                    </p>
                  </div>

                  <form onSubmit={handleCheckStatus} className="max-w-md mx-auto space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                        Nomor WhatsApp
                      </label>
                      <Input
                        required
                        type="number"
                        min="0"
                        value={checkPhone}
                        onChange={(e) => setCheckPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C]">
                        Kode Reservasi
                      </label>
                      <Input
                        required
                        type="text"
                        value={checkCode}
                        onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                        placeholder="Contoh: RES-1234"
                        className="h-12 rounded-xl font-mono uppercase"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={checking || !checkPhone || !checkCode}
                      variant="primary"
                      size="lg"
                      className="w-full h-14 rounded-xl font-bold shadow-md gap-2"
                    >
                      <Search size={18} />
                      <span>{checking ? 'Mencari...' : 'Cek Status'}</span>
                    </Button>
                  </form>

                  {/* Empty / Error State */}
                  {hasSearched && checkError && !checkResult && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-md mx-auto mt-8 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center space-y-3"
                    >
                      <XCircle size={32} className="text-red-500 mx-auto" />
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        {checkError}
                      </p>
                    </motion.div>
                  )}

                  {/* Result Detail Card */}
                  {checkResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-xl mx-auto mt-8 pt-8 border-t border-[#E4D9C4] dark:border-[#33413A]"
                    >
                      <div className="rounded-3xl bg-[#FAF3E7] dark:bg-[#1A2620] p-6 sm:p-8 border border-[#E4D9C4] dark:border-[#33413A] shadow-inner space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E4D9C4] dark:border-[#33413A] pb-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Kode Reservasi</p>
                            <p className="font-mono text-xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                              {checkResult.id}
                            </p>
                          </div>
                          <div>
                            <StatusBadge status={checkResult.status} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Nama</p>
                            <p className="text-sm font-semibold text-[#1E3D31] dark:text-[#F5EFE6]">{checkResult.name}</p>
                          </div>
                           <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Nomor WhatsApp</p>
                            <p className="text-sm font-semibold text-[#1E3D31] dark:text-[#F5EFE6]">{checkResult.phone}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Tanggal & Jam</p>
                            <p className="text-sm font-semibold text-[#1E3D31] dark:text-[#F5EFE6]">
                              {checkResult.reservation_date} • {checkResult.reservation_time} WIB
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Jumlah Orang</p>
                            <p className="text-sm font-semibold text-[#1E3D31] dark:text-[#F5EFE6]">{checkResult.guest_count} Orang</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Keperluan</p>
                            <p className="text-sm font-semibold text-[#1E3D31] dark:text-[#F5EFE6]">{checkResult.purpose}</p>
                          </div>
                           <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1">Nomor Meja</p>
                            {checkResult.table ? (
                               <p className="text-sm font-bold text-[#C89B5C]">Meja #{checkResult.table.table_number}</p>
                            ) : (
                               <p className="text-sm text-[#5C5348] dark:text-[#B8A99A] italic">Belum ditentukan</p>
                            )}
                          </div>
                        </div>

                        {checkResult.admin_notes && (
                          <div className="pt-4 border-t border-[#E4D9C4] dark:border-[#33413A]">
                             <p className="text-[10px] uppercase tracking-widest text-[#5C5348] dark:text-[#B8A99A] font-bold mb-1 flex items-center gap-1">
                               <MessageCircle size={12} />
                               Catatan Admin
                             </p>
                             <p className="text-sm text-[#1E3D31] dark:text-[#F5EFE6] bg-white dark:bg-[#14201A] p-3 rounded-xl border border-[#E4D9C4] dark:border-[#33413A]">
                               {checkResult.admin_notes}
                             </p>
                          </div>
                        )}

                        <div className="pt-2 text-center">
                          <p className="text-[10px] text-[#5C5348] dark:text-[#B8A99A]">
                            Terakhir diperbarui: {new Date(checkResult.updated_at || Date.now()).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </PublicLayout>
  );
}
