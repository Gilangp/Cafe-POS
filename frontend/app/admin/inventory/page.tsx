'use client';

import { useState } from 'react';
import { Search, AlertTriangle, TrendingDown, Package, Plus, ChevronDown } from 'lucide-react';

const inventoryItems = [
  { id: 1, name: 'Susu Full Cream (Greenfields)', category: 'Dairy', stock: 45, unit: 'liter', threshold: 20, cost: 18000, lastUpdate: 'Hari ini' },
  { id: 2, name: 'Susu Oat (Oatly)', category: 'Dairy', stock: 2, unit: 'liter', threshold: 5, cost: 55000, lastUpdate: 'Hari ini' },
  { id: 3, name: 'Biji Kopi Sumatra Dark Roast', category: 'Kopi', stock: 800, unit: 'gram', threshold: 1000, cost: 350, lastUpdate: 'Kemarin' },
  { id: 4, name: 'Biji Kopi Ethiopia Single Origin', category: 'Kopi', stock: 2400, unit: 'gram', threshold: 500, cost: 420, lastUpdate: 'Kemarin' },
  { id: 5, name: 'Mentega Anchor', category: 'Baking', stock: 3, unit: 'pack', threshold: 6, cost: 22000, lastUpdate: '2 hari lalu' },
  { id: 6, name: 'Tepung Terigu Protein Tinggi', category: 'Baking', stock: 12, unit: 'kg', threshold: 5, cost: 14000, lastUpdate: '3 hari lalu' },
  { id: 7, name: 'Gula Pasir Premium', category: 'Bahan Dasar', stock: 25, unit: 'kg', threshold: 10, cost: 16000, lastUpdate: '3 hari lalu' },
  { id: 8, name: 'Sirup Vanilla Madagascar', category: 'Sirup', stock: 4, unit: 'botol', threshold: 3, cost: 95000, lastUpdate: 'Kemarin' },
  { id: 9, name: 'Cokelat Dark 70% (Valrhona)', category: 'Baking', stock: 1500, unit: 'gram', threshold: 500, cost: 280, lastUpdate: '4 hari lalu' },
  { id: 10, name: 'Bubuk Matcha Uji Ceremonial', category: 'Minuman', stock: 200, unit: 'gram', threshold: 150, cost: 1200, lastUpdate: 'Kemarin' },
];

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(inventoryItems.map((i) => i.category)))];

  const filtered = inventoryItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const criticalItems = inventoryItems.filter((i) => i.stock <= i.threshold);
  const warningItems = inventoryItems.filter((i) => i.stock > i.threshold && i.stock <= i.threshold * 1.5);

  const stockLevel = (item: typeof inventoryItems[0]) => {
    const pct = (item.stock / item.threshold) * 100;
    if (pct <= 100) return { color: 'bg-red-500', pct: Math.min(pct, 100), label: 'Kritis' };
    if (pct <= 150) return { color: 'bg-amber-400', pct: Math.min(pct / 1.5, 100), label: 'Hampir Habis' };
    return { color: 'bg-green-500', pct: Math.min(pct / 3, 100), label: 'Aman' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-gray-800">Inventori</h1>
        <button className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
          <Plus size={16} />
          Tambah Item
        </button>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 font-serif">{criticalItems.length}</p>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Stok Kritis</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600 font-serif">{warningItems.length}</p>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Hampir Habis</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-white">
            <Package size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 font-serif">{inventoryItems.length}</p>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Item</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bahan baku..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:border-[#BA935D] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'Semua Kategori' : c}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4">Nama Bahan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Stok Saat Ini</th>
                <th className="px-6 py-4 w-36">Level Stok</th>
                <th className="px-6 py-4">Min. Stok</th>
                <th className="px-6 py-4">Harga/Satuan</th>
                <th className="px-6 py-4">Update</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => {
                const level = stockLevel(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {level.label === 'Kritis' && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" />}
                        {level.label === 'Hampir Habis' && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
                        <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${level.label === 'Kritis' ? 'text-red-600' : level.label === 'Hampir Habis' ? 'text-amber-600' : 'text-gray-800'}`}>
                        {item.stock.toLocaleString('id-ID')} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${level.color}`} style={{ width: `${level.pct}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${level.label === 'Kritis' ? 'text-red-500' : level.label === 'Hampir Habis' ? 'text-amber-500' : 'text-green-600'}`}>
                          {level.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.threshold} {item.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{fmt(item.cost)}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{item.lastUpdate}</td>
                    <td className="px-6 py-4">
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                        Sesuaikan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
