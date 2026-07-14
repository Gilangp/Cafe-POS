'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown, Eye, EyeOff } from 'lucide-react';

const categories = ['Espresso', 'Latte', 'Cold Brew', 'Matcha', 'Pastry', 'Makanan'];

const products = [
  { id: 1, name: 'Velvet Espresso', category: 'Espresso', price: 30000, cost: 8000, stock: 'Tersedia', available: true, image: '☕' },
  { id: 2, name: 'Caramel Latte', category: 'Latte', price: 38000, cost: 11000, stock: 'Tersedia', available: true, image: '🥛' },
  { id: 3, name: 'Iced Macchiato', category: 'Latte', price: 42000, cost: 13000, stock: 'Tersedia', available: true, image: '🧊' },
  { id: 4, name: 'Golden Cappuccino', category: 'Espresso', price: 35000, cost: 10000, stock: 'Tersedia', available: true, image: '☕' },
  { id: 5, name: 'Signature Cold Brew', category: 'Cold Brew', price: 36000, cost: 9000, stock: 'Tersedia', available: true, image: '🧋' },
  { id: 6, name: 'Uji Matcha Latte', category: 'Matcha', price: 40000, cost: 14000, stock: 'Stok Habis', available: false, image: '🍵' },
  { id: 7, name: 'Chocolate Brownie', category: 'Pastry', price: 45000, cost: 18000, stock: 'Tersedia', available: true, image: '🍫' },
  { id: 8, name: 'Butter Croissant', category: 'Pastry', price: 32000, cost: 12000, stock: 'Tersedia', available: true, image: '🥐' },
  { id: 9, name: 'Avocado Toast', category: 'Makanan', price: 60000, cost: 22000, stock: 'Tersedia', available: true, image: '🥑' },
  { id: 10, name: 'Club Sandwich', category: 'Makanan', price: 65000, cost: 25000, stock: 'Tersedia', available: true, image: '🥪' },
];

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [items, setItems] = useState(products);

  const toggleAvailable = (id: number) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p));
  };

  const filtered = items.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Menu & Produk</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} produk terdaftar</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...categories].map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${categoryFilter === cat ? 'bg-[#12100E] text-[#BA935D]' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'}`}>
            {cat === 'all' ? 'Semua' : cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none" />
      </div>

      {/* Product Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(product => {
          const margin = Math.round(((product.price - product.cost) / product.price) * 100);
          return (
            <div key={product.id} className={`rounded-2xl bg-white border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${product.available ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-70'}`}>
              <div className="flex items-center justify-center h-32 bg-[#FAF6F0] text-6xl">{product.image}</div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{product.name}</h3>
                    <span className="text-xs text-gray-400">{product.category}</span>
                  </div>
                  <button onClick={() => toggleAvailable(product.id)}
                    className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${product.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {product.available ? <Eye size={10} /> : <EyeOff size={10} />}
                    {product.available ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-[#BA935D]">{fmt(product.price)}</span>
                  <span className="text-xs text-gray-400">HPP: {fmt(product.cost)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-[#BA935D]" style={{ width: `${margin}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-[#BA935D]">{margin}% margin</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
