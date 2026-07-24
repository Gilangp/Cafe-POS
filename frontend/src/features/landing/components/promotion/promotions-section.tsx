'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Tag, ArrowRight, Calendar, Percent } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useLanguage } from '@/shared/providers/language-context';

export interface PromotionData {
  id: string | number;
  title: string;
  description?: string;
  banner_url?: string;
  type?: string;
  value?: number | string;
  code?: string;
  start_date?: string;
  end_date?: string;
}

const defaultPromotions: PromotionData[] = [
  {
    id: 1,
    title: 'Specialty Happy Hour 20% Off',
    description: 'Diskon 20% untuk seluruh varian Manual Brew Single Origin setiap hari Senin–Jumat pukul 13.00 - 16.00 WIB.',
    banner_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    type: 'diskon_langsung',
    value: 20,
    code: 'HAPPYBREW20',
    end_date: '2026-12-31',
  },
  {
    id: 2,
    title: 'Free Butter Croissant Pre-Tasting',
    description: 'Gratis 1 Fresh Almond/Butter Croissant untuk setiap pemesanan 2 cangkir NEMU Signature Velvet Latte.',
    banner_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    type: 'voucher',
    value: 35000,
    code: 'CROISSANTFREE',
    end_date: '2026-11-30',
  },
  {
    id: 3,
    title: 'Weekend Community Cupping Pass',
    description: 'Voucher eksklusif potongan Rp 50.000 untuk kelas cupping dan manual brew workshop setiap Sabtu & Minggu.',
    banner_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
    type: 'voucher',
    value: 50000,
    code: 'CUPPINGWEEKEND',
    end_date: '2026-12-15',
  },
];

export function PromotionsSection({ promotions }: { promotions?: PromotionData[] }) {
  const { t } = useLanguage();
  const activePromotions = promotions && promotions.length > 0 ? promotions : defaultPromotions;

  return (
    <section className="py-24 sm:py-32 bg-[#FAF3E7] dark:bg-[#14201A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#E4D9C4] dark:border-[#33413A]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1E3D31] dark:text-[#C89B5C] bg-[#1E3D31]/10 dark:bg-[#C89B5C]/15 px-3.5 py-1.5 rounded-full">
              <Tag size={14} className="text-[#C89B5C]" />
              <span>{t.landing.promotions.badge}</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#1E3D31] dark:text-[#F5EFE6] leading-tight">
              {t.landing.promotions.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5C5348] dark:text-[#B8A99A]">
              {t.landing.promotions.desc}
            </p>
          </div>

          <Link href="/menu">
            <Button variant="outline" className="rounded-xl font-bold gap-2 border-[#1E3D31] text-[#1E3D31] dark:border-white/30 dark:text-white">
              <span>{t.landing.promotions.claimBtn}</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {activePromotions.map((promo) => (
            <Card
              key={promo.id}
              variant="elevated"
              className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] hover:-translate-y-1.5 transition-all duration-300"
            >
              <div>
                {/* Banner Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#FAF3E7]">
                  <Image
                    src={
                      promo.banner_url ||
                      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={promo.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  {promo.code && (
                    <div className="absolute bottom-3 left-3 bg-[#C89B5C] text-[#1E3D31] font-heading font-extrabold text-xs px-3 py-1 rounded-xl shadow-md uppercase tracking-wider flex items-center gap-1">
                      <Tag size={12} />
                      <span>{promo.code}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="font-heading text-xl font-bold text-[#1E3D31] dark:text-[#F5EFE6] group-hover:text-[#C89B5C] transition-colors leading-snug">
                    {promo.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C5348] dark:text-[#B8A99A] leading-relaxed line-clamp-3">
                    {promo.description}
                  </p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-6 pt-0 flex items-center justify-between border-t border-[#E4D9C4]/40 dark:border-[#33413A]/40 mt-3 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-[#5C5348] dark:text-[#B8A99A]">
                  <Calendar size={14} className="text-[#C89B5C]" />
                  <span>{t.landing.promotions.validUntil} {promo.end_date ? new Date(promo.end_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Terbatas'}</span>
                </div>

                <Link href="/menu">
                  <Button size="sm" variant="gold" className="rounded-xl px-4 font-bold shadow-sm">
                    {t.landing.promotions.claimBtn}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
