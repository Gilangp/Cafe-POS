'use client';

import { useState } from 'react';
import { CustomerLayout } from '@/components/customer/customer-layout';
import { Calendar, Clock, Users, MapPin, Check, Sparkles, ChevronRight, Phone, Mail, User, ShieldCheck, Armchair, Trees, Coffee, Crown } from 'lucide-react';

const DATES = [
  { dayName: 'Hari Ini', dateStr: '14 Jul', fullDate: '2026-07-14' },
  { dayName: 'Besok', dateStr: '15 Jul', fullDate: '2026-07-15' },
  { dayName: 'Kamis', dateStr: '16 Jul', fullDate: '2026-07-16' },
  { dayName: 'Jumat', dateStr: '17 Jul', fullDate: '2026-07-17' },
  { dayName: 'Sabtu', dateStr: '18 Jul', fullDate: '2026-07-18' },
  { dayName: 'Minggu', dateStr: '19 Jul', fullDate: '2026-07-19' },
  { dayName: 'Senin', dateStr: '20 Jul', fullDate: '2026-07-20' },
];

const TIME_SLOTS = [
  { session: 'Brunch & Lunch', times: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'] },
  { session: 'Afternoon Coffee & Pastry', times: ['14:30', '15:00', '15:30', '16:00', '16:30', '17:00'] },
  { session: 'Dinner & Artisan Lounge', times: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] },
];

const SEATING_AREAS = [
  { id: 'main', label: 'Main Dining Hall', desc: 'Area utama ber-AC dengan pencahayaan hangat & kursi sofa nyaman.', Icon: Armchair },
  { id: 'garden', label: 'Outdoor Garden Terrace', desc: 'Area terbuka asri dengan tanaman hijau alami & angin sepoi-sepoi.', Icon: Trees },
  { id: 'bar', label: 'Artisan Bar Counter', desc: 'Duduk langsung di depan barista menyaksikan proses brewing & roastery.', Icon: Coffee },
  { id: 'private', label: 'VIP Private Lounge', desc: 'Ruangan kedap suara privat untuk meeting bisnis atau keluarga (Min. 6 tamu).', Icon: Crown },
];

export default function ReservationPage() {
  const [branch, setBranch] = useState('Sudirman Flagship');
  const [selectedDate, setSelectedDate] = useState(DATES[0].fullDate);
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedArea, setSelectedArea] = useState('main');
  const [occasion, setOccasion] = useState('Casual Dine');

  // Form Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookingCode, setBookingCode] = useState('');

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingCode(code);
    setStep(3);
  };

  return (
    <CustomerLayout>
      {/* Top Hero Banner */}
      <div className="bg-[#12100E] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#BA935D]/20 border border-[#BA935D]/40 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#BA935D]">
            <Sparkles size={13} /> Exclusive Booking
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-white">
            Reservasi Meja Lounge
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            Pastikan ketersediaan meja terbaik untuk momen berharga Anda di Velvra Artisan Coffee.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-10 px-4">
          {[
            { num: 1, label: 'Waktu & Area' },
            { num: 2, label: 'Detail Tamu' },
            { num: 3, label: 'Konfirmasi' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  step === s.num
                    ? 'bg-[#12100E] text-[#BA935D] ring-4 ring-[#BA935D]/30'
                    : step > s.num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step === s.num ? 'text-[#12100E]' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {idx < 2 && <div className="h-0.5 w-8 sm:w-16 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Waktu & Area */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Branch Selection */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="text-[#BA935D]" size={20} />
                <span>1. Pilih Lokasi Cabang</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Sudirman Flagship', 'Kemang Artisan Bar', 'Senayan City Lounge'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBranch(b)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      branch === b
                        ? 'border-[#BA935D] bg-[#BA935D]/10 font-bold text-[#12100E]'
                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm">{b}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-normal">Tersedia untuk reservasi</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-[#BA935D]" size={20} />
                <span>2. Pilih Tanggal Kunjungan</span>
              </h2>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {DATES.map((d) => (
                  <button
                    key={d.fullDate}
                    type="button"
                    onClick={() => setSelectedDate(d.fullDate)}
                    className={`shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 px-6 py-4 min-w-[100px] transition-all ${
                      selectedDate === d.fullDate
                        ? 'border-[#12100E] bg-[#12100E] text-[#BA935D]'
                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-[#BA935D]'
                    }`}
                  >
                    <span className="text-[11px] font-semibold opacity-70 uppercase tracking-wider">{d.dayName}</span>
                    <span className="text-lg font-bold font-serif mt-1">{d.dateStr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-[#BA935D]" size={20} />
                <span>3. Pilih Jam Kunjungan</span>
              </h2>

              <div className="space-y-5">
                {TIME_SLOTS.map((slot) => (
                  <div key={slot.session} className="space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{slot.session}</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.times.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                            selectedTime === t
                              ? 'border-[#BA935D] bg-[#BA935D] text-[#12100E] shadow-md'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#BA935D]'
                          }`}
                        >
                          {t} WIB
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Party Size & Seating Area */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <h2 className="font-serif text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="text-[#BA935D]" size={20} />
                  <span>4. Jumlah Tamu</span>
                </h2>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${
                        guestCount === num
                          ? 'border-[#BA935D] bg-[#12100E] text-[#BA935D]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#BA935D]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Preferensi Area Meja</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SEATING_AREAS.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setSelectedArea(area.id)}
                      className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                        selectedArea === area.id
                          ? 'border-[#BA935D] bg-[#BA935D]/10'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#BA935D]/15 text-[#BA935D]">
                        <area.Icon size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{area.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{area.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-2xl bg-[#12100E] px-8 py-4 text-sm font-bold text-[#BA935D] shadow-xl hover:bg-[#201d19] active:scale-95 transition-all"
              >
                <span>Lanjut Isi Data Tamu</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Detail Tamu */}
        {step === 2 && (
          <form onSubmit={handleCreateReservation} className="space-y-8 animate-in fade-in duration-300">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                <User className="text-[#BA935D]" size={22} />
                <span>Detail Informasi Pemesan</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Nama Lengkap *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Rina Mahardika"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Nomor WhatsApp * (Untuk e-ticket)</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Alamat Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Contoh: rina@velvra.id"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tujuan Kunjungan / Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                  >
                    <option value="Casual Dine">Casual Coffee & Dining</option>
                    <option value="Birthday Celebration">Birthday Celebration (Ulang Tahun)</option>
                    <option value="Anniversary">Anniversary Celebration</option>
                    <option value="Business Meeting">Business Meeting & Working</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Permintaan Khusus (Optional)</label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Contoh: Tolong siapkan high chair untuk bayi, butuh colokan listrik dekat meja, dll."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              {/* Booking Summary Box */}
              <div className="rounded-2xl bg-[#FAF6F0] border border-[#BA935D]/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#BA935D]">Ringkasan Pilihan Anda</p>
                  <p className="text-base font-bold text-gray-800">{branch} · {selectedTime} WIB</p>
                  <p className="text-xs text-gray-500">Tanggal: <strong className="text-gray-700">{selectedDate}</strong> · Tamu: <strong className="text-gray-700">{guestCount} Orang</strong> · Area: <strong className="text-gray-700">{SEATING_AREAS.find((a) => a.id === selectedArea)?.label}</strong></p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200 shrink-0">
                  <ShieldCheck size={16} /> Meja Tersedia & Gratis Reservasi
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl border border-gray-300 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-[#12100E] px-8 py-4 text-sm font-bold text-[#BA935D] shadow-xl hover:bg-[#201d19] active:scale-95 transition-all"
              >
                <Check size={18} />
                <span>Konfirmasi & Buat Reservasi</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="rounded-3xl bg-white p-8 sm:p-12 border border-gray-200 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto shadow-inner">
              <Check size={44} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-[#BA935D]/20 text-[#BA935D] text-xs font-bold uppercase tracking-widest px-4 py-1 mb-2">
                Booking Confirmed
              </span>
              <h2 className="font-serif text-3xl font-bold text-gray-800">Reservasi Meja Berhasil!</h2>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                E-ticket resmi dan notifikasi pengingat telah dikirim via WhatsApp ke nomor <strong className="text-gray-800">{phone}</strong>.
              </p>
            </div>

            {/* E-Ticket Card */}
            <div className="max-w-md mx-auto rounded-3xl bg-[#12100E] text-white p-6 border-2 border-[#BA935D] shadow-xl text-left space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#BA935D] font-bold">Kode Reservasi Resmi</p>
                  <p className="font-mono text-2xl font-bold text-white tracking-wider mt-0.5">{bookingCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Status</p>
                  <span className="inline-block rounded-full bg-green-500/20 text-green-400 font-bold text-xs px-2.5 py-0.5 mt-0.5 border border-green-500/30">
                    Confirmed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-white/40 uppercase font-semibold">Nama Pemesan</p>
                  <p className="font-bold text-white mt-0.5">{fullName || 'Rina Mahardika'}</p>
                </div>
                <div>
                  <p className="text-white/40 uppercase font-semibold">Cabang Tujuan</p>
                  <p className="font-bold text-white mt-0.5">{branch}</p>
                </div>
                <div>
                  <p className="text-white/40 uppercase font-semibold">Jadwal Kunjungan</p>
                  <p className="font-bold text-[#BA935D] mt-0.5">{selectedDate} · {selectedTime} WIB</p>
                </div>
                <div>
                  <p className="text-white/40 uppercase font-semibold">Meja & Tamu</p>
                  <p className="font-bold text-white mt-0.5">{guestCount} Tamu · {SEATING_AREAS.find((a) => a.id === selectedArea)?.label}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-white/60">
                <span>Harap tiba 10 menit sebelum jam reservasi</span>
                <span className="font-mono text-[#BA935D]">VELVRA-2026</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => { setStep(1); setFullName(''); setPhone(''); setEmail(''); }}
                className="rounded-2xl border border-gray-300 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Buat Reservasi Baru
              </button>
              <a
                href="/order"
                className="rounded-2xl bg-[#BA935D] px-6 py-3.5 text-sm font-bold text-[#12100E] shadow-lg hover:opacity-95 transition-opacity"
              >
                Pre-order Menu Sebelum Datang →
              </a>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
