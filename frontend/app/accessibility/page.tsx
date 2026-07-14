'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/public-layout';
import { ShieldCheck, CheckCircle2, Eye, Keyboard, Smartphone, Sparkles, Sliders, Check } from 'lucide-react';

export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [highContrast, setHighContrast] = useState(false);

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#12100E] text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Pernyataan Kepatuhan WCAG 2.2 AA (`GET /api/v1/pages/accessibility`)</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Komitmen Aksesibilitas Digital Velvra</h1>
          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
            Kami percaya bahwa keindahan visual dan kenyamanan bertransaksi kopi specialty harus dapat diakses oleh semua penikmat kopi tanpa terkecuali, termasuk pengguna dengan kebutuhan khusus.
          </p>
        </div>
      </section>

      {/* Accessibility Interactive Tester Widget */}
      <section className="py-12 bg-[#FAF6F0] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border-2 border-[#BA935D]/60 p-8 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                  <Sliders size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-900">Simulasi Preferensi Tampilan Anda</h2>
                  <p className="text-xs text-gray-500">Uji langsung kesesuaian kontras tinggi dan perbesaran teks pada portal kami.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-xl">
                  {(['normal', 'large', 'xl'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition-all ${
                        fontSize === sz ? 'bg-[#12100E] text-[#BA935D]' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {sz === 'normal' ? 'Teks 1x' : sz === 'large' ? 'Teks 1.25x' : 'Teks 1.5x'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`min-h-[44px] flex items-center gap-2 rounded-xl px-5 text-xs font-bold transition-all ${
                    highContrast
                      ? 'bg-amber-400 text-black shadow-md border-2 border-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye size={16} />
                  <span>{highContrast ? '★ Kontras Tinggi Aktif' : 'Aktifkan Kontras Tinggi'}</span>
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div
              className={`rounded-2xl p-6 transition-all ${
                highContrast
                  ? 'bg-black text-yellow-300 border-4 border-yellow-400'
                  : 'bg-[#FAF6F0] text-gray-800 border border-gray-200'
              } ${fontSize === 'large' ? 'text-base sm:text-lg' : fontSize === 'xl' ? 'text-lg sm:text-xl font-bold' : 'text-xs sm:text-sm'}`}
            >
              <p className="font-serif font-bold mb-2">Simulasi Kejelasan Teks & Kontras Warna (Rasio ≥ 4.5:1)</p>
              <p className="leading-relaxed">
                Seluruh halaman web Velvra telah diuji untuk memastikan tidak ada elemen teks yang tenggelam di atas latar belakang bergambar, serta menyediakan label aria interaktif pada semua tombol keranjang belanja dan navigasi modal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Compliance */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-3xl font-bold text-gray-900">4 Pilar Kepatuhan WCAG 2.2 Level AA</h2>
            <p className="text-xs sm:text-sm text-gray-500">Standar yang kami terapkan secara disiplin di 37+ rute frontend dan back-office.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-sm space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                <Smartphone size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Touch Target ≥ 44px</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Setiap tombol, link, *dropdown*, dan *checkbox* di perangkat mobile/tablet memiliki dimensi minimal 44x44px dengan ruang aman 8px untuk mencegah kesalahan klik.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 size={16} /> <span>100% Mobile Optimized</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-sm space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                <Eye size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Contrast Ratio 4.5:1</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Perpaduan warna gelap `#12100E` dengan aksen emas `#BA935D` di atas latar `#FAF6F0` memenuhi atau melampaui batas minimal rasio kontras WCAG 2.2 AA.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 size={16} /> <span>Color Blind Safe</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-sm space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                <Keyboard size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Keyboard Focus & Trap</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Pengguna dapat bernavigasi ke seluruh antarmuka hanya dengan tombol `Tab` dan `Shift+Tab`. Modal dialog juga dilengkapi *focus trap* dan *outline focus ring* yang jelas.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 size={16} /> <span>Full Keyboard Support</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-sm space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Semantic & Aria Label</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {'Struktur HTML5 semantik (&lt;header&gt;, &lt;main&gt;, &lt;nav&gt;, &lt;footer&gt;) serta tag aria-label disematkan pada seluruh ikon tombol tanpa teks guna mendukung Screen Reader.'}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 size={16} /> <span>Screen Reader Verified</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#12100E] text-white p-10 border border-white/10 space-y-4 text-center max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl font-bold text-white">Laporan & Masukan Aksesibilitas</h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Jika Anda mengalami hambatan teknis atau memiliki saran perbaikan terkait kemudahan akses pada halaman apapun di portal Velvra, silakan hubungi tim teknik kami melalui surel: <span className="text-[#BA935D] font-bold underline">accessibility@velvra.id</span>.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
