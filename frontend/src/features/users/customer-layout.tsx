'use client';

import { CustomerHeader } from '@/features/users/customer-header';
import Link from 'next/link';
import { Coffee, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#12100E] font-sans">
      <CustomerHeader />
      
      <main className="flex-1">
        {children}
      </main>

      {/* Luxury Artisan Footer */}
      <footer className="bg-[#12100E] text-white border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand Story */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BA935D]/20 border border-[#BA935D]/40">
                  <Coffee size={18} className="text-[#BA935D]" />
                </div>
                <span className="font-serif text-2xl font-bold tracking-wide">Velvra</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Where Every Sip Tells a Story. Kami menghadirkan pengalaman artisan coffee kelas dunia dengan pelayanan digital terintegrasi.
              </p>
              <div className="flex gap-3 pt-2">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                  <Instagram size={16} />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                  <Facebook size={16} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#BA935D] mb-4">
                Navigasi Cepat
              </h3>
              <ul className="space-y-2.5 text-sm text-white/70">
                <li><Link href="/" className="hover:text-white transition-colors">Beranda Utama</Link></li>
                <li><Link href="/menu" className="hover:text-white transition-colors">Pesan Online & Delivery</Link></li>
                <li><Link href="/reserve" className="hover:text-white transition-colors">Reservasi Meja Lounge</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">Loyalty & Reward Poin</Link></li>
              </ul>
            </div>

            {/* Branch Locations */}
            <div>
              <h3 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#BA935D] mb-4">
                Lokasi Cabang
              </h3>
              <ul className="space-y-3 text-xs text-white/70">
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-[#BA935D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Sudirman Flagship</strong>
                    <span>SCBD Lot 8, Jakarta Selatan</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-[#BA935D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Kemang Artisan Bar</strong>
                    <span>Jl. Kemang Raya No. 45, Jakarta</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#BA935D] mb-4">
                Hubungi Kami
              </h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-3">
                  <Phone size={15} className="text-[#BA935D]" />
                  <span>+62 811 8899 7766</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={15} className="text-[#BA935D]" />
                  <span>concierge@velvra.id</span>
                </li>
              </ul>
              <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-[11px] uppercase tracking-wider text-[#BA935D] font-bold">Jam Operasional</p>
                <p className="text-xs text-white/80 mt-1">Senin — Minggu: 07:00 — 22:00 WIB</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
            <p>© 2026 Velvra Coffee Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
