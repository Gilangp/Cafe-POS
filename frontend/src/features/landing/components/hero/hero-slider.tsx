'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Coffee } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';
import { useLanguage } from '@/shared/providers/language-context';

export interface HeroBannerData {
  id: string | number;
  title: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
}

const defaultBanners: HeroBannerData[] = [
  {
    id: 1,
    title: 'HANDCRAFTED SPECIALTY CURATIONS',
    subtitle: 'Menghadirkan esensi biji kopi nusantara grade-A dengan teknik sangrai presisi dan sentuhan slow-bar berkelas artistik.',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80',
    cta_text: 'Pesan Sekarang',
    cta_link: '/order',
  },
  {
    id: 2,
    title: 'ARTISANAL BREW & CREATIVE LOUNGE',
    subtitle: 'Ruang kolaborasi inspiratif bagi para kreator, pecinta kopi, dan penikmat kenyamanan estetik di tengah kota.',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    cta_text: 'Reservasi Meja',
    cta_link: '/reservasi',
  },
  {
    id: 3,
    title: 'SINGLE ORIGIN SEASONAL RELEASE',
    subtitle: 'Nikmati batch terbatas dari dataran tinggi Aceh Gayo, Kintamani, hingga Toraja Sapan dengan tasting notes yang memikat.',
    image_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1920&q=80',
    cta_text: 'Eksplorasi Katalog',
    cta_link: '/menu',
  },
];

export function HeroSlider({ banners }: { banners?: HeroBannerData[] }) {
  const { t } = useLanguage();
  const activeBanners = banners && banners.length > 0 ? banners : t.landing.hero.defaultBanners.map((b, i) => ({ id: i + 1, ...b }));
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <section className="relative w-full h-[85vh] min-h-[620px] max-h-[880px] overflow-hidden bg-[#1E3D31]">
      {/* Background Slides */}
      {activeBanners.map((banner, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            )}
          >
            {/* Image & Gradient Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out scale-105"
              style={{
                backgroundImage: `url('${banner.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80'}')`,
                transform: isActive ? 'scale(1)' : 'scale(1.08)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#14201A]/95 via-[#1E3D31]/80 to-[#14201A]/60" />

            {/* Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start pt-16 sm:pt-20">
              <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C89B5C]/40 bg-[#C89B5C]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C89B5C] backdrop-blur-md">
                  <Sparkles size={14} />
                  <span>{t.landing.hero.badge}</span>
                </div>

                <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-md">
                  {banner.title}
                </h1>

                {banner.subtitle && (
                  <p className="text-base sm:text-lg lg:text-xl text-[#FAF3E7]/90 leading-relaxed max-w-2xl font-light">
                    {banner.subtitle}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link href={banner.cta_link || '/order'}>
                    <Button variant="gold" size="lg" className="h-14 px-8 rounded-2xl text-base font-bold shadow-xl gap-3">
                      <span>{banner.cta_text || t.landing.hero.btnOrder}</span>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="/reservasi">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 rounded-2xl text-base font-semibold border-white/30 text-white hover:bg-white/10 hover:border-white gap-2 backdrop-blur-sm"
                    >
                      <Coffee className="h-5 w-5 text-[#C89B5C]" />
                      <span>{t.landing.hero.btnReserve}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <div className="absolute right-6 sm:right-12 bottom-12 z-30 flex items-center gap-3">
          <button
            onClick={goToPrev}
            aria-label="Banner sebelumnya"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:border-[#C89B5C] hover:bg-[#C89B5C] hover:text-[#1E3D31] focus:outline-none focus:ring-2 focus:ring-[#C89B5C]"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={goToNext}
            aria-label="Banner selanjutnya"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:border-[#C89B5C] hover:bg-[#C89B5C] hover:text-[#1E3D31] focus:outline-none focus:ring-2 focus:ring-[#C89B5C]"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      {/* Slide Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute left-6 sm:left-12 bottom-12 z-30 flex items-center gap-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Pindah ke slide ${idx + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                idx === currentIndex ? 'w-10 bg-[#C89B5C]' : 'w-2 bg-white/40 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
