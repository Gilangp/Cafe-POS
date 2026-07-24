'use client';

import * as React from 'react';
import Image from 'next/image';
import { Award, Heart, Coffee, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useLanguage } from '@/shared/providers/language-context';

export interface AboutUsItem {
  id: string | number;
  title: string;
  description?: string;
  image_url?: string;
  points?: string[] | string;
}

const defaultAboutData: AboutUsItem[] = [
  {
    id: 1,
    title: 'Kisah Dibalik Setiap Racikan Autentik',
    description:
      'NEMU Space berawal dari kecintaan kami pada kekayaan rasa kopi nusantara. Kami percaya bahwa setiap cangkir kopi specialty memiliki jiwa dan cerita yang layak dinikmati dengan suasana yang mendukung kreativitas dan kebersamaan.',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    points: [
      '100% Biji Kopi Specialty Single-Origin pilihan terbaik nusantara',
      'Roasting presisi oleh kurator dan roaster bersertifikasi internasional',
      'Pelayanan slow-bar yang ramah dan interaktif bagi setiap penikmat kopi',
      'Desain ruang bernuansa artistik, nyaman, dan mendukung produktivitas',
    ],
  },
];

export function AboutSection({ aboutData }: { aboutData?: AboutUsItem[] }) {
  const { t } = useLanguage();
  const defaultAboutData: AboutUsItem[] = [
    {
      id: 1,
      title: t.landing.about.defaultItem.title,
      description: t.landing.about.defaultItem.description,
      image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      points: t.landing.about.points,
    },
  ];
  
  const item = aboutData && aboutData.length > 0 ? aboutData[0] : defaultAboutData[0];
  const pointsList =
    Array.isArray(item.points)
      ? item.points
      : typeof item.points === 'string'
      ? item.points.split('\n').filter(Boolean)
      : defaultAboutData[0].points;

  return (
    <section id="about" className="py-24 sm:py-32 bg-[#FAF3E7] dark:bg-[#14201A] overflow-hidden relative">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#C89B5C]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12 items-center">
          {/* Left Column: Polaroid Collage */}
          <div className="lg:col-span-6 relative min-h-[460px] sm:min-h-[540px] flex items-center justify-center">
            {/* Polaroid 1 (Top Right) */}
            <div className="absolute top-4 right-4 sm:right-12 w-52 sm:w-64 bg-white dark:bg-[#1E2B24] p-3 rounded-2xl shadow-xl border border-[#E4D9C4] dark:border-[#33413A] rotate-[5deg] z-10 transition-transform duration-500 hover:rotate-0 hover:scale-105 hover:z-30">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#FAF3E7]">
                <Image
                  src={item.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'}
                  alt="Specialty Roasting"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-3 text-center">
                <span className="font-heading text-xs sm:text-sm font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                  {t.landing.about.polaroid1}
                </span>
              </div>
            </div>

            {/* Polaroid 2 (Bottom Left) */}
            <div className="absolute bottom-6 left-2 sm:left-8 w-56 sm:w-68 bg-white dark:bg-[#1E2B24] p-3.5 rounded-2xl shadow-2xl border border-[#E4D9C4] dark:border-[#33413A] rotate-[-6deg] z-20 transition-transform duration-500 hover:rotate-0 hover:scale-105 hover:z-30">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FAF3E7]">
                <Image
                  src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80"
                  alt="Slow Bar Experience"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-3.5 text-center">
                <span className="font-heading text-sm sm:text-base font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                  {t.landing.about.polaroid2}
                </span>
              </div>
            </div>

            {/* Badge Floating */}
            <div className="absolute -bottom-2 right-10 z-30 bg-[#1E3D31] text-white p-5 rounded-3xl shadow-2xl border border-[#C89B5C]/50 flex items-center gap-3 animate-bounce sm:animate-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C89B5C] text-[#1E3D31]">
                <Award size={26} />
              </div>
              <div>
                <span className="block font-heading text-xl font-bold text-[#C89B5C]">{t.landing.about.badgeTitle}</span>
                <span className="text-xs uppercase tracking-wider text-white/90">{t.landing.about.badgeDesc}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Value Propositions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C89B5C] bg-[#C89B5C]/15 px-3 py-1 rounded-full">
                <Coffee size={14} />
                <span>{t.landing.about.badge}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E3D31] dark:text-[#F5EFE6] leading-tight">
                {item.title}
              </h2>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-[#5C5348] dark:text-[#B8A99A]">
              {item.description}
            </p>

            {pointsList && Array.isArray(pointsList) && (
              <ul className="space-y-3.5 pt-2">
                {pointsList.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E3D31] text-[#C89B5C]">
                      <ShieldCheck size={14} />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1E3D31] dark:text-[#F5EFE6] leading-relaxed">
                      {pt}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-6 flex flex-wrap items-center gap-6 border-t border-[#E4D9C4] dark:border-[#33413A]">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-[#1E3D31] flex items-center justify-center text-xs font-bold text-[#C89B5C]">
                    Q
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-[#C89B5C] flex items-center justify-center text-xs font-bold text-[#1E3D31]">
                    R
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-[#6F4E37] flex items-center justify-center text-xs font-bold text-white">
                    B
                  </div>
                </div>
                <div className="text-xs">
                  <span className="block font-bold text-[#1E3D31] dark:text-[#F5EFE6]">{t.landing.about.certification}</span>
                  <span className="text-[#5C5348] dark:text-[#B8A99A]">{t.landing.about.certDesc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}