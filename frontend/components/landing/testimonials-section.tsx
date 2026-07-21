'use client';

import * as React from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TestimonialData {
  id: string | number;
  customer_name?: string;
  name?: string;
  role?: string;
  rating?: number;
  comment?: string;
  quote?: string;
  avatar_url?: string;
}

const defaultTestimonials: TestimonialData[] = [
  {
    id: 1,
    name: 'Gita Saraswati',
    role: 'Architect & Daily Regular',
    rating: 5,
    quote: 'Suasana di NEMU Space benar-benar memantik inspirasi. V60 Aceh Gayo-nya memiliki kompleksitas aroma winey terbaik yang pernah saya coba di Jakarta.',
  },
  {
    id: 2,
    name: 'Baskora Pradipta',
    role: 'Creative Director',
    rating: 5,
    quote: 'Slow-bar experience di sini luar biasa. Barista sangat berpengetahuan tinggi menjelaskan profil roasting dan asal usul biji kopi secara mendetail.',
  },
  {
    id: 3,
    name: 'Nadya Larasati',
    role: 'Coffee Enthusiast',
    rating: 5,
    quote: 'Japanese Cold Drip Kintamani mereka adalah favorit mutlak! Pelayanan ramah, pemesanan digital kasir sangat cepat, dan pastry croissant-nya selalu renyah hangat.',
  },
  {
    id: 4,
    name: 'Dimas Anggara',
    role: 'Startup Founder',
    rating: 5,
    quote: 'Tempat meeting outdoor maupun indoor yang sangat nyaman. Koneksi Wi-Fi kencang dan musik latar yang diputar sangat pas untuk fokus bekerja.',
  },
];

export function TestimonialsSection({ testimonials = defaultTestimonials }: { testimonials?: TestimonialData[] }) {
  const activeTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section id="reviews" className="py-24 sm:py-32 bg-[#FAF3E7] dark:bg-[#14201A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1E3D31] dark:text-[#C89B5C] bg-[#1E3D31]/10 dark:bg-[#C89B5C]/15 px-3.5 py-1.5 rounded-full">
            <Sparkles size={14} className="text-[#C89B5C]" />
            <span>Postcards From Our Regulars</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#1E3D31] dark:text-[#F5EFE6] leading-tight">
            Cerita & Ulasan Penikmat Kopi
          </h2>
          <p className="text-sm sm:text-base text-[#5C5348] dark:text-[#B8A99A]">
            Apa kata mereka yang telah merasakan kehangatan ruang, keramahan barista, dan autentisitas rasa di NEMU Space.
          </p>
        </div>

        {/* Testimonials Grid (Tilted Postcard Cards) */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          {activeTestimonials.map((t, idx) => {
            const rotations = ['rotate-[2deg]', 'rotate-[-3deg]', 'rotate-[4deg]', 'rotate-[-2deg]'];
            const rot = rotations[idx % rotations.length];

            const name = t.customer_name || t.name || 'Pelanggan Setia';
            const quoteText = t.comment || t.quote || 'Pengalaman kopi yang luar biasa!';
            const rating = t.rating || 5;

            return (
              <div
                key={t.id}
                className={cn(
                  'group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-[#1E2B24] p-6 sm:p-7 shadow-xl border border-[#E4D9C4] dark:border-[#33413A] transition-all duration-300 hover:rotate-0 hover:-translate-y-2 hover:shadow-2xl hover:border-[#C89B5C]/60',
                  rot
                )}
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-6 text-[#E4D9C4]/40 dark:text-[#33413A] group-hover:text-[#C89B5C]/30 transition-colors pointer-events-none">
                  <Quote size={40} />
                </div>

                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1 text-[#C89B5C]">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={15} className="fill-[#C89B5C] text-[#C89B5C]" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="font-sans text-sm sm:text-base leading-relaxed text-[#1E3D31] dark:text-[#F5EFE6]/90 italic relative z-10">
                    &quot;{quoteText}&quot;
                  </p>
                </div>

                {/* Author Footer */}
                <div className="mt-8 pt-4 border-t border-[#E4D9C4]/60 dark:border-[#33413A] flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#1E3D31] dark:text-[#F5EFE6]">{name}</h4>
                    {t.role && (
                      <span className="text-[11px] uppercase tracking-wider text-[#5C5348] dark:text-[#B8A99A] font-medium">
                        {t.role}
                      </span>
                    )}
                  </div>
                  {/* Stamp Graphic */}
                  <div className="h-9 w-9 rounded-full border-2 border-[#1E3D31]/30 dark:border-[#C89B5C]/40 flex items-center justify-center font-heading text-[11px] text-[#1E3D31] dark:text-[#C89B5C] font-bold rotate-12">
                    NEMU
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
