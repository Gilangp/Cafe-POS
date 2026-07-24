'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { Camera, X, ZoomIn, Eye, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import Image from 'next/image';
import api from '@/shared/api/axios';

export interface GalleryItem {
  id: string | number;
  image_url?: string;
  category?: string;
  caption?: string;
  display_order?: number;
}

const fallbackGalleries: GalleryItem[] = [
  {
    id: 1,
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    category: 'Interior & Suasana',
    caption: 'Lounge utama bernuansa kayu organik dan pencahayaan hangat khas NEMU Space di tengah kota Jakarta.',
  },
  {
    id: 2,
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    category: 'Slow Bar & Roastery',
    caption: 'Proses penyeduhan V60 pour-over secara langsung oleh Q-Grader dan Barista berpengalaman kami.',
  },
  {
    id: 3,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=80',
    category: 'Specialty Menu',
    caption: 'Velvet Espresso Latte disajikan bersama French Butter Croissant yang baru matang setiap pagi.',
  },
  {
    id: 4,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
    category: 'Slow Bar & Roastery',
    caption: 'Biji kopi single-origin pilihan nusantara yang melalui proses pemanggangan presisi.',
  },
  {
    id: 5,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    category: 'Specialty Menu',
    caption: 'Hidangan pastry dan sajian pendamping yang dikurasi khusus untuk melengkapi momen santai Anda.',
  },
  {
    id: 6,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    category: 'Community & Event',
    caption: 'Suasana kebersamaan dalam kelas cupping dan manual brew workshop mingguan di NEMU Space.',
  },
];

const CATEGORIES = ['Semua Foto', 'Interior & Suasana', 'Slow Bar & Roastery', 'Specialty Menu', 'Community & Event'];

export default function GaleriPage() {
  const [galleries, setGalleries] = React.useState<GalleryItem[]>(fallbackGalleries);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState('Semua Foto');
  const [lightboxItem, setLightboxItem] = React.useState<GalleryItem | null>(null);

  React.useEffect(() => {
    async function fetchGalleries() {
      try {
        const res = await api.fetch<any>('/galleries');
        if (res.success && res.data && res.data.length > 0) {
          setGalleries(res.data);
        }
      } catch (err) {
        console.error('Failed to load dynamic galleries, using high-res fallbacks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleries();
  }, []);

  const filteredGalleries = React.useMemo(() => {
    if (activeCategory === 'Semua Foto') return galleries;
    return galleries.filter((g) => g.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [galleries, activeCategory]);

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-[#1E3D31] text-white py-16 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 rounded-full bg-[#C89B5C]/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C89B5C]/15 border border-[#C89B5C]/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C89B5C] backdrop-blur-md">
              <span>NEMU Space Visual Showcase</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Galeri Foto & Suasana
            </h1>
            <p className="text-sm sm:text-base text-[#FAF3E7]/80 leading-relaxed font-light">
              Menjelajahi setiap sudut estetika ruang, kehangatan interaksi di slow bar, hingga detail penyajian kopi specialty kami.
            </p>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-[#FAF3E7] dark:bg-[#14201A] py-6 border-b border-[#E4D9C4] dark:border-[#33413A] sticky top-16 z-40 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C] flex items-center gap-1.5 mr-2 shrink-0">
            <Filter size={14} /> Filter Galeri:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[44px] rounded-2xl px-5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#1E3D31] text-[#C89B5C] shadow-md dark:bg-[#C89B5C] dark:text-[#1E3D31]'
                    : 'bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] text-[#5C5348] dark:text-[#B8A99A] hover:border-[#1E3D31]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Masonry / Grid Container */}
      <section className="py-16 sm:py-20 bg-[#FAF3E7] dark:bg-[#14201A] min-h-[550px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredGalleries.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] p-16 text-center space-y-4 max-w-xl mx-auto">
              <Camera size={52} className="text-[#C89B5C] mx-auto animate-bounce" />
              <h3 className="font-heading text-2xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                Belum Ada Foto untuk Kategori Ini
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5348] dark:text-[#B8A99A]">
                Silakan pilih kategori &quot;Semua Foto&quot; untuk melihat koleksi galeri lainnya.
              </p>
              <Button onClick={() => setActiveCategory('Semua Foto')} variant="outline" className="rounded-xl mt-2">
                Reset Kategori
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredGalleries.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => setLightboxItem(item)}
                  className="group relative rounded-3xl overflow-hidden bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF3E7]">
                    <Image
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={item.caption || 'NEMU Space Gallery'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 space-y-2">
                      {item.category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C89B5C]">
                          {item.category}
                        </span>
                      )}
                      <p className="text-xs sm:text-sm text-white font-medium line-clamp-2 leading-relaxed">
                        {item.caption || 'Keindahan dan atmosfer autentik kopi specialty NEMU Space.'}
                      </p>
                      <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#C89B5C]">
                        <ZoomIn size={14} />
                        <span>Klik untuk Memperbesar</span>
                      </div>
                    </div>
                  </div>

                  {/* Always visible bottom caption bar for mobile/clear access */}
                  <div className="p-4 sm:p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-heading font-bold text-[#1E3D31] dark:text-[#F5EFE6] block">
                        {item.category || 'NEMU Space Moment'}
                      </span>
                      <span className="text-[11px] text-[#5C5348] dark:text-[#B8A99A] line-clamp-1 mt-0.5">
                        {item.caption || 'Specialty Roastery & Lounge'}
                      </span>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3D31]/10 dark:bg-white/10 text-[#1E3D31] dark:text-white group-hover:bg-[#C89B5C] group-hover:text-[#1E3D31] transition-colors">
                      <ZoomIn size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            aria-label="Tutup foto"
          >
            <X size={24} />
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center relative space-y-4">
            <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <Image
                src={
                  lightboxItem.image_url ||
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
                }
                alt={lightboxItem.caption || 'NEMU Space Lightbox'}
                fill
                className="object-contain"
              />
            </div>

            <div className="w-full max-w-3xl text-center space-y-2 text-white p-4">
              {lightboxItem.category && (
                <Badge variant="gold" className="px-3 py-1 text-xs uppercase font-bold">
                  {lightboxItem.category}
                </Badge>
              )}
              <p className="text-sm sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
                {lightboxItem.caption || 'Potret suasana dan proses penyeduhan kopi specialty di NEMU Space.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
