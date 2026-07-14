'use client';

import { PublicLayout } from '@/components/public-layout';
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
              <span>Roastery & Artisan Lounge (`GET /api/v1/pages/about`)</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              Dedikasi Kami Pada Sejumput Biji Kopi Nusantara
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed font-sans">
              Velvra lahir pada tahun 2024 dari sebuah visi sederhana: mengangkat derajat cita rasa kopi lokal Indonesia ke panggung kejernihan tertinggi (*highest cup clarity*) melalui teknik pemanggangan termodern dan keramahan slow-bar.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Philosophy Grid */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Filosofi Velvra</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-snug">
                Dari Dataran Tinggi Sumatra Hingga Cangkir Anda
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kami bekerjasama langsung secara etis (*direct trade*) dengan petani kopi di dataran tinggi Gayo, Kintamani Bali, dan Toraja Sapan. Setiap batch buah kopi (*cherry*) dipetik pada tingkat kematangan sempurna sebelum melalui proses fermentasi terkontrol.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Di roastery utama kami di Jakarta Selatan, *master roaster* Velvra memprofiling setiap kurva pemanggangan untuk menonjolkan karakter alami rasa buah, manisnya karamel, dan body yang seimbang tanpa kehangatan pahit (*zero over-roast bitterness*).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <Award size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">100% Specialty Grade</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Skor cupping Q-Grader internasional selalu di atas 86+ untuk semua single origin.</p>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <Users size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Direct Trade Fair</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Membayar harga premium 30% di atas harga pasar komoditas kepada petani lokal.</p>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Zero Waste Green</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Ampas kopi didaur ulang 100% menjadi pupuk organik perkebunan dan scrub alami.</p>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <Heart size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Artisan Hospitality</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Setiap cangkir disajikan dengan kehangatan dan penjelasan spesifikasi rasa.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-3xl bg-[#12100E] text-white p-12 text-center relative overflow-hidden border-2 border-[#BA935D]/40 shadow-2xl space-y-6">
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white">Rasakan Sensasi Kopi Velvra Hari Ini</h3>
            <p className="text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
              Kunjungi langsung lounge kami di Sudirman atau pesan melalui layanan pengantaran cepat kami.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/order"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#BA935D] px-8 text-xs font-bold uppercase tracking-wider text-[#12100E] hover:bg-[#c8a169] transition-all shadow-lg"
              >
                <span>Pesan Online Sekarang</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/branches"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/5 px-8 text-xs font-bold uppercase tracking-wider text-white hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
              >
                Lihat Lokasi Cabang
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
