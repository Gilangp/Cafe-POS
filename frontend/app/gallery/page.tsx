'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/public-layout';
import { Image as ImageIcon, Sparkles, Filter, Eye, X, Coffee, MapPin, Calendar } from 'lucide-react';

interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Roastery & Slow-Bar' | 'Latte Art' | 'Artisan Pastry' | 'Lounge Ambiance';
  branch: string;
  desc: string;
  gradient: string;
}

const PHOTOS: GalleryPhoto[] = [
  {
    id: 'GAL-01',
    title: 'Mesin Sangrai Loring S35 Kestrel',
    category: 'Roastery & Slow-Bar',
    branch: 'Sudirman Roastery',
    desc: 'Teknologi single-burner convection roasting yang mengurangi emisi CO2 hingga 80% dan mengunci kejernihan rasa gula alami.',
    gradient: 'from-amber-900 via-[#12100E] to-stone-900',
  },
  {
    id: 'GAL-02',
    title: 'Rosetta Tulip 6-Layer Golden Pour',
    category: 'Latte Art',
    branch: 'Kemang Artisan Bar',
    desc: 'Ekstrak espresso crema tebal berpadu dengan microfoam susu oat nabati bersuhu presisi 60°C.',
    gradient: 'from-stone-800 via-amber-950 to-[#12100E]',
  },
  {
    id: 'GAL-03',
    title: 'French Butter Croissant 27 Layers',
    category: 'Artisan Pastry',
    branch: 'Sudirman Flagship Lounge',
    desc: 'Tekstur honeycomb renyah beraroma mentega gurih yang baru keluar dari oven batu setiap pagi.',
    gradient: 'from-yellow-950 via-stone-900 to-[#12100E]',
  },
  {
    id: 'GAL-04',
    title: 'Slow-Bar Manual Brew V60 Copper Station',
    category: 'Roastery & Slow-Bar',
    branch: 'Senayan City Lounge',
    desc: 'Kettle leher angsa kuningan dan timbangan digital akurasi 0.1g untuk penyeduhan tuang bertahap (*pulse pouring*).',
    gradient: 'from-[#12100E] via-amber-900/80 to-stone-900',
  },
  {
    id: 'GAL-05',
    title: 'VIP Meeting Room & Executive Lounge',
    category: 'Lounge Ambiance',
    branch: 'Sudirman Flagship Lounge',
    desc: 'Ruang privat kedap suara dengan kapasitas 12 orang, dilengkapi proyektor 4K dan layanan table-service khusus.',
    gradient: 'from-stone-900 via-[#12100E] to-stone-800',
  },
  {
    id: 'GAL-06',
    title: 'Sesi Cupping Bulanan Bersama Q-Grader',
    category: 'Roastery & Slow-Bar',
    branch: 'Kemang Artisan Bar',
    desc: 'Mencicipi 10 sampel panen terbaru dari dataran tinggi Flores Bajawa dan Bali Kintamani.',
    gradient: 'from-amber-950 via-stone-900 to-[#12100E]',
  },
];

const GALL_CATEGORIES = ['Semua Foto', 'Roastery & Slow-Bar', 'Latte Art', 'Artisan Pastry', 'Lounge Ambiance'];

export default function GalleryPage() {
  const [activeCat, setActiveCat] = useState('Semua Foto');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const filteredPhotos = PHOTOS.filter((p) => activeCat === 'Semua Foto' || p.category === activeCat);

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#12100E] text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Galeri Visual (`GET /api/v1/pages/gallery`)</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Potret Keindahan Kopi & Lounge</h1>
          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
            Menangkap detik demi detik keharuman proses sangrai, ketelitian ekstraksi espresso, serta kemewahan arsitektur interior di seluruh cabang Velvra.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-[#FAF6F0] py-8 border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {GALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`min-h-[44px] rounded-xl px-6 text-xs font-bold transition-all shrink-0 ${
                  activeCat === cat
                    ? 'bg-[#12100E] text-[#BA935D] shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-2xl hover:border-[#BA935D] cursor-pointer aspect-[4/3] flex flex-col justify-end p-6"
              >
                {/* Simulated High-Res Photo Gradient Frame */}
                <div className={`absolute inset-0 bg-gradient-to-br ${photo.gradient} transition-transform duration-700 group-hover:scale-105`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/60 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />

                <div className="relative z-10 space-y-2 text-white">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#BA935D] text-[#12100E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {photo.category}
                    </span>
                    <span className="text-[11px] text-white/80 flex items-center gap-1 font-medium">
                      <MapPin size={12} className="text-[#BA935D]" /> {photo.branch}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#BA935D] transition-colors leading-tight">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-2">{photo.desc}</p>
                </div>

                <div className="absolute top-5 right-5 h-10 w-10 rounded-full bg-black/40 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                  <Eye size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-4xl bg-[#12100E] border-2 border-[#BA935D] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[85vh]">
            <div className={`flex-1 min-h-[320px] lg:min-h-full bg-gradient-to-br ${activePhoto.gradient} relative flex items-center justify-center p-8`}>
              <div className="text-center space-y-3">
                <Coffee size={64} className="text-[#BA935D]/50 mx-auto animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/60 block">High Resolution Visual Frame</span>
                <span className="font-serif text-2xl font-bold text-white block">{activePhoto.title}</span>
              </div>
            </div>

            <div className="w-full lg:w-96 p-8 bg-white text-gray-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="rounded-full bg-[#12100E] text-[#BA935D] px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {activePhoto.category}
                  </span>
                  <button
                    onClick={() => setActivePhoto(null)}
                    className="min-h-[44px] min-w-[44px] rounded-full bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h3 className="font-serif text-2xl font-bold text-gray-900 leading-snug">{activePhoto.title}</h3>
                <p className="text-xs font-semibold text-[#BA935D] flex items-center gap-1.5">
                  <MapPin size={14} /> Lokasi: {activePhoto.branch}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed font-sans pt-2">{activePhoto.desc}</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => setActivePhoto(null)}
                  className="min-h-[44px] w-full rounded-2xl bg-[#12100E] text-[#BA935D] font-bold text-xs uppercase tracking-wider hover:bg-[#201d19] transition-all shadow"
                >
                  Tutup Lightbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
