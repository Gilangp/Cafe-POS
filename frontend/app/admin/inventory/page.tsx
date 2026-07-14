'use client';

import { useState } from 'react';
import { Search, AlertTriangle, TrendingDown, Package, Plus, ChevronDown, Sparkles, Check, X, Loader2, Minus, RefreshCw } from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function InventoryPage() {
  const { items, loading, usingLive, adjustStock, addItem, refetch } = useInventory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Kopi');
  const [formStock, setFormStock] = useState('500');
  const [formUnit, setFormUnit] = useState('gram');
  const [formThreshold, setFormThreshold] = useState('100');
  const [formCost, setFormCost] = useState('15000');
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const criticalItems = items.filter((i) => i.stock <= i.threshold);
  const warningItems = items.filter((i) => i.stock > i.threshold && i.stock <= i.threshold * 1.5);

  const stockLevel = (item: InventoryItem) => {
    const pct = (item.stock / (item.threshold || 1)) * 100;
    if (pct <= 100) return { color: 'bg-red-500', pct: Math.min(pct, 100), label: 'Kritis' };
    if (pct <= 150) return { color: 'bg-amber-400', pct: Math.min(pct / 1.5, 100), label: 'Hampir Habis' };
    return { color: 'bg-green-500', pct: Math.min(pct / 3, 100), label: 'Aman' };
  };

  const handleQuickAdjust = async (id: string | number, delta: number) => {
    await adjustStock(id, delta);
    setActionStatus(`Stok berhasil ${delta > 0 ? 'ditambahkan' : 'dikurangi'}!`);
    setTimeout(() => setActionStatus(null), 2500);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setFormLoading(true);
    await addItem({
      name: formName,
      category: formCategory,
      stock: Number(formStock) || 0,
      unit: formUnit,
      threshold: Number(formThreshold) || 10,
      cost: Number(formCost) || 10000,
    });

    setFormLoading(false);
    setIsModalOpen(false);
    setFormName('');
    setActionStatus('Bahan baku baru berhasil ditambahkan ke inventaris!');
    setTimeout(() => setActionStatus(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Inventori & Stok</h1>
            {usingLive ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Live Supabase Cloud
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Offline / Resep Standar
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Terintegrasi otomatis dengan pemotongan resep (*Recipe-based deduction*) KDS Dapur
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            title="Refresh Data"
            className="flex items-center justify-center rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:border-[#BA935D] hover:text-[#BA935D] transition-colors bg-white shadow-sm"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Tambah Item
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          {actionStatus}
        </div>
      )}

      {/* Alert Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 font-serif">{criticalItems.length}</p>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Stok Kritis (Bawah Minimum)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600 font-serif">{warningItems.length}</p>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Hampir Habis (Perhatian)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-white">
            <Package size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 font-serif">{items.length}</p>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Item Bahan Baku</p>
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
            placeholder="Cari nama bahan baku (susu, kopi, sirup...)"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 size={36} className="animate-spin mb-3 text-[#BA935D]" />
          <p className="text-sm font-semibold">Memuat data inventaris...</p>
        </div>
      ) : (
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
                  <th className="px-6 py-4 text-center">Sesuaikan Cepat</th>
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
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{item.category}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${level.label === 'Kritis' ? 'text-red-600' : level.label === 'Hampir Habis' ? 'text-amber-600' : 'text-gray-900 font-mono'}`}>
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
                      <td className="px-6 py-4 text-sm text-gray-700 font-serif">{fmt(item.cost)}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{item.lastUpdate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleQuickAdjust(item.id, -5)}
                            title="Kurangi -5"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item.id, 10)}
                            title="Tambah +10"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Item Bahan Baku */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-800">Tambah Bahan Baku Baru</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Bahan Baku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sirup Hazelnut Monin"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  >
                    {['Kopi', 'Dairy', 'Sirup', 'Baking', 'Bahan Dasar', 'Kemasan', 'Minuman'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  >
                    {['gram', 'kg', 'liter', 'ml', 'botol', 'pack', 'pcs'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Min. Kritis</label>
                  <input
                    type="number"
                    required
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Harga/Satuan</label>
                  <input
                    type="number"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Bahan Baku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
