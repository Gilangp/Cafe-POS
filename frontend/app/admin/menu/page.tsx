'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Coffee, X, Check, Loader2, Sparkles } from 'lucide-react';
import { useProducts, CatalogProduct } from '@/hooks/useProducts';
import { supabase } from '@/lib/supabase';

const categories = ['Espresso', 'Latte', 'Cold Brew', 'Matcha', 'Pastry', 'Makanan'];

const defaultProducts = [
  { id: 1, name: 'Velvet Espresso', category: 'Espresso', price: 30000, cost: 8000, stock: 'Tersedia', available: true },
  { id: 2, name: 'Caramel Latte', category: 'Latte', price: 38000, cost: 11000, stock: 'Tersedia', available: true },
  { id: 3, name: 'Iced Macchiato', category: 'Latte', price: 42000, cost: 13000, stock: 'Tersedia', available: true },
  { id: 4, name: 'Golden Cappuccino', category: 'Espresso', price: 35000, cost: 10000, stock: 'Tersedia', available: true },
  { id: 5, name: 'Signature Cold Brew', category: 'Cold Brew', price: 36000, cost: 9000, stock: 'Tersedia', available: true },
  { id: 6, name: 'Uji Matcha Latte', category: 'Matcha', price: 40000, cost: 14000, stock: 'Stok Habis', available: false },
  { id: 7, name: 'Chocolate Brownie', category: 'Pastry', price: 45000, cost: 18000, stock: 'Tersedia', available: true },
  { id: 8, name: 'Butter Croissant', category: 'Pastry', price: 32000, cost: 12000, stock: 'Tersedia', available: true },
  { id: 9, name: 'Avocado Toast', category: 'Makanan', price: 60000, cost: 22000, stock: 'Tersedia', available: true },
  { id: 10, name: 'Club Sandwich', category: 'Makanan', price: 65000, cost: 25000, stock: 'Tersedia', available: true },
];

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function MenuPage() {
  const { products: cloudProducts, loading: catalogLoading, usingLive, refetch } = useProducts({ includeInactive: true });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Local state fallback when offline
  const [localItems, setLocalItems] = useState(defaultProducts);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<string | number | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Espresso');
  const [formPrice, setFormPrice] = useState('35000');
  const [formCost, setFormCost] = useState('10000');
  const [formDesc, setFormDesc] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const displayItems = (usingLive && cloudProducts && cloudProducts.length > 0)
    ? cloudProducts.map((p, idx) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Espresso',
        price: p.price,
        cost: Math.round(p.price * 0.3), // default 30% HPP estimate if not stored
        stock: p.is_available !== false ? 'Tersedia' : 'Stok Habis',
        available: p.is_available !== false,
        description: p.description || '',
      }))
    : localItems.map(p => ({
        ...p,
        description: 'Sajian istimewa Velvra Coffee Shop',
      }));

  const toggleAvailable = async (id: string | number, currentStatus: boolean) => {
    if (usingLive && typeof id === 'string') {
      try {
        const { error } = await supabase
          .from('products')
          .update({ is_active: !currentStatus })
          .eq('id', id);
        if (!error) {
          refetch();
        }
      } catch (err) {
        console.warn('Cloud toggle error:', err);
      }
    } else {
      setLocalItems(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p));
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditId(null);
    setFormName('');
    setFormCategory('Espresso');
    setFormPrice('35000');
    setFormCost('10000');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setEditId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price.toString());
    setFormCost(item.cost.toString());
    setFormDesc(item.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Yakin ingin menghapus menu ini?')) return;

    if (usingLive && typeof id === 'string') {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          refetch();
          setActionStatus('Produk berhasil dihapus dari cloud!');
          setTimeout(() => setActionStatus(null), 3000);
        }
      } catch (err) {
        console.warn('Cloud delete error:', err);
      }
    } else {
      setLocalItems(prev => prev.filter(p => p.id !== id));
      setActionStatus('Produk berhasil dihapus!');
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    setFormLoading(true);
    const numPrice = parseInt(formPrice, 10) || 0;
    const numCost = parseInt(formCost, 10) || 0;

    if (usingLive) {
      try {
        if (modalMode === 'add') {
          const { error } = await supabase.from('products').insert([
            {
              name: formName,
              base_price: numPrice,
              description: formDesc || 'Racikan spesial dari Velvra Coffee.',
              is_active: true,
              image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
              tags: ['Special'],
            },
          ]);
          if (!error) {
            refetch();
            setActionStatus('Produk baru berhasil ditambahkan ke Supabase Cloud!');
          }
        } else if (modalMode === 'edit' && typeof editId === 'string') {
          const { error } = await supabase
            .from('products')
            .update({
              name: formName,
              base_price: numPrice,
              description: formDesc,
            })
            .eq('id', editId);
          if (!error) {
            refetch();
            setActionStatus('Produk berhasil diperbarui di Supabase Cloud!');
          }
        }
      } catch (err) {
        console.warn('Cloud save error:', err);
      }
    } else {
      if (modalMode === 'add') {
        setLocalItems(prev => [
          {
            id: Date.now(),
            name: formName,
            category: formCategory,
            price: numPrice,
            cost: numCost,
            stock: 'Tersedia',
            available: true,
          },
          ...prev,
        ]);
        setActionStatus('Produk baru berhasil ditambahkan!');
      } else if (modalMode === 'edit') {
        setLocalItems(prev =>
          prev.map(p => (p.id === editId ? { ...p, name: formName, category: formCategory, price: numPrice, cost: numCost } : p))
        );
        setActionStatus('Produk berhasil diperbarui!');
      }
    }

    setFormLoading(false);
    setIsModalOpen(false);
    setTimeout(() => setActionStatus(null), 4000);
  };

  const filtered = displayItems.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Cloud Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Menu & Produk</h1>
            {usingLive ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Live Supabase Cloud
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Offline / Lokal
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{displayItems.length} produk terdaftar di database</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
        >
          <Plus size={16} /> Tambah Produk Baru
        </button>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          {actionStatus}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['all', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              categoryFilter === cat ? 'bg-[#12100E] text-[#BA935D] shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
            }`}
          >
            {cat === 'all' ? 'Semua' : cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
        />
      </div>

      {/* Product Grid */}
      {catalogLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={36} className="animate-spin mb-3 text-[#BA935D]" />
          <p className="text-sm font-semibold">Memuat katalog dari Supabase...</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(product => {
            const margin = Math.round(((product.price - product.cost) / (product.price || 1)) * 100);
            return (
              <div
                key={product.id}
                className={`rounded-2xl bg-white border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  product.available ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-center h-32 bg-[#FAF6F0] text-[#BA935D]">
                  <Coffee size={44} />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{product.name}</h3>
                      <span className="text-xs font-semibold text-[#BA935D] uppercase tracking-wider">{product.category}</span>
                    </div>
                    <button
                      onClick={() => toggleAvailable(product.id, product.available)}
                      className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                        product.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {product.available ? <Eye size={11} /> : <EyeOff size={11} />}
                      {product.available ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900 font-serif">{fmt(product.price)}</span>
                    <span className="text-xs text-gray-400">Est HPP: {fmt(product.cost)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-[#BA935D]" style={{ width: `${Math.min(margin, 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-[#BA935D]">{margin}% margin</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center justify-center rounded-lg border border-red-100 p-1.5 text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal CRUD Tambah/Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Produk / Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Contoh: Sea Salt Caramel Latte"
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
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Harga Jual (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="35000"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Estimasi HPP (IDR)
                </label>
                <input
                  type="number"
                  value={formCost}
                  onChange={e => setFormCost(e.target.value)}
                  placeholder="10000"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Sajian lezat dari racikan rahasia Velvra..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-[#BA935D] focus:outline-none"
                />
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
                  {modalMode === 'add' ? 'Simpan Produk' : 'Perbarui Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
