'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { Coffee, Search, Filter, ShoppingBag, Check, ArrowRight, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/shared/api/axios';

export interface CategoryItem {
  id: string | number;
  name: string;
  slug?: string;
  menus_count?: number;
}

export interface MenuItem {
  id: string | number;
  name: string;
  slug?: string;
  category_id?: string | number;
  category?: {
    id?: string | number;
    name?: string;
  };
  price: number | string;
  description?: string;
  image_url?: string;
  status?: string;
  is_best_seller?: boolean;
}

const fallbackCategories: CategoryItem[] = [
  { id: 'all', name: 'Semua Menu', menus_count: 8 },
  { id: 1, name: 'Single Origin & Manual Brew', menus_count: 2 },
  { id: 2, name: 'Signature Espresso Brews', menus_count: 3 },
  { id: 3, name: 'Artisan Tea & Tisane', menus_count: 1 },
  { id: 4, name: 'Fresh Pastry & Croissant', menus_count: 2 },
];

const fallbackMenus: MenuItem[] = [
  {
    id: 101,
    name: 'Gayo Wine Process Specialty',
    category_id: 1,
    category: { name: 'Single Origin & Manual Brew' },
    price: 45000,
    description: 'Biji tunggal Aceh Gayo dengan fermentasi wine natural. Tasting notes: Red berry, dark chocolate, dan sweet grape finish.',
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
  },
  {
    id: 102,
    name: 'NEMU Signature Velvet Latte',
    category_id: 2,
    category: { name: 'Signature Espresso Brews' },
    price: 38000,
    description: 'Espresso double Ristretto dipadukan dengan rahasia susu evaporasi krim up-steam dan house-made organic vanilla bean.',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
  },
  {
    id: 103,
    name: 'Japanese Cold Drip Kintamani',
    category_id: 1,
    category: { name: 'Single Origin & Manual Brew' },
    price: 42000,
    description: 'Ekstraksi dingin 12 jam biji Kintamani Bali. Segar dengan karakter jeruk bali tropis dan keasaman berkelas tinggi.',
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
  },
  {
    id: 104,
    name: 'Almond Butter Croissant Toast',
    category_id: 4,
    category: { name: 'Fresh Pastry & Croissant' },
    price: 35000,
    description: 'Croissant panggang mentega Prancis dengan lapisan krim almond panggang renyah dan taburan gula bubuk halus.',
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: true,
  },
  {
    id: 105,
    name: 'Caramel Sea Salt Macchiato',
    category_id: 2,
    category: { name: 'Signature Espresso Brews' },
    price: 40000,
    description: 'Perpaduan espresso kental, susu segar berbusa lembut, saus karamel artisan house-made, dan sejumput garam laut Bali.',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: false,
  },
  {
    id: 106,
    name: 'Oat Milk Golden Latte',
    category_id: 2,
    category: { name: 'Signature Espresso Brews' },
    price: 46000,
    description: 'Oat milk nabati organik dipadukan dengan espresso double shot dan ekstrak kunyit madu hangat kaya antioksidan.',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: false,
  },
  {
    id: 107,
    name: 'Chamomile Organic Sleep Tisane',
    category_id: 3,
    category: { name: 'Artisan Tea & Tisane' },
    price: 35000,
    description: 'Bunga chamomile organik utuh diseduh dengan suhu 85°C demi memberikan ketenangan tubuh dan aroma herbal menenangkan.',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: false,
  },
  {
    id: 108,
    name: 'Valrhona Dark Chocolate Brownie',
    category_id: 4,
    category: { name: 'Fresh Pastry & Croissant' },
    price: 38000,
    description: 'Brownie padat kenyal dengan 70% dark chocolate Valrhona Prancis dan cincangan kacang kenari renyah.',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    status: 'tersedia',
    is_best_seller: false,
  },
];

export default function MenuPage() {
  const [categories, setCategories] = React.useState<CategoryItem[]>(fallbackCategories);
  const [menus, setMenus] = React.useState<MenuItem[]>(fallbackMenus);
  const [loading, setLoading] = React.useState(true);

  // Filters state
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | number>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [onlyBestSeller, setOnlyBestSeller] = React.useState(false);

  React.useEffect(() => {
    async function fetchMenuData() {
      try {
        const [catRes, menuRes] = await Promise.allSettled([
          api.fetch<any>('/categories'),
          api.fetch<any>('/menus'),
        ]);

        if (catRes.status === 'fulfilled' && (catRes.value as any)?.success && (catRes.value as any).data?.length > 0) {
          setCategories([{ id: 'all', name: 'Semua Menu', menus_count: menuRes.status === 'fulfilled' && (menuRes.value as any)?.data ? (menuRes.value as any).data.length : fallbackMenus.length }, ...(catRes.value as any).data]);
        }

        if (menuRes.status === 'fulfilled' && (menuRes.value as any)?.success && (menuRes.value as any).data?.length > 0) {
          setMenus((menuRes.value as any).data);
        }
      } catch (err) {
        console.error('Failed to load dynamic menu data, using crisp fallbacks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuData();
  }, []);

  const filteredMenus = React.useMemo(() => {
    return menus.filter((item) => {
      const matchCategory =
        activeCategoryId === 'all' ||
        String(item.category_id) === String(activeCategoryId) ||
        String(item.category?.id) === String(activeCategoryId);
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchBestSeller = !onlyBestSeller || item.is_best_seller;

      return matchCategory && matchSearch && matchBestSeller;
    });
  }, [menus, activeCategoryId, searchQuery, onlyBestSeller]);

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
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#1E3D31] text-white py-16 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 rounded-full bg-[#C89B5C]/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C89B5C] bg-[#C89B5C]/15 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span>Katalog Menu & Curations</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Koleksi Kopi & Hidangan
            </h1>
            <p className="text-sm sm:text-base text-[#FAF3E7]/80 leading-relaxed font-light">
              Seluruh sajian dikurasi dengan presisi rasa, menggunakan bahan baku organik terbaik dan disajikan segar oleh barista kami.
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar Sticky */}
      <section className="bg-[#FAF3E7] dark:bg-[#14201A] py-6 border-b border-[#E4D9C4] dark:border-[#33413A] sticky top-16 z-40 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((cat) => {
                const isActive = String(activeCategoryId) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`min-h-[44px] rounded-2xl px-5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#1E3D31] text-[#C89B5C] shadow-md dark:bg-[#C89B5C] dark:text-[#1E3D31]'
                        : 'bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] text-[#5C5348] dark:text-[#B8A99A] hover:border-[#1E3D31] dark:hover:border-white/40'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.menus_count !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-[#C89B5C]/20 text-[#C89B5C] dark:bg-[#1E3D31]/20 dark:text-[#1E3D31]' : 'bg-[#FAF3E7] dark:bg-[#14201A] text-[#5C5348]'
                        }`}
                      >
                        {cat.menus_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Best Seller Toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C5348] dark:text-[#B8A99A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama menu atau rasa..."
                  className="h-11 w-full rounded-xl border border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] py-2 pl-10 pr-9 text-xs font-medium text-[#1E3D31] dark:text-[#F5EFE6] focus:border-[#1E3D31] dark:focus:border-[#C89B5C] focus:outline-none focus:ring-1 focus:ring-[#1E3D31]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5348] hover:text-[#1E3D31]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setOnlyBestSeller(!onlyBestSeller)}
                className={`h-11 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border shrink-0 ${
                  onlyBestSeller
                    ? 'bg-[#C89B5C] text-[#1E3D31] border-[#C89B5C] shadow-sm'
                    : 'bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] text-[#5C5348] dark:text-[#B8A99A] hover:border-[#C89B5C]'
                }`}
              >
                {onlyBestSeller && <Check size={14} />}
                <span>Best Seller</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Grid Content */}
      <section className="py-16 bg-[#FAF3E7] dark:bg-[#14201A] min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E4D9C4]/60 dark:border-[#33413A]">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
              {categories.find((c) => String(c.id) === String(activeCategoryId))?.name || 'Semua Menu'} ·{' '}
              <span className="text-sm font-sans font-normal text-[#5C5348] dark:text-[#B8A99A]">
                {filteredMenus.length} hidangan ditemukan
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-96 rounded-3xl bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A]" />
              ))}
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] p-16 text-center space-y-4 max-w-xl mx-auto">
              <Coffee size={52} className="text-[#C89B5C] mx-auto animate-bounce" />
              <h3 className="font-heading text-2xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                Tidak Ada Menu Sesuai Filter
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5348] dark:text-[#B8A99A]">
                Coba ubah kata kunci pencarian Anda atau nonaktifkan filter Best Seller untuk melihat pilihan lainnya.
              </p>
              <Button
                onClick={() => {
                  setActiveCategoryId('all');
                  setSearchQuery('');
                  setOnlyBestSeller(false);
                }}
                variant="outline"
                className="rounded-xl mt-2"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
              {filteredMenus.map((item) => (
                <Card
                  key={item.id}
                  variant="interactive"
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A]"
                >
                  <div>
                    {/* Thumbnail Image & Badges */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF3E7]">
                      <Image
                        src={
                          item.image_url ||
                          'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                        {item.is_best_seller && (
                          <Badge variant="bestseller" className="px-3 py-1 shadow-md text-xs">
                            Best Seller
                          </Badge>
                        )}
                      </div>
                      {item.category?.name && (
                        <span className="absolute bottom-3 left-3 z-10 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                          {item.category.name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-heading text-lg font-bold text-[#1E3D31] dark:text-[#F5EFE6] group-hover:text-[#C89B5C] transition-colors leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#5C5348] dark:text-[#B8A99A] leading-relaxed line-clamp-3 min-h-[48px]">
                        {item.description || 'Sajian dengan cita rasa otentik dan aroma yang memikat.'}
                      </p>
                    </div>
                  </div>

                  {/* Price Footer */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-[#E4D9C4]/40 dark:border-[#33413A]/40 mt-4 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-[#5C5348] dark:text-[#B8A99A]">Harga</span>
                      <span className="font-heading text-lg font-extrabold text-[#1E3D31] dark:text-[#C89B5C]">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
