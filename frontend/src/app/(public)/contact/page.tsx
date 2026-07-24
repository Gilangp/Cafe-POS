'use client';

import { PublicLayout } from '@/shared/components/layout/public-layout';
import { Coffee, Award, Users, ShieldCheck, Heart, Sparkles, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-[#12100E] text-white py-20 border-b border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#BA935D]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#BA935D] border border-[#BA935D]/30">
              <Coffee size={14} />
              <span>Roastery & Artisan Lounge</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              Dedikasi Kami Pada Sejumput Biji Kopi Nusantara
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed font-sans">
              NEMU Space lahir dari sebuah visi sederhana: menghadirkan pengalaman kuliner dan ruang temu yang nyaman. Dari racikan kopi spesiality, sajian *milk-based* yang creamy, hingga artisan pastry hangat, setiap elemen dirancang untuk menemani momen berharga Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Philosophy Grid */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Filosofi NEMU Space</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-snug">
                Harmoni Rasa Dalam Setiap Sajian
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kami percaya bahwa kualitas bermula dari bahan baku terbaik. Mulai dari biji kopi pilihan nusantara yang disangrai dengan presisi, hingga racikan susu dan sirup premium untuk kreasi *milk-based* yang memanjakan lidah setiap kalangan.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tak hanya minuman, dapur kami juga setiap hari memproduksi *fresh artisan pastry* dan hidangan utama yang dikurasi khusus agar menjadi pendamping sempurna untuk secangkir minuman favorit Anda di ruang komunal kami yang estetik.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <Award size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Premium Quality</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Biji kopi specialty, racikan susu premium, dan bahan baku berkualitas tinggi.</p>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <Users size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Ruang Komunal Nyaman</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Fasilitas lengkap dengan Wi-Fi cepat, area *indoor* dingin, dan *lounge* santai.</p>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Menu Universal</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Varian kopi, teh artisan, cokelat murni, *mocktail*, hingga *fresh pastry* harian.</p>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <Heart size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Keramahan Pelayanan</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Setiap pesanan disajikan dengan kehangatan dan senyuman terbaik dari tim kami.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-3xl bg-[#12100E] text-white p-12 text-center relative overflow-hidden border-2 border-[#BA935D]/40 shadow-2xl space-y-6">
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white">Rasakan Pengalaman NEMU Space Hari Ini</h3>
            <p className="text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
              Kunjungi langsung lounge kami atau pesan melalui layanan pengantaran cepat kami.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/menu"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#BA935D] px-8 text-xs font-bold uppercase tracking-wider text-[#12100E] hover:bg-[#c8a169] transition-all shadow-lg"
              >
                <span>Pesan Online Sekarang</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/reservation"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/5 px-8 text-xs font-bold uppercase tracking-wider text-white hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
              >
                Reservasi Meja
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
