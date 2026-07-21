'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryData {
  id: string | number;
  name: string;
  description?: string;
  image_url?: string;
  slug?: string;
  menus_count?: number;
}

const defaultCategories: CategoryData[] = [
  {
    id: 1,
    name: 'Single Origin & Manual Brew',
    description: 'Seduhan V60, Japanese Iced, dan Aeropress dari biji kopi grade-A pilihan.',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    slug: 'manual-brew',
    menus_count: 12,
  },
  {
    id: 2,
    name: 'Signature Espresso Brews',
    description: 'Racikan espresso blend eksklusif dengan krimi susu segar dan sirup artisan.',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    slug: 'espresso-brews',
    menus_count: 16,
  },
  {
    id: 3,
    name: 'Artisan Tea & Tisane',
    description: 'Koleksi teh organik chamomile, earl grey, dan matcha ceremonial grade.',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    slug: 'artisan-tea',
    menus_count: 8,
  },
  {
    id: 4,
    name: 'Fresh Pastry & Croissant',
    description: 'Roti bakar artisan, butter croissant, dan hidangan pendamping baru matang.',
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    slug: 'pastry-bakery',
    menus_count: 14,
  },
];

export function CurationsSection({ categories = defaultCategories }: { categories?: CategoryData[] }) {
  const activeCategories = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="py-24 sm:py-32 bg-[#14201A] text-white relative overflow-hidden">
      {/* Coffee Bean Texture & Radial Gradient Overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#C89B5C_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] rounded-full bg-[#1E3D31]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] rounded-full bg-[#C89B5C]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C89B5C] bg-[#C89B5C]/15 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Sparkles size={14} />
              <span>Handcrafted Curations</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Eksplorasi Kategori Rasa
            </h2>
            <p className="text-sm sm:text-base text-[#FAF3E7]/80 leading-relaxed font-light">
              Setiap kategori kami dirancang untuk menghadirkan pengalaman sensorik yang unik, dari intensitas espresso hingga ketenangan seduhan daun teh pilihan.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C89B5C] hover:text-white transition-colors group"
          >
            <span>Lihat Seluruh Katalog</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Circular / Organic Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-16">
          {activeCategories.map((cat, idx) => {
            // Give every item a slightly unique organic border-radius shape
            const shapes = [
              'rounded-[40%_60%_70%_30%/40%_50%_60%_50%]',
              'rounded-[60%_40%_30%_70%/60%_30%_70%_40%]',
              'rounded-[50%_50%_40%_60%/40%_60%_50%_60%]',
              'rounded-[35%_65%_60%_40%/50%_40%_60%_50%]',
            ];
            const shapeClass = shapes[idx % shapes.length];

            return (
              <Link
                key={cat.id}
                href={`/menu?category_id=${cat.id}`}
                className="group flex flex-col items-center text-center space-y-5 p-6 rounded-3xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                {/* Organic Circular Image Container */}
                <div className="relative w-48 h-48 sm:w-52 sm:h-52 mx-auto p-2 bg-gradient-to-br from-[#C89B5C]/40 to-transparent transition-all duration-500 group-hover:scale-105 shadow-2xl rounded-full">
                  <div
                    className={cn(
                      'relative w-full h-full overflow-hidden transition-transform duration-500 group-hover:rotate-3 shadow-inner bg-[#1E3D31]',
                      shapeClass
                    )}
                  >
                    <Image
                      src={
                        cat.image_url ||
                        'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14201A]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  </div>

                  {cat.menus_count !== undefined && (
                    <span className="absolute bottom-2 right-4 bg-[#C89B5C] text-[#1E3D31] text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                      {cat.menus_count} Menu
                    </span>
                  )}
                </div>

                {/* Text Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-[#C89B5C] transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-[#FAF3E7]/70 leading-relaxed max-w-xs mx-auto line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
