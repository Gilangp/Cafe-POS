'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MenuData {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  price: number | string;
  image_url?: string;
  status?: string;
  is_best_seller?: boolean;
  category?: {
    id?: string | number;
    name?: string;
  };
}

const defaultBestSellers: MenuData[] = [
  {
    id: 1,
    name: 'Gayo Wine Process Specialty',
    slug: 'gayo-wine-process',
    description: 'Biji tunggal Aceh Gayo dengan fermentasi wine natural. Tasting notes: Red berry, dark chocolate, dan sweet grape finish.',
    price: 45000,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
    category: { name: 'Single Origin' },
  },
  {
    id: 2,
    name: 'NEMU Signature Velvet Latte',
    slug: 'nemu-signature-velvet-latte',
    description: 'Espresso double Ristretto dipadukan dengan rahasia susu evaporasi krim up-steam dan house-made organic vanilla bean.',
    price: 38000,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
    category: { name: 'Signature Brews' },
  },
  {
    id: 3,
    name: 'Japanese Cold Drip Kintamani',
    slug: 'japanese-cold-drip-kintamani',
    description: 'Ekstraksi dingin 12 jam biji Kintamani Bali. Segar dengan karakter jeruk bali tropis dan keasaman berkelas tinggi.',
    price: 42000,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
    category: { name: 'Cold Brews' },
  },
  {
    id: 4,
    name: 'Almond Butter Croissant Toast',
    slug: 'almond-butter-croissant',
    description: 'Croissant panggang mentega Prancis dengan lapisan krim almond panggang renyah dan taburan gula bubuk halus.',
    price: 35000,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
    category: { name: 'Fresh Pastry' },
  },
];

export function BaristaRecommendsSection({ menus = defaultBestSellers }: { menus?: MenuData[] }) {
  const activeMenus = menus && menus.length > 0 ? menus : defaultBestSellers;

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <section className="py-24 sm:py-32 bg-[#FAF3E7] dark:bg-[#1A2620] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#E4D9C4] dark:border-[#33413A]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1E3D31] dark:text-[#C89B5C] bg-[#1E3D31]/10 dark:bg-[#C89B5C]/15 px-3.5 py-1.5 rounded-full">
              <Sparkles size={14} className="text-[#C89B5C]" />
              <span>Barista Recommends</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#1E3D31] dark:text-[#F5EFE6] leading-tight">
              Koleksi Favorit Pilihan Kurator
            </h2>
            <p className="text-sm sm:text-base text-[#5C5348] dark:text-[#B8A99A] leading-relaxed">
              Daftar menu dengan permintaan tertinggi dan ulasan terbaik dari pelanggan setia kami. Dipersiapkan segar setiap hari dengan konsistensi rasa sempurna.
            </p>
          </div>

          <Link href="/menu">
            <Button variant="primary" className="rounded-xl font-bold gap-2 shadow-md">
              <span>Lihat Semua Menu</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-12">
          {activeMenus.map((menu) => (
            <Card
              key={menu.id}
              variant="interactive"
              className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A]"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF3E7] dark:bg-[#14201A]">
                  <Image
                    src={
                      menu.image_url ||
                      'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={menu.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <Badge variant="bestseller" className="px-3 py-1 shadow-md text-xs">
                      Best Seller
                    </Badge>
                  </div>
                  {menu.category?.name && (
                    <span className="absolute bottom-3 left-3 z-10 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {menu.category.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <h3 className="font-heading text-lg font-bold text-[#1E3D31] dark:text-[#F5EFE6] group-hover:text-[#C89B5C] transition-colors line-clamp-1">
                    {menu.name}
                  </h3>
                  <p className="text-xs text-[#5C5348] dark:text-[#B8A99A] leading-relaxed line-clamp-2 min-h-[36px]">
                    {menu.description || 'Menu pilihan bernuansa rasa khas NEMU Space dengan standar penyajian tertinggi.'}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#E4D9C4]/40 dark:border-[#33413A]/40 mt-3 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-[#5C5348] dark:text-[#B8A99A] font-semibold">Harga</span>
                  <span className="font-heading text-lg font-extrabold text-[#1E3D31] dark:text-[#C89B5C]">
                    {formatPrice(menu.price)}
                  </span>
                </div>

                <Link href={`/menu/${menu.slug || menu.id}`}>
                  <Button size="sm" variant="gold" className="rounded-xl px-4 gap-1.5 font-bold shadow-sm">
                    <ShoppingBag size={14} />
                    <span>Pesan</span>
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
