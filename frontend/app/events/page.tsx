'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/public-layout';
import { Calendar, Clock, MapPin, Users, Ticket, CheckCircle2, ArrowRight, Sparkles, Coffee } from 'lucide-react';
import Link from 'next/link';

interface CoffeeEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  branch: string;
  price: string;
  seatsTotal: number;
  seatsLeft: number;
  category: 'Cupping Session' | 'Brewing Masterclass' | 'Competition';
  desc: string;
}

const UPCOMING_EVENTS: CoffeeEvent[] = [
  {
    id: 'EVT-101',
    title: 'Public Cupping Session: Eksplorasi Single Origin Sumatra & Bali',
    date: 'Sabtu, 18 Juli 2026',
    time: '14:00 - 16:00 WIB',
    branch: 'Sudirman Flagship Lounge',
    price: 'GRATIS (Terbatas 20 Orang)',
    seatsTotal: 20,
    seatsLeft: 6,
    category: 'Cupping Session',
    desc: 'Sesi mencicipi kopi terpandu bersama Q-Grader internal kami. Anda akan mempelajari roda rasa SCA (*SCA Flavor Wheel*) dan mengenali keasaman asam malat versus manisnya gula aren alami.',
  },
  {
    id: 'EVT-102',
    title: 'Home Brewing V60 Masterclass bersama Head Roaster',
    date: 'Minggu, 26 Juli 2026',
    time: '10:00 - 13:00 WIB',
    branch: 'Kemang Artisan Roastery Bar',
    price: 'Rp 250.000 / peserta (Termasuk 200g Biji Kopi & Dripper)',
    seatsTotal: 15,
    seatsLeft: 4,
    category: 'Brewing Masterclass',
    desc: 'Pelatihan intensif menyeduh kopi manual di rumah. Pelajari rasio air 1:15, suhu optimal 92°C, serta teknik tuangan *pulse pouring* untuk mengekstraksi rasa buah beraneka ragam.',
  },
  {
    id: 'EVT-103',
    title: 'Velvra Latte Art Throwdown 2026 — babak Penyisihan',
    date: 'Sabtu, 8 Agustus 2026',
    time: '15:00 - 19:00 WIB',
    branch: 'Senayan City Executive Lounge',
    price: 'Gratis Menonton / Rp 150.000 (Peserta Lomba)',
    seatsTotal: 40,
    seatsLeft: 12,
    category: 'Competition',
    desc: 'Kompetisi seni melukis busa susu (*Rosetta & Rosetta Tulip*) antar barista se-Jabodetabek berhadiah total Rp 15 Juta serta trofi eksklusif Velvra Golden Pitcher.',
  },
];

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<CoffeeEvent | null>(null);
  const [registeredAlert, setRegisteredAlert] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleRegisterEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegisteredAlert(`✓ Pendaftaran berhasil! Tiket digital untuk "${selectedEvent.title}" telah dikirim ke WhatsApp Anda (${regPhone}).`);
    setSelectedEvent(null);
    setRegName('');
    setRegPhone('');
    setTimeout(() => setRegisteredAlert(''), 5000);
  };

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#12100E] text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Kalender Acara & Workshop (`GET /api/v1/pages/events`)</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Event, Cupping Session & Kelas Seduh</h1>
          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
            Perdalam wawasan dan apresiasi Anda terhadap dunia kopi specialty melalui rangkaian lokakarya interaktif yang dipandu langsung oleh para roaster & sensory spesialis kami.
          </p>
        </div>
      </section>

      {/* Alert status */}
      {registeredAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-5 text-sm font-bold text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <span>{registeredAlert}</span>
            </div>
            <span className="text-[10px] uppercase font-mono bg-emerald-200/80 px-2.5 py-1 rounded">Confirmed</span>
          </div>
        </div>
      )}

      {/* Upcoming Events Grid */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Jadwal Acara Mendatang ({UPCOMING_EVENTS.length})</h2>
            <span className="text-xs text-gray-500 font-semibold">Daftar sebelum kehabisan kursi</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {UPCOMING_EVENTS.map((evt) => (
              <div
                key={evt.id}
                className="rounded-3xl bg-white border-2 border-gray-200 p-7 shadow-sm transition-all hover:shadow-xl hover:border-[#BA935D]/60 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#12100E] text-[#BA935D] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1">
                      <Users size={12} /> Sisa {evt.seatsLeft} kursi
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-gray-900 leading-snug">{evt.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed min-h-[60px]">{evt.desc}</p>

                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={15} className="text-[#BA935D] shrink-0" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={15} className="text-[#BA935D] shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin size={15} className="text-[#BA935D] shrink-0" />
                      <span>{evt.branch}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Investasi / Tiket</span>
                    <span className="font-serif font-bold text-gray-800 text-sm">{evt.price}</span>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(evt)}
                    disabled={evt.seatsLeft === 0}
                    className="min-h-[44px] w-full rounded-2xl bg-[#12100E] text-[#BA935D] font-bold text-xs uppercase tracking-wider hover:bg-[#201d19] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Ticket size={15} />
                    <span>Daftar Sekarang</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#BA935D]">Tiket Reservasi Acara</span>
                <h3 className="font-serif text-xl font-bold text-gray-900 leading-tight">{selectedEvent.title}</h3>
              </div>
            </div>

            <form onSubmit={handleRegisterEvent} className="space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4 text-xs space-y-1.5 border border-gray-200">
                <p className="font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={14} className="text-[#BA935D]" /> {selectedEvent.date} ({selectedEvent.time})
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin size={14} className="text-[#BA935D]" /> {selectedEvent.branch}
                </p>
                <p className="font-mono text-[11px] font-bold text-gray-700 pt-1 border-t border-gray-200 mt-1">
                  Biaya: {selectedEvent.price}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Peserta</label>
                <input
                  required
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Nadia Rahmawati"
                  className="min-h-[44px] w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp (Untuk Pengiriman e-Ticket)</label>
                <input
                  required
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+62 811 2233 4455"
                  className="min-h-[44px] w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="min-h-[44px] flex-1 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 rounded-xl bg-[#12100E] text-[#BA935D] font-bold text-xs shadow hover:bg-[#201d19]"
                >
                  Konfirmasi Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
