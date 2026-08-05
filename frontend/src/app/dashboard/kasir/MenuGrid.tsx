'use client';

import React from 'react';
import { Search, Coffee, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { PosMenu } from '@/shared/services/pos.service';

interface MenuGridProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filteredMenus: PosMenu[];
  isMenuAvailable: (menu: PosMenu) => boolean;
  formatCurrency: (amount: number) => string;
  cart: { addItem: (item: any) => void };
  setSelectedMenuForVariants: (menu: PosMenu | null) => void;
  setSelectedVariants: (vars: Record<string, any>) => void;
  setVariantNote: (note: string) => void;
}

const MenuGrid = React.memo(function MenuGrid({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  filteredMenus,
  isMenuAvailable,
  formatCurrency,
  cart,
  setSelectedMenuForVariants,
  setSelectedVariants,
  setVariantNote,
}: MenuGridProps) {
  return (
    <>
      <div className="p-4 border-b border-border space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background focus:border-accent focus:outline-none text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-accent text-primary shadow-sm font-semibold'
                  : 'bg-card border border-border text-muted-foreground hover:border-accent hover:text-accent font-medium'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenus.map((menu) => {
            const available = isMenuAvailable(menu);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={menu.id}
                onClick={() => {
                  if (!available) return;
                  if (menu.variant_groups && menu.variant_groups.length > 0) {
                    setSelectedMenuForVariants(menu);
                    setSelectedVariants({});
                    setVariantNote('');
                  } else {
                    cart.addItem({
                      menu_id: menu.id,
                      name: menu.name,
                      price: Number(menu.price),
                      quantity: 1,
                      note: '',
                      image: menu.image,
                    });
                  }
                }}
                className={`bg-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:border-accent/30 group flex flex-col ${
                  !available ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                }`}
              >
                <div className="aspect-square bg-muted/30 relative overflow-hidden">
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className={`w-full h-full object-cover ${available ? 'group-hover:scale-110' : ''} transition-transform duration-500`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <Coffee size={48} />
                    </div>
                  )}
                  {available ? (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Plus size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-card/60 flex items-center justify-center">
                      <span className="text-white font-black text-sm bg-red-500 px-3 py-1 rounded-lg">Habis</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-bold font-heading text-foreground leading-tight mb-1 line-clamp-2">
                    {menu.name}
                  </h3>
                  <div className="mt-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    {formatCurrency(Number(menu.price))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {filteredMenus.length === 0 && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Tidak ada menu yang sesuai pencarian.
          </div>
        )}
      </div>
    </>
  );
});

export default MenuGrid;
