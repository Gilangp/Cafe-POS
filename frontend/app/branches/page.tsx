'use client';

import { PublicLayout } from '@/components/public-layout';
import { MapPin, Clock, Phone, Wifi, ShieldCheck, Sparkles, Navigation, Calendar, QrCode, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PublicBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  hours: string;
  status: 'Open Now' | 'Closing Soon';
  capacity: string;
  facilities: string[];
  featured: boolean;
}

const BRANCHES: PublicBranch[] = [
  {
    id: 'sudirman',
    name: 'Sudirman Flagship Lounge',
    code: 'SUD-01',
    address: 'Jl. Jenderal Sudirman Kav. 52-53, SCBD Lot 8, Jakarta Selatan 12190',
    phone: '+62 21 555 0101',
    hours: 'Setiap Hari · 07:00 - 23:00 WIB',
    status: 'Open Now',
    capacity: '120 Tempat Duduk (Indoor AC & Garden Terrace)',
    facilities: ['Slow-Bar Espresso Bar', 'Private VIP Room', 'Gigabit Wi-Fi', 'Valet Parking Available', 'Pet Friendly Area'],
    featured: true,
  },
  {
    id: 'kemang',
    name: 'Kemang Artisan Roastery Bar',
    code: 'KEM-02',
    address: 'Jl. Kemang Raya No. 45B, Bangka, Mampang Prapatan, Jakarta Selatan 12730',
    phone: '+62 21 555 0102',
    hours: 'Setiap Hari · 08:00 - 22:00 WIB',
    status: 'Open Now',
    capacity: '80 Tempat Duduk (Industrial Roastery Ambiance)',
    facilities: ['Roasting Machine Tour', 'Cupping Table', 'Fast Wi-Fi', 'Outdoor Garden'],
    featured: false,
  },
  {
    id: 'senayan',
    name: 'Senayan City Executive Lounge',
    code: 'SNC-03',
    address: 'Senayan City Mall Ground Floor, Crystal Lagoon Area, Jakarta Pusat 10270',
    phone: '+62 21 555 0103',
    hours: 'Senin - Minggu · 10:00 - 22:00 WIB',
    status: 'Open Now',
    capacity: '65 Tempat Duduk (Luxury Mall Atrium)',
    facilities: ['Executive Table-Service', 'Direct Mall Access', 'Fast Wi-Fi', 'Reserved VIP Slots'],
    featured: false,
  },
];

export default function BranchesPage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#12100E] text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Direktori Cabang (`GET /api/v1/branches/public`)</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Temukan Lounge Velvra Terdekat</h1>
          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
            Setiap cabang Velvra didesain secara unik untuk menghadirkan ketenangan, estetika arsitektur modern, dan kenyamanan bertransaksi dengan QR Table atau reservasi meja online.
          </p>
        </div>
      </section>

      {/* Branch Cards */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {BRANCHES.map((b) => (
            <div
              key={b.id}
              className={`rounded-3xl bg-white border-2 p-8 sm:p-10 shadow-sm transition-all hover:shadow-xl ${
                b.featured ? 'border-[#BA935D]/60' : 'border-gray-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{b.status}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                      Kode: {b.code}
                    </span>
                    {b.featured && (
                      <span className="rounded-full bg-[#12100E] text-[#BA935D] px-3 py-1 text-xs font-bold border border-[#BA935D]">
                        ★ Flagship Roastery
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{b.name}</h2>

                  <div className="space-y-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-[#BA935D] shrink-0 mt-0.5" />
                      <span>{b.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-[#BA935D] shrink-0" />
                      <span className="font-semibold text-gray-800">{b.hours}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-[#BA935D] shrink-0" />
                      <span>{b.phone}</span>
                    </div>
                  </div>

                  {/* Facilities list */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Fasilitas Lounge:</p>
                    <div className="flex flex-wrap gap-2">
                      {b.facilities.map((f) => (
                        <span key={f} className="flex items-center gap-1.5 rounded-xl bg-[#FAF6F0] border border-[#BA935D]/30 px-3 py-1.5 text-xs font-bold text-gray-700">
                          <CheckCircle2 size={13} className="text-[#BA935D]" />
                          <span>{f}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Actions Box */}
                <div className="lg:col-span-5 rounded-3xl bg-[#FAF6F0] border border-[#BA935D]/30 p-6 sm:p-8 space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#BA935D]">Kapasitas & Layanan</span>
                    <p className="font-serif text-lg font-bold text-gray-800">{b.capacity}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Lakukan reservasi meja 10 menit sebelumnya atau gunakan scan QR di meja saat tiba di lokasi untuk langsung terhubung dengan kasir dan dapur KDS.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link
                      href={`/reserve?branch=${b.code}`}
                      className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#12100E] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#BA935D] hover:bg-[#201d19] transition-all shadow-md"
                    >
                      <Calendar size={15} />
                      <span>Reservasi Meja</span>
                    </Link>

                    <Link
                      href={`/qr/MEJA-${b.code}-01`}
                      className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-2 border-[#12100E] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#12100E] hover:bg-[#12100E] hover:text-white transition-all"
                    >
                      <QrCode size={15} />
                      <span>Scan QR Demo</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
