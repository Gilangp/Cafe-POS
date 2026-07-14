'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Coffee,
  X,
  Check,
  Loader2,
  Sparkles,
  DollarSign,
  Utensils,
  Store,
  Tag,
  BookOpen,
} from 'lucide-react';
import { useProducts, CatalogProduct } from '@/hooks/useProducts';
import { PermissionGuard } from '@/components/permission-guard';
import { useBranchStore } from '@/store/branch-store';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function MenuPage() {
  const {
    products,
    categories,
    recipes,
    loading: catalogLoading,
    usingLive,
    refetch,
    overrideBranchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts({ includeInactive: true });

  const activeBranchId = useBranchStore((s) => s.activeBranchId);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<string | number | null>(null);

  // Price Override Modal (MNU-002 / MNU-003)
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideTargetProduct, setOverrideTargetProduct] = useState<CatalogProduct | null>(null);
  const [overridePriceInput, setOverridePriceInput] = useState('');
  const [overrideStockInput, setOverrideStockInput] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Form fields for Add/Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string | number>('');
  const [formPrice, setFormPrice] = useState('35000');
  const [formSku, setFormSku] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formRecipeId, setFormRecipeId] = useState<string | number>('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(null), 4000);
  };

  // Toggle Status 86'd (MNU-004)
  const toggleAvailableStatus = async (product: CatalogProduct) => {
    try {
      const newStatus = !product.is_available;
      await overrideBranchProduct(product.id, {
        is_available: newStatus,
        price: product.effective_price,
        stock_quantity: product.branch_stock_quantity || 0,
      });
      showNotification(`Status ${product.name} diperbarui menjadi ${newStatus ? 'Tersedia' : 'Habis (86\'d)'}`);
    } catch (err) {
      console.error('Failed toggle 86 status:', err);
      showNotification('Gagal memperbarui status ketersediaan');
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditId(null);
    setFormName('');
    setFormCategory(categories[0]?.id || 1);
    setFormPrice('35000');
    setFormSku('');
    setFormDesc('');
    setFormRecipeId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CatalogProduct) => {
    setModalMode('edit');
    setEditId(item.id);
    setFormName(item.name);
    setFormCategory(item.category_id || categories[0]?.id || 1);
    setFormPrice((item.effective_price || item.price).toString());
    setFormSku(item.sku || '');
    setFormDesc(item.description || '');
    setFormRecipeId(item.recipe_id || '');
    setIsModalOpen(true);
  };

  const handleOpenOverride = (item: CatalogProduct) => {
    setOverrideTargetProduct(item);
    setOverridePriceInput((item.effective_price || item.price).toString());
    setOverrideStockInput(item.branch_stock_quantity !== null && item.branch_stock_quantity !== undefined ? item.branch_stock_quantity.toString() : '');
    setIsOverrideModalOpen(true);
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTargetProduct) return;
    setOverrideLoading(true);
    try {
      const priceVal = parseFloat(overridePriceInput) || overrideTargetProduct.price;
      const stockVal = overrideStockInput !== '' ? parseInt(overrideStockInput, 10) : undefined;
      await overrideBranchProduct(overrideTargetProduct.id, {
        price: priceVal,
        is_available: overrideTargetProduct.is_available,
        stock_quantity: stockVal,
      });
      showNotification(`Harga khusus cabang untuk ${overrideTargetProduct.name} berhasil disimpan!`);
      setIsOverrideModalOpen(false);
    } catch (err) {
      console.error('Error overriding price:', err);
      showNotification('Gagal menyimpan timpaan harga cabang');
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleDeleteItem = async (id: string | number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus produk "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showNotification(`Produk "${name}" berhasil dihapus.`);
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('Gagal menghapus produk.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    setFormLoading(true);
    try {
      const numPrice = parseFloat(formPrice) || 0;
      const payload = {
        name: formName,
        category_id: formCategory,
        base_price: numPrice,
        sku: formSku || undefined,
        description: formDesc || 'Racikan spesial dari Velvra Coffee Shop.',
        recipe_id: formRecipeId || null,
        is_active: true,
      };

      if (modalMode === 'add') {
        await createProduct(payload);
        showNotification('Produk baru dan tautan resep berhasil disimpan!');
      } else if (modalMode === 'edit' && editId !== null) {
        await updateProduct(editId, payload);
        showNotification('Produk berhasil diperbarui!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      showNotification('Terjadi kesalahan saat menyimpan produk');
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCat =
      categoryFilter === 'all' ||
      String(p.category_id) === String(categoryFilter) ||
      p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Katalog Menu & Override Harga</h1>
            {usingLive ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Terhubung API Laravel V1
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Lokal / Offline
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Kelola produk, status 86&apos;d (<span className="font-semibold text-gray-700">MNU-004</span>), harga cabang (<span className="font-semibold text-gray-700">MNU-003</span>), dan tautan resep (<span className="font-semibold text-gray-700">MNU-005</span>).
          </p>
        </div>

        <PermissionGuard permission="menu.create">
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
          >
            <Plus size={16} /> Tambah Menu Baru
          </button>
        </PermissionGuard>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            categoryFilter === 'all'
              ? 'bg-[#12100E] text-[#BA935D] shadow-md'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(String(cat.id))}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              categoryFilter === String(cat.id)
                ? 'bg-[#12100E] text-[#BA935D] shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama menu atau SKU..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
        />
      </div>

      {/* Product Cards Grid */}
      {catalogLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={36} className="animate-spin mb-3 text-[#BA935D]" />
          <p className="text-sm font-semibold">Memuat data katalog menu dari server...</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => {
            const currentPrice = product.effective_price !== undefined ? product.effective_price : product.price;
            const isOverridden = product.effective_price !== undefined && product.effective_price !== product.price;
            const costVal = product.cost || Math.round(currentPrice * 0.3);
            const margin = Math.round(((currentPrice - costVal) / (currentPrice || 1)) * 100);

            return (
              <div
                key={product.id}
                className={`rounded-2xl bg-white border-2 shadow-sm overflow-hidden transition-all flex flex-col hover:shadow-md ${
                  product.is_available ? 'border-gray-100' : 'border-dashed border-red-200 bg-red-50/20'
                }`}
              >
                <div className="relative flex items-center justify-center h-32 bg-[#FAF6F0] text-[#BA935D]">
                  <Coffee size={44} />
                  {isOverridden && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-[#BA935D] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Store size={10} /> Harga Cabang
                    </span>
                  )}
                  {product.recipe_id && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-amber-300 shadow-sm">
                      <BookOpen size={10} /> Terhubung Resep
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">{product.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs font-semibold text-[#BA935D] uppercase tracking-wider">
                            {product.category}
                          </span>
                          {product.sku && (
                            <span className="text-[10px] text-gray-400 font-mono">({product.sku})</span>
                          )}
                        </div>
                      </div>

                      {/* Quick Toggle Status 86'd (MNU-004) */}
                      <button
                        onClick={() => toggleAvailableStatus(product)}
                        title={product.is_available ? 'Klik untuk set Habis (86\'d)' : 'Klik untuk aktifkan produk'}
                        className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all shadow-sm ${
                          product.is_available
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {product.is_available ? <Eye size={11} /> : <EyeOff size={11} />}
                        {product.is_available ? 'Tersedia' : '86\'d (Habis)'}
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between text-sm mt-2">
                      <div>
                        <span className="font-bold text-gray-900 font-serif">{fmt(currentPrice)}</span>
                        {isOverridden && (
                          <span className="line-through text-xs text-gray-400 ml-1.5">{fmt(product.price)}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">Est HPP: {fmt(costVal)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${margin >= 40 ? 'bg-emerald-500' : 'bg-[#BA935D]'}`}
                          style={{ width: `${Math.min(Math.max(margin, 5), 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-600">{margin}% margin</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                    {/* Price Override button (MNU-003) */}
                    <PermissionGuard permission="menu.edit">
                      <button
                        onClick={() => handleOpenOverride(product)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all"
                      >
                        <DollarSign size={13} className="text-[#BA935D]" /> Override Harga Cabang
                      </button>
                    </PermissionGuard>

                    <div className="flex gap-2">
                      <PermissionGuard permission="menu.edit">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-gray-200 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      </PermissionGuard>

                      <PermissionGuard permission="menu.delete">
                        <button
                          onClick={() => handleDeleteItem(product.id, product.name)}
                          className="flex items-center justify-center rounded-xl border border-red-100 px-3 py-1.5 text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal CRUD Tambah/Edit Produk dengan Recipe Linking (MNU-005) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Tambah Menu Produk Baru' : 'Edit Produk Menu'}
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
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sea Salt Caramel Macchiato"
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
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Harga Dasar (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="35000"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  SKU Produk / Kode Intern
                </label>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="ESP-001"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none uppercase font-mono"
                />
              </div>

              {/* Recipe Linking (MNU-005) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Tautkan Resep Baku (Costing RCP)</span>
                  <span className="text-[10px] text-[#BA935D] font-normal">Opsional (MNU-005)</span>
                </label>
                <select
                  value={formRecipeId}
                  onChange={(e) => setFormRecipeId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                >
                  <option value="">-- Tidak ditautkan dengan resep --</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Yield: {r.yield_quantity} {r.yield_unit})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Menautkan resep mengaktifkan kalkulasi HPP otomatis berdasar harga bahan baku persediaan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Sajian lezat racikan rahasia Velvra..."
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
                  {modalMode === 'add' ? 'Simpan Menu' : 'Perbarui Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Branch Price Override (MNU-002 / MNU-003) */}
      {isOverrideModalOpen && overrideTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-[#BA935D]" />
                <h3 className="font-serif text-lg font-bold text-gray-800">Timpa Harga Cabang</h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-[#FAF6F0] p-3 mb-4 text-xs space-y-1">
              <p className="font-bold text-gray-800">{overrideTargetProduct.name}</p>
              <p className="text-gray-500">Harga Master Nasional: <span className="font-semibold text-gray-800">{fmt(overrideTargetProduct.price)}</span></p>
              <p className="text-[#BA935D] font-semibold">Berlaku untuk cabang aktif saat ini.</p>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Harga Khusus Cabang (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={overridePriceInput}
                  onChange={(e) => setOverridePriceInput(e.target.value)}
                  placeholder="38000"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Stok Khusus Cabang (Opsional)
                </label>
                <input
                  type="number"
                  value={overrideStockInput}
                  onChange={(e) => setOverrideStockInput(e.target.value)}
                  placeholder="Kosongkan jika unlimited"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={overrideLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-[#BA935D] px-5 py-2 text-xs font-bold text-white hover:bg-[#a6804b] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {overrideLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Harga Cabang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
