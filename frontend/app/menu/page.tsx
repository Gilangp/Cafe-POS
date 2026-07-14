'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/public-layout';
import { Coffee, Search, Filter, ShoppingBag, MapPin, Sparkles, Utensils, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PublicItem {
  id: number;
  name: string;
  category: string;
  price: number;
  desc: string;
  badge?: string;
  dietary: string[];
}

const PUBLIC_ITEMS: PublicItem[] = [
  { id: 101, name: 'Velvet Espresso Single Origin', category: 'Espresso', price: 38000, desc: 'Biji Sumatra Gayo Aceh dengan kejernihan rasa buah beri hitam dan karamel.', badge: 'Signature', dietary: ['Strict Vegan', 'Dairy-Free', 'Halal Certified'] },
  { id: 102, name: 'Caramel Sea Salt Latte', category: 'Espresso', price: 48000, desc: 'Perpaduan espresso kental, susu segar berbusa lembut, saus karamel artisan, dan garam laut.', badge: 'Best Seller', dietary: ['Halal Certified'] },
  { id: 103, name: 'Oat Milk Golden Macchiato', category: 'Espresso', price: 52000, desc: 'Espresso rangkap dengan susu oat nabati organik dan taburan kayu manis murni.', badge: 'Plant-Based', dietary: ['Strict Vegan', 'Dairy-Free', 'Halal Certified'] },
  { id: 104, name: 'Signature 18-Hour Cold Brew', category: 'Cold Brew', price: 45000, desc: 'Diseduh dengan air es murni selama 18 jam demi body yang kelembutan ekstra tanpa keasaman berlebih.', badge: 'Must Try', dietary: ['Strict Vegan', 'Dairy-Free', 'Low Sugar'] },
  { id: 105, name: 'Kyoto Matcha Cloud Cream', category: 'Cold Brew', price: 50000, desc: 'Ceremonial grade matcha Jepang dengan busa krim vanila dan susu segar.', dietary: ['Halal Certified'] },
  { id: 106, name: 'French Butter Croissant', category: 'Pastry', price: 32000, desc: 'Dipanggang keemasan setiap jam 07:00 pagi dengan mentega Elle & Vire Perancis yang renyah.', badge: 'Fresh Baked', dietary: ['Halal Certified'] },
  { id: 107, name: 'Valrhona Chocolate Brownie', category: 'Pastry', price: 38000, desc: 'Brownie panggang padat dengan 70% dark chocolate Valrhona dan kacang kenari renyah.', dietary: ['Halal Certified'] },
  { id: 108, name: 'Artisan Avocado Sourdough Toast', category: 'Light Meals', price: 65000, desc: 'Roti gandum alami panggang dengan alpukat tumbuk segar, telur poach, dan biji wijen panggang.', dietary: ['Halal Certified', 'Dairy-Free'] },
];

const CATEGORIES = ['Semua Menu', 'Espresso', 'Cold Brew', 'Pastry', 'Light Meals'];
const DIETARY_FLAGS = ['Strict Vegan', 'Dairy-Free', 'Low Sugar', 'Halal Certified'];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('Semua Menu');
  const [selectedBranch, setSelectedBranch] = useState('Sudirman Flagship');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDietary, setActiveDietary] = useState<string[]>([]);

  const toggleDietaryFilter = (flag: string) => {
    setActiveDietary((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const filteredItems = PUBLIC_ITEMS.filter((item) => {
    const matchCat = activeCategory === 'Semua Menu' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDietary = activeDietary.length === 0 || activeDietary.every((d) => item.dietary.includes(d));
    return matchCat && matchSearch && matchDietary;
  });

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#12100E] text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Katalog Menu Resmi</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Racikan Kopi & Hidangan Artisan</h1>
            <p className="text-sm text-white/70 leading-relaxed">
              Jelajahi sajian kopi specialty dan hidangan pendamping (`GET /api/v1/menu/items?branch_id=...`). Harga telah disesuaikan dengan standar kafe kelas atas.
            </p>
          </div>

          <div className="shrink-0 bg-white/5 rounded-2xl p-4 border border-white/15 space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">Pilih Lokasi Cabang Anda</label>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#BA935D]" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent font-serif font-bold text-base text-white focus:outline-none cursor-pointer"
              >
                <option value="Sudirman Flagship" className="text-gray-900">Sudirman Flagship</option>
                <option value="Kemang Artisan Bar" className="text-gray-900">Kemang Artisan Bar</option>
                <option value="Senayan City Lounge" className="text-gray-900">Senayan City Lounge</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Controls */}
      <section className="bg-[#FAF6F0] py-8 border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`min-h-[44px] rounded-xl px-5 text-xs font-bold transition-all shrink-0 ${
                    activeCategory === cat
                      ? 'bg-[#12100E] text-[#BA935D] shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu racikan atau bahan..."
                className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs font-medium focus:border-[#BA935D] focus:outline-none"
              />
            </div>
          </div>

          {/* Dietary Flags Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mr-2">
              <Filter size={13} /> Filter Diet:
            </span>
            {DIETARY_FLAGS.map((flag) => {
              const isActive = activeDietary.includes(flag);
              return (
                <button
                  key={flag}
                  onClick={() => toggleDietaryFilter(flag)}
                  className={`min-h-[36px] flex items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold transition-all border ${
                    isActive
                      ? 'bg-[#BA935D] border-[#BA935D] text-[#12100E] shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#BA935D]'
                  }`}
                >
                  {isActive && <Check size={12} />}
                  <span>{flag}</span>
                </button>
              );
            })}
            {activeDietary.length > 0 && (
              <button
                onClick={() => setActiveDietary([])}
                className="text-[11px] text-red-600 font-bold underline ml-2"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-16 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-gray-800">
              {activeCategory} · <span className="text-sm font-sans font-normal text-gray-500">{filteredItems.length} hidangan tersedia</span>
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl bg-white border border-gray-200 p-16 text-center space-y-4">
              <Coffee size={48} className="text-gray-300 mx-auto animate-bounce" />
              <p className="font-serif text-xl font-bold text-gray-700">Tidak menemukan sajian yang sesuai filter</p>
              <p className="text-xs text-gray-400">Coba hapus kata kunci pencarian atau reset filter diet Anda.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border-2 border-gray-100 p-6 sm:p-7 shadow-sm transition-all hover:shadow-md hover:border-[#BA935D]/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="rounded-full bg-[#FAF6F0] border border-[#BA935D]/30 px-3 py-1 text-[11px] font-bold text-[#BA935D] uppercase tracking-wider">
                        {item.category}
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-[#12100E] text-white px-2.5 py-0.5 text-[10px] font-bold tracking-wide">
                          ★ {item.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-gray-800 leading-snug">{item.name}</h3>
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed min-h-[40px]">{item.desc}</p>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {item.dietary.map((d) => (
                        <span key={d} className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Harga</span>
                      <span className="font-serif text-2xl font-bold text-[#12100E]">{fmt(item.price)}</span>
                    </div>

                    <Link
                      href={`/order?item=${item.id}`}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#12100E] px-5 py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] active:scale-95 transition-all shadow-md"
                    >
                      <ShoppingBag size={15} />
                      <span>Pesan Online</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
